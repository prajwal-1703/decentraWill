# DecentraWill Security Architecture

## Authentication & Authorization
- **Argon2id**: High-memory and time-cost password hashing.
- **Session Tracking & Revocation**: Access and refresh tokens stored and rotatable in PostgreSQL session store.
- **Step-Up Authentication**: Time-limited proof tokens (`x-step-up-token`) required for high-risk operations (will finalization, sensitive downloads, policy updates, asset transfers, governance votes).
- **Multi-Role Estates**: Roles are scoped to specific estate memberships (`TESTATOR`, `ADVOCATE`, `WITNESS`, `EXECUTOR`, `BENEFICIARY`, `ADMIN`).
- **Default Deny**: Endpoints reject unverified cross-estate access (BOLA/IDOR protection).

## Cryptographic Envelope Encryption
Each document is encrypted per-upload:
1. A fresh 256-bit Data Encryption Key (DEK) is randomly generated.
2. The document is encrypted with the DEK using AES-256-GCM authenticated encryption.
3. The DEK is encrypted with the master key using AES-256-GCM.
4. The encrypted package and wrapped DEK are stored separately from plaintext metadata.
5. Storage objects are keyed with non-guessable random keys.

## Tamper-Evident SHA-256 Audit Trail
Every significant state mutation records an event in the `AuditEvent` table where:
```
currentHash = SHA256(previousHash + canonicalEventPayload)
```
The audit chain is cryptographically verifiable at any time via `/api/v1/admin/audit-verify`.

## Database-Level Concurrency & Integrity
- Unique partial index: `UNIQUE(estateId) WHERE status = 'ACTIVE'` ensures that two concurrent finalization requests cannot produce two simultaneous active versions.
- Unique index: `UNIQUE(proposalId, voterId)` guarantees vote deduplication.
