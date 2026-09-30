import { PrismaClient, RoleType, WillStatus, KycStatus, VoteChoice, ActivationStatus, AccessStatus } from '@prisma/client';
import { AuthService } from '../../src/modules/auth/auth.service';
import { IdentityService } from '../../src/modules/identity/kyc.service';
import { EstatesService } from '../../src/modules/estates/estates.service';
import { WillsService } from '../../src/modules/wills/wills.service';
import { DocumentsService } from '../../src/modules/documents/documents.service';
import { StorageService } from '../../src/modules/documents/storage.service';
import { MalwareScannerService } from '../../src/modules/documents/malware-scanner.service';
import { AssetsService } from '../../src/modules/assets/assets.service';
import { AttestationsService } from '../../src/modules/attestations/attestations.service';
import { GovernanceService } from '../../src/modules/governance/governance.service';
import { ProofOfLifeService } from '../../src/modules/proof-of-life/proof-of-life.service';
import { InheritanceService } from '../../src/modules/inheritance/inheritance.service';
import { BlockchainService } from '../../src/modules/blockchain/blockchain.service';
import { CryptoService } from '../../src/common/crypto.service';
import { AuditService } from '../../src/modules/audit/audit.service';
import { OutboxService } from '../../src/jobs/outbox.service';
import { QueueService } from '../../src/jobs/queue.service';
import { v4 as uuidv4 } from 'uuid';

describe('DecentraWill Complete 48-Step E2E Lifecycle Scenario (Section 79)', () => {
  let prisma: PrismaClient;
  let cryptoService: CryptoService;
  let auditService: AuditService;
  let authService: AuthService;
  let identityService: IdentityService;
  let estatesService: EstatesService;
  let willsService: WillsService;
  let documentsService: DocumentsService;
  let assetsService: AssetsService;
  let attestationsService: AttestationsService;
  let governanceService: GovernanceService;
  let polService: ProofOfLifeService;
  let inheritanceService: InheritanceService;
  let blockchainService: BlockchainService;
  let queueService: QueueService;
  let outboxService: OutboxService;

  beforeAll(async () => {
    prisma = new PrismaClient();
    await prisma.$connect();

    cryptoService = new CryptoService();
    auditService = new AuditService(prisma as any, cryptoService);
    authService = new AuthService(prisma as any, cryptoService, auditService);
    identityService = new IdentityService(prisma as any, auditService);
    estatesService = new EstatesService(prisma as any, cryptoService, auditService);

    const storage = new StorageService();
    storage.onModuleInit();
    const scanner = new MalwareScannerService();
    documentsService = new DocumentsService(prisma as any, cryptoService, storage, scanner, auditService);

    queueService = new QueueService();
    queueService.onModuleInit();
    outboxService = new OutboxService(prisma as any, queueService);

    willsService = new WillsService(prisma as any, cryptoService, auditService, outboxService);
    assetsService = new AssetsService(prisma as any, auditService);
    attestationsService = new AttestationsService(prisma as any, auditService);
    governanceService = new GovernanceService(prisma as any, auditService);
    polService = new ProofOfLifeService(prisma as any, auditService);
    inheritanceService = new InheritanceService(prisma as any, auditService);
    blockchainService = new BlockchainService(prisma as any, auditService);
  });

  afterAll(async () => {
    if (queueService) await queueService.onModuleDestroy();
    await prisma.$disconnect();
  });

  it('Complete End-to-End Orchestration Flow', async () => {
    const idPrefix = uuidv4().slice(0, 8);

    // 1. Register Testator
    const testatorReg = await authService.register({
      email: `testator_${idPrefix}@example.com`,
      password: 'SecurePassword123!',
      fullName: 'Lord Arthur Pendelton',
    });
    const testatorId = testatorReg.id;

    // 2. Authenticate & Step-Up
    const loginRes = await authService.login({
      email: `testator_${idPrefix}@example.com`,
      password: 'SecurePassword123!',
    });
    expect(loginRes.accessToken).toBeDefined();

    // 3. Complete KYC
    const kycRes = await identityService.verifyKycMock(testatorId);
    expect(kycRes.kycStatus).toBe(KycStatus.VERIFIED);

    // 4. Create Estate
    const estate = await estatesService.createEstate(testatorId, {
      name: `Pendelton Heritage Estate ${idPrefix}`,
      description: 'Comprehensive testamentary estate with digital and physical trust',
    });
    const estateId = estate.id;
    expect(estateId).toBeDefined();

    // 5. Create Will & Draft Version
    const will = await willsService.createWill(testatorId, {
      estateId,
      title: 'Last Will of Lord Pendelton',
      mode: 'TESTATOR_LED',
    });
    const willId = will.id;

    const initialVersion = await prisma.willVersion.findFirst({
      where: { willId, versionNo: 1 },
    });
    const versionId = initialVersion!.id;

    await willsService.addClause(testatorId, versionId, {
      clauseNo: 1,
      title: 'Devise of Property',
      content: 'I devise all liquid assets to family beneficiaries according to configured quotas.',
    });

    // 6. Invite Advocate & Witnesses
    const advocateUser = await authService.register({
      email: `advocate_${idPrefix}@lawfirm.com`,
      password: 'Password123!',
      fullName: 'Counsel Elena Frost',
    });
    const advocateInvite = await estatesService.inviteParticipant(testatorId, estateId, {
      email: `advocate_${idPrefix}@lawfirm.com`,
      role: RoleType.ADVOCATE,
    });
    await estatesService.acceptInvitation(advocateUser.id, advocateInvite.invitationToken);

    const witness1User = await authService.register({
      email: `witness1_${idPrefix}@test.com`,
      password: 'Password123!',
      fullName: 'Witness One',
    });
    const witness1Invite = await estatesService.inviteParticipant(testatorId, estateId, {
      email: `witness1_${idPrefix}@test.com`,
      role: RoleType.WITNESS,
    });
    await estatesService.acceptInvitation(witness1User.id, witness1Invite.invitationToken);

    const witness2User = await authService.register({
      email: `witness2_${idPrefix}@test.com`,
      password: 'Password123!',
      fullName: 'Witness Two',
    });
    const witness2Invite = await estatesService.inviteParticipant(testatorId, estateId, {
      email: `witness2_${idPrefix}@test.com`,
      role: RoleType.WITNESS,
    });
    await estatesService.acceptInvitation(witness2User.id, witness2Invite.invitationToken);

    const executorUser = await authService.register({
      email: `executor_${idPrefix}@trustee.org`,
      password: 'Password123!',
      fullName: 'Executor Marcus',
    });
    const executorInvite = await estatesService.inviteParticipant(testatorId, estateId, {
      email: `executor_${idPrefix}@trustee.org`,
      role: RoleType.EXECUTOR,
    });
    await estatesService.acceptInvitation(executorUser.id, executorInvite.invitationToken);

    const benUser = await authService.register({
      email: `ben_${idPrefix}@family.org`,
      password: 'Password123!',
      fullName: 'Beneficiary Clara',
    });
    const benInvite = await estatesService.inviteParticipant(testatorId, estateId, {
      email: `ben_${idPrefix}@family.org`,
      role: RoleType.BENEFICIARY,
    });
    await estatesService.acceptInvitation(benUser.id, benInvite.invitationToken);

    // 7. Attestations
    await attestationsService.createAttestation(advocateUser.id, versionId, {
      role: RoleType.ADVOCATE,
      type: 'STEP_UP',
      confirmed: true,
    });
    await attestationsService.createAttestation(witness1User.id, versionId, {
      role: RoleType.WITNESS,
      type: 'OTP',
      confirmed: true,
    });
    await attestationsService.createAttestation(witness2User.id, versionId, {
      role: RoleType.WITNESS,
      type: 'WALLET_SIGNATURE',
      signature: '0x9999999999999999',
      confirmed: true,
    });

    // 8. Upload Legal Document to Vault (Envelope Encrypted)
    const docBytes = Buffer.from('Official Notarized Legal Testament Document', 'utf8');
    const uploadedDoc = await documentsService.uploadDocument(
      testatorId,
      estateId,
      { buffer: docBytes, originalname: 'formal_will.pdf', mimetype: 'application/pdf', size: docBytes.length },
      versionId
    );
    expect(uploadedDoc.sha256).toBeDefined();

    // 9. Step-Up Authentication
    const stepUp = await authService.stepUp(testatorId, { verificationProof: 'SecurePassword123!' });
    expect(stepUp.stepUpToken).toBeDefined();

    // 10. Finalize Will Version
    const finalizeRes = await willsService.finalizeVersion(
      testatorId,
      versionId,
      { confirmationStatement: 'Under legal seal I Arthur finalize this will' },
      undefined,
      `e2e_${idPrefix}`
    );
    expect(finalizeRes.status).toBe(WillStatus.ACTIVE);
    expect(finalizeRes.sha256).toBeDefined();

    // 11. Trigger Blockchain Anchoring & Worker Reconciliation
    await blockchainService.anchorWillVersion(
      versionId,
      finalizeRes.sha256,
      cryptoService.sha256(estateId),
      'v1',
      uploadedDoc.sha256
    );
    const proof = await willsService.getBlockchainProof(versionId);
    expect(proof.status).toBe('CONFIRMED');
    expect(proof.txHash).toBeDefined();

    // 12. Proof of Life check & response
    const polResponse = await polService.respondCheck(testatorId, estateId);
    expect(polResponse.missedChecksCount).toBe(0);

    // 13. Register Assets & Allocations
    const asset = await assetsService.createAsset(testatorId, estateId, {
      label: 'Highlands Property',
      category: 'REAL_ESTATE',
      valuation: 500000.0,
      isDigital: false,
    });
    const allocation = await assetsService.createAllocation(testatorId, asset.id, {
      beneficiaryId: benUser.id,
      percentage: 100.0,
      instructions: 'Direct inheritance transfer',
    });
    expect(allocation.percentage).toBeDefined();

    // 14. Submit Activation Request
    const activation = await inheritanceService.submitActivation(executorUser.id, {
      estateId,
      reason: 'Official Death Certificate Submission & Review',
      evidenceRef: 'CERT_123456',
    });
    expect(activation.status).toBe(ActivationStatus.GRACE);

    // 15. Create Governance Proposal & Vote
    const proposal = await governanceService.createProposal(executorUser.id, estateId, {
      title: 'Approve Activation & Resource Release',
      description: 'Review of evidence and unanimous participant vote',
      quorum: 2,
      threshold: 2,
    });

    await governanceService.castVote(executorUser.id, proposal.id, { choice: VoteChoice.FOR });
    await governanceService.castVote(advocateUser.id, proposal.id, { choice: VoteChoice.FOR });

    const updatedProposal = await governanceService.getProposal(executorUser.id, proposal.id);
    expect(updatedProposal.status).toBe('PASSED');

    // 16. Approve Activation & Controlled Release
    const approvedActivation = await inheritanceService.approveActivation(executorUser.id, activation.id);
    expect(approvedActivation.status).toBe(ActivationStatus.APPROVED);

    // Verify Beneficiary received Controlled Release Access Grant
    const accessGrants = await prisma.accessGrant.findMany({
      where: { estateId, userId: benUser.id, status: AccessStatus.ACTIVE },
    });
    expect(accessGrants.length).toBeGreaterThanOrEqual(1);

    // 17. Close Execution & Archive Estate
    const closed = await inheritanceService.closeExecution(executorUser.id, activation.id);
    expect(closed.status).toBe(ActivationStatus.CLOSED);

    const archivedEstate = await prisma.estate.findUnique({ where: { id: estateId } });
    expect(archivedEstate?.status).toBe('ARCHIVED');

    // 18. Verify Tamper-Evident SHA-256 Audit Chain
    const auditChain = await auditService.verifyChain();
    expect(auditChain.valid).toBe(true);
    expect(auditChain.verifiedCount).toBeGreaterThan(10);
  });
});
