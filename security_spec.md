# Kaka Cafe — Firestore Security Specification

## 1. Data Invariants
1. **Catalog Integrity**: `products`, `categories`, and `offers` can only be created, updated, or deleted by verified admins (`isAdmin()`). Public storefront queries can only list `active == true` records.
2. **Order Ownership & PII Isolation**: Every `orders/{orderId}` document contains customer PII (`customerName`, `customerPhone`, `customerEmail`, `deliveryAddress`). Only the verified order owner (`userId == request.auth.uid`) or an `isAdmin()` may read or list an order.
3. **Order Initial State & Terminal Locking**: Newly created orders MUST start with `status == 'Pending'` and `userId == request.auth.uid`. Once an order reaches a terminal state (`Completed` or `Cancelled`), non-admin users cannot modify it. Only `isAdmin()` can transition order statuses through `Pending -> Confirmed -> Preparing -> Ready -> Out for Delivery -> Completed` or `Cancelled`.
4. **Bounded Line Items**: Order `items` arrays are bounded (`size() >= 1 && size() <= 25`) with explicit type checks on element zero.
5. **No Self-Assigned Admin Roles**: Users cannot create or mutate documents in `/admins/{userId}` unless they are already verified admins.
6. **Temporal Integrity**: `createdAt` and `updatedAt` MUST match `request.time`, and `createdAt` and `userId` are immutable after creation.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Identity Spoofing on Order Create**: Customer sets `userId` to another user's UID -> MUST return `PERMISSION_DENIED`.
2. **Shadow Field Injection on Order Create**: Payload includes extra key `isPaid: true` or `role: 'admin'` -> MUST return `PERMISSION_DENIED`.
3. **Status Shortcutting on Order Create**: Customer creates an order with `status: 'Completed'` -> MUST return `PERMISSION_DENIED`.
4. **Unverified Email Write**: Authenticated user with `email_verified: false` tries to create an order or newsletter record -> MUST return `PERMISSION_DENIED`.
5. **PII Cross-User Read**: Signed-in User B calls `get(/orders/orderOwnedByUserA)` -> MUST return `PERMISSION_DENIED`.
6. **Blanket Order List Scrape**: Signed-in User B queries `collection('orders')` without `where('userId', '==', uidB)` -> MUST return `PERMISSION_DENIED`.
7. **Non-Admin Product Mutation**: Regular signed-in user tries to create/update/delete `/products/cappuccino` -> MUST return `PERMISSION_DENIED`.
8. **Admin Privilege Escalation**: Regular user attempts `setDoc(doc(db, 'admins', myUid), { role: 'admin', ... })` -> MUST return `PERMISSION_DENIED`.
9. **Resource Exhaustion / ID Poisoning**: Attacker creates `/orders/<200-char-invalid-id>` or injects a 10KB string into `customerName` -> MUST return `PERMISSION_DENIED`.
10. **Terminal State Tampering**: User tries to change `status` on a `Completed` order back to `Pending` -> MUST return `PERMISSION_DENIED`.
11. **Timestamp Forgery**: User submits `createdAt` set to a past date instead of `serverTimestamp()` (`request.time`) -> MUST return `PERMISSION_DENIED`.
12. **Customer Price Tampering After Creation**: User updates `total` or `subtotal` on an existing order -> MUST return `PERMISSION_DENIED`.
