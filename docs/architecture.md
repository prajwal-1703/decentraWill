# DecentraWill Architecture Overview

DecentraWill is an enterprise-grade digital trust, cryptographic verification, asset-management, governance, and inheritance-coordination platform built around the traditional legal will-making process.

## Core Architectural Principle
The traditional legal will remains the authoritative underlying legal artifact. The software does not replace courts, probate, advocates, or witnesses, and does not store raw wills or sensitive PII on public blockchains.

## Tiered Source of Truth
1. **PostgreSQL**: Authoritative source for application state, permissions, workflow states, participants, policies, approvals, and votes.
2. **Object Vault**: Authoritative storage for envelope-encrypted document bytes (AES-256-GCM + wrapped DEK).
3. **Blockchain (Ethereum Sepolia / EVM)**: Authoritative solely for tamper-evident cryptographic anchors, version proofs, and smart contract event reconciliation.
4. **BullMQ / Redis**: Asynchronous event dispatching, job workers, and outbox event processing.

## State Machines
- **Will Version**: `DRAFT` → `VERIFICATION_PENDING` → `FINALIZED` → `ACTIVE` → `SUPERSEDED` → `ACTIVATION_PENDING` → `CONTROLLED_RELEASE` → `CLOSED` → `ARCHIVED`.
- **Document**: `UPLOADING` → `SCANNING` → `VERIFIED` → `AVAILABLE` (or `QUARANTINED`).
- **Activation**: `SUBMITTED` → `EVIDENCE_PENDING` → `VERIFICATION` → `GRACE` → `APPROVED` → `RELEASED` → `CLOSED`.

## Smart Contracts
For detailed documentation on the EVM smart contracts, their individual purpose, interface specifications, and lifecycle coordination, see [Smart Contracts Architecture](file:///home/attacker/Desktop/decentraWill/docs/smart-contracts.md).

