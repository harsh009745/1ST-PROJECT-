# Security Specification: VALENCE Firestore Rules

## 1. Data Invariants
- **User Identity Lock**: A user document at `/users/{userId}` can only be read or written by the authenticated owner (`request.auth.uid == userId`) or an authorized administrator.
- **Admin Privilege Protection**: Regular users cannot elevate their own role (`role: 'admin'`) or alter system privileges. Admin status is strictly verified via `/admins/{uid}` or the bootstrapped admin email `meetaryan027@gmail.com`.
- **Booking Identity & Access Isolation**: Client bookings can only be listed/accessed by the client who owns them (`resource.data.userId == request.auth.uid` or `resource.data.userEmail == request.auth.token.email`) or an admin.
- **Payment & Confirmation Integrity**: Status transitions to `PAYMENT_CONFIRMED` or modifications to meeting URLs can only be authorized by administrators or backend service integrations.
- **Volumetric Boundaries**: All string identifiers and string fields are constrained (`size() <= 128` for IDs, `size() <= 500` for URLs, `size() <= 1000` for instructions) to prevent resource exhaustion attacks.

## 2. The "Dirty Dozen" Payloads (Expected: PERMISSION_DENIED)
1. **Unauthenticated User Profile Read**: Anonymous request to `/users/{userId}` without a session token.
2. **Cross-Tenant User Profile Read**: Authenticated user `user_A` attempting to read `/users/user_B`.
3. **Privilege Escalation on User Creation**: New user attempting to set `role: "admin"` on registration.
4. **Role Tampering via Profile Update**: Regular customer sending `update` with `role: "admin"`.
5. **ID Poisoning Attack**: Document ID injection containing invalid regex or oversized characters (`userId: "root/../../etc/passwd"` or 500-char string).
6. **Cross-User Booking Read**: User `user_A` requesting `get` on a consultation booked by `user_B`.
7. **Client Blanket Query Scraping**: Client executing `collection('bookings')` without restricting `where('userId', '==', auth.uid)`.
8. **Malicious Payment Status Override**: Customer client writing `status: "PAYMENT_CONFIRMED"` directly from the browser without server verification.
9. **Direct Razorpay Order ID Manipulation**: Client updating `razorpayOrderId` or `razorpayPaymentId` arbitrarily.
10. **Direct Admin Document Write**: Non-admin attempting to create a document in `/admins/{newAdminUid}`.
11. **Immortal Field Modification**: Attempting to alter `bookingReference` or `createdAt` on an existing booking.
12. **Oversized String Buffer (Denial of Wallet)**: Booking document containing a 2MB string in `meetingInstructions`.

## 3. Test Runner Verification Matrix
All 12 security payloads must return `PERMISSION_DENIED` under the hardened ruleset.
