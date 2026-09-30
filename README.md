# DecentraWill — Production-Oriented MVP Backend

DecentraWill is a secure digital trust, verification, asset-management, governance, and inheritance-coordination platform built around the traditional legal will-making process.

## Technology Stack
- **Runtime**: Node.js v24, TypeScript
- **Framework**: NestJS
- **Database & ORM**: PostgreSQL, Prisma Client
- **Caching & Queues**: Redis, BullMQ
- **Blockchain**: Solidity smart contracts, Viem adapter (Ethereum Sepolia compatible)
- **Object Storage**: Local encrypted vault / MinIO S3-compatible storage
- **Cryptography**: Argon2id password hashing, AES-256-GCM envelope encryption, SHA-256 integrity verification, chained audit hash trail

---

## Directory Structure
```
decentrawill/
├── backend/
│   ├── src/
│   │   ├── config/             # Environment configuration
│   │   ├── common/             # CryptoService, Guards, Exception filters
│   │   ├── database/           # Prisma service and connection
│   │   ├── modules/            # Domain modules (Auth, Estates, Wills, Documents, etc.)
│   │   ├── jobs/               # BullMQ queues and Outbox processor
│   │   ├── app.module.ts
│   │   ├── main.ts             # API server & OpenAPI Swagger
│   │   └── worker.ts           # Background worker daemon
│   ├── prisma/
│   │   ├── schema.prisma       # 35 models with partial unique indexes & enums
│   │   └── seed.ts             # Realistic multi-role seed scenario
│   └── tests/
│       ├── unit/               # Cryptographic & policy unit tests
│       ├── security/           # BOLA/IDOR, immutability, integrity tests
│       ├── concurrency/        # Concurrent finalization & voting tests
│       └── e2e/                # Complete 48-step lifecycle scenario
├── contracts/
│   ├── WillRegistry.sol        # Minimal on-chain version reference
│   ├── IntegrityAnchor.sol     # SHA-256 document & version anchor
│   ├── AttestationRegistry.sol # Cryptographic proof of attestations
│   ├── AssetRegistry.sol       # Registered digital asset references
│   ├── GovernanceRegistry.sol  # Estate proposal decision proofs
│   └── AssetTransferManager.sol# Controlled digital asset transfer manager
├── docs/                       # Architecture, security, and recovery specs
├── docker-compose.yml          # Container configuration (Postgres, Redis, MinIO)
├── .env.example
└── README.md
```

---

## Quickstart & Local Development

### 1. Start Backing Infrastructure (Docker Compose)
```bash
docker compose up -d
```
Starts:
- PostgreSQL on `localhost:5434`
- Redis on `localhost:6380`

### 2. Configure Environment
```bash
cp backend/.env.example backend/.env
```

### 3. Install Dependencies & Generate Database
```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
```

### 4. Run the API Server
```bash
npm run start:dev
```
API runs on `http://localhost:4000`.
Interactive Swagger OpenAPI documentation is available at `http://localhost:4000/api/docs`.

### 5. Run Background Workers
```bash
npm run start:worker
```

### 6. Run the Test Suites
```bash
# Run all tests (Unit, Security, Concurrency, E2E)
npm test -- --forceExit

# Run specific suites
npm run test:unit
npm run test:security
npm run test:concurrency
npm run test:e2e
```

---

## Default Demo Credentials (from Seed)
- **Password for all seeded accounts**: `SecureP@ssw0rd!2026`
- **Testator**: `testator@decentrawill.org`
- **Advocate**: `advocate@lawfirm.com`
- **Witness 1**: `witness1@example.com`
- **Witness 2**: `witness2@example.com`
- **Executor**: `executor@trustee.org`
- **Beneficiaries**: `beneficiary1@family.org`, `beneficiary2@family.org`
- **Admin**: `admin@decentrawill.org`
