# Lifestyle Spark Security Specification (Phase 0 TDD)

## 1. Data Invariants
1. **Owner-Only Profile & PII Isolation**: A user document at `/users/{userId}` is readable only by the verified owner (`request.auth.uid == userId && request.auth.token.email_verified == true`) or a verified admin (`vsandeep442@gmail.com` or `/admins/{uid}`). Unauthenticated or cross-user reads and blanket `list` queries on `/users` are strictly denied.
2. **No Self-Assigned Privileges or Paid Subscriptions**: On `/users/{userId}` create, `role` MUST equal `'member'` and `subscriptionStatus` MUST equal `'free'`. Non-admin profile updates MUST keep `uid`, `email`, `role`, `subscriptionStatus`, `subscriptionPlan`, `subscriptionCurrency`, and `createdAt` immutable.
3. **Master Gate Parent Synchronization**: Every subcollection record under `/users/{userId}/dietPlans/{planId}`, `/users/{userId}/workoutLogs/{logId}`, and `/users/{userId}/favoriteRecipes/{recipeId}` MUST verify parent `/users/{userId}` existence via `exists()`, verify `userId == userId` and `userId == request.auth.uid`, and validate all document IDs with `isValidId()`.
4. **Server Timestamp Integrity**: `createdAt`, `updatedAt`, `completedAt`, and `savedAt` MUST equal `request.time` at write time.
5. **Query Enforcer**: Subcollection `list` operations MUST evaluate `resource.data.userId == request.auth.uid` without `get()`/`exists()` reads.

## 2. The "Dirty Dozen" Payloads (Expected: PERMISSION_DENIED)
1. **Unauthenticated Read**: Anonymous `get` on `/users/u1`.
2. **Email Spoofing Admin Escalation**: User claiming `email: 'vsandeep442@gmail.com'` with `email_verified: false` reading `/users/otherUser`.
3. **Self-Assigned Paid Tier on Create**: Creating `/users/u1` with `subscriptionStatus: 'active'`.
4. **Self-Assigned Admin Role on Create**: Creating `/users/u1` with `role: 'admin'`.
5. **Shadow Update / Ghost Field Injection**: Updating `/users/u1` including `subscriptionStatus: 'active'` or `isVerified: true`.
6. **PII Blanket List Scraping**: Executing `list` query across `/users`.
7. **Cross-Tenant Subcollection Read/Write**: Signed-in user `u2` reading `/users/u1/dietPlans/p1`.
8. **Orphan Subcollection Create**: Creating `/users/nonexistent/workoutLogs/w1` when parent `/users/nonexistent` does not exist.
9. **Identity Spoofing on Subcollection**: Creating `/users/u1/workoutLogs/w1` with `userId: 'u2'`.
10. **ID Poisoning Attack**: Targeting `/users/../../etc/passwd` or 500-char ID string (`!isValidId`).
11. **Value Poisoning (Calorie Bounds / Oversized Strings)**: Creating `/users/u1` with `dailyCalorieGoal: 999999` or 5,000-character `fullName`.
12. **Client-Forged Timestamp**: Creating `/users/u1/dietPlans/p1` with `createdAt: '2020-01-01T00:00:00Z'` instead of `request.time`.
