# Security Specification & Invariants — GoTech SV

## 1. Data Invariants
1. **Default-Deny Baseline:** Every Firestore path outside explicit allowlisted matches is denied for all reads and writes.
2. **No Secret Exposure:** `admin_settings/knas_access` (containing `verifierHash`) and `admin_auth_checks/session` (containing `proof`) have `allow get, list: if false;` so neither hashes nor proofs can ever be read by any client.
3. **One-Time Initialization:** `admin_settings/knas_access` and `admin_settings/status` can only be created together atomically when neither document exists (`!exists(...)` + `existsAfter(...)`).
4. **Atomic Password Proof Gate:** Any update to `admin_settings/knas_access` and any `create`, `update`, or `delete` on `catalog_products` or `catalog_bundles` must occur inside an atomic `writeBatch` alongside `admin_auth_checks/session` where `hashing.sha256(proof).toHexString().lower() == verifierHash` and `updatedAt == request.time`.
5. **Strict Schema & Bounds:** All strings validate `.size()` bounds and hex/image URI regexes (`^[a-f0-9]{64}$` for hashes/proofs, max 250000 chars for product images), `deleted` is strictly boolean when present, numbers enforce `[0, 10000]`, timestamps enforce `request.time`, and updates strictly constrain `affectedKeys().hasOnly(...)`.

## 2. "Dirty Dozen" Adversarial Payloads (Expected: PERMISSION_DENIED)
1. **Read `admin_settings/knas_access` directly:** `getDoc(admin_settings/knas_access)` -> denied (`allow get: if false`).
2. **List `admin_settings` collection:** `getDocs(admin_settings)` -> denied (`allow list: if false`).
3. **Read or list `admin_auth_checks`:** `getDoc(admin_auth_checks/session)` -> denied (`allow get, list: if false`).
4. **Overwrite `admin_settings/knas_access` via `create` after setup:** Fails because document exists and `status` already exists.
5. **Update `admin_settings/knas_access` without `admin_auth_checks/session` in batch:** Fails `isVerifiedPasswordBatch()`.
6. **Submit invalid `proof` to `admin_auth_checks/session`:** Fails `hashing.sha256(proof).toHexString().lower() == verifierHash`.
7. **Shadow field on `admin_settings/knas_access`:** `{ verifierHash, updatedAt, extra: true }` -> fails `keys().hasOnly(...)`.
8. **Invalid `verifierHash` format:** `{ verifierHash: "short", updatedAt }` -> fails length/regex check.
9. **Client-forged `updatedAt` timestamp:** `{ verifierHash, updatedAt: new Date(0) }` -> fails `updatedAt == request.time`.
10. **Create/update `catalog_products` without atomic proof batch:** Fails `isVerifiedPasswordBatch()`.
11. **Delete `catalog_products` without atomic proof batch:** Fails `isVerifiedPasswordBatch()`.
12. **Out-of-bounds price or empty name on `catalog_products`/`catalog_bundles`:** Fails `isValidCatalogProduct` / `isValidCatalogBundle`.
