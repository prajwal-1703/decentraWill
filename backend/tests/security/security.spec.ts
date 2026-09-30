import { PrismaClient, RoleType, WillStatus, KycStatus, DocumentStatus } from '@prisma/client';
import { DocumentsService } from '../../src/modules/documents/documents.service';
import { StorageService } from '../../src/modules/documents/storage.service';
import { MalwareScannerService } from '../../src/modules/documents/malware-scanner.service';
import { CryptoService } from '../../src/common/crypto.service';
import { AuditService } from '../../src/modules/audit/audit.service';
import { WillsService } from '../../src/modules/wills/wills.service';
import { AttestationsService } from '../../src/modules/attestations/attestations.service';
import { OutboxService } from '../../src/jobs/outbox.service';
import { QueueService } from '../../src/jobs/queue.service';
import { v4 as uuidv4 } from 'uuid';

describe('Security and Business Acceptance Tests (Section 96)', () => {
  let prisma: PrismaClient;
  let cryptoService: CryptoService;
  let storageService: StorageService;
  let scannerService: MalwareScannerService;
  let auditService: AuditService;
  let documentsService: DocumentsService;
  let willsService: WillsService;
  let attestationsService: AttestationsService;
  let queueService: QueueService;

  let testator1Id: string;
  let testator2Id: string;
  let estate1Id: string;
  let estate2Id: string;
  let will1Id: string;
  let v1Id: string;
  let document1Id: string;

  beforeAll(async () => {
    prisma = new PrismaClient();
    await prisma.$connect();

    cryptoService = new CryptoService();
    storageService = new StorageService();
    storageService.onModuleInit();
    scannerService = new MalwareScannerService();
    auditService = new AuditService(prisma as any, cryptoService);
    documentsService = new DocumentsService(
      prisma as any,
      cryptoService,
      storageService,
      scannerService,
      auditService
    );

    queueService = new QueueService();
    queueService.onModuleInit();
    const outboxService = new OutboxService(prisma as any, queueService);

    willsService = new WillsService(prisma as any, cryptoService, auditService, outboxService);
    attestationsService = new AttestationsService(prisma as any, auditService);

    const pass = await cryptoService.hashPassword('Password123!');

    // Testator 1
    const u1 = await prisma.user.create({
      data: {
        email: `t1_${uuidv4().slice(0, 8)}@test.com`,
        passwordHash: pass,
        profile: { create: { fullName: 'Testator One', kycStatus: KycStatus.VERIFIED } },
      },
    });
    testator1Id = u1.id;

    // Testator 2
    const u2 = await prisma.user.create({
      data: {
        email: `t2_${uuidv4().slice(0, 8)}@test.com`,
        passwordHash: pass,
        profile: { create: { fullName: 'Testator Two', kycStatus: KycStatus.VERIFIED } },
      },
    });
    testator2Id = u2.id;

    // Estate 1
    const est1 = await prisma.estate.create({
      data: {
        name: 'Estate One',
        ownerId: testator1Id,
        memberships: { create: { userId: testator1Id, role: RoleType.TESTATOR } },
      },
    });
    estate1Id = est1.id;

    // Estate 2
    const est2 = await prisma.estate.create({
      data: {
        name: 'Estate Two',
        ownerId: testator2Id,
        memberships: { create: { userId: testator2Id, role: RoleType.TESTATOR } },
      },
    });
    estate2Id = est2.id;

    // Will 1 in Estate 1
    const will1 = await prisma.will.create({
      data: {
        estateId: estate1Id,
        title: 'Will of Testator One',
        status: WillStatus.DRAFT,
      },
    });
    will1Id = will1.id;

    // Version 1
    const v1 = await prisma.willVersion.create({
      data: {
        willId: will1Id,
        estateId: estate1Id,
        versionNo: 1,
        status: WillStatus.DRAFT,
      },
    });
    v1Id = v1.id;

    // Upload Document in Estate 1
    const testDoc = Buffer.from('Original Confidential Will Document Content', 'utf8');
    const uploaded = await documentsService.uploadDocument(
      testator1Id,
      estate1Id,
      { buffer: testDoc, originalname: 'will.pdf', mimetype: 'application/pdf', size: testDoc.length },
      v1Id
    );
    document1Id = uploaded.id;
  });

  afterAll(async () => {
    if (queueService) await queueService.onModuleDestroy();
    await prisma.$disconnect();
  });

  // TEST 1: User cannot download another estate's document even when document ID is known (BOLA/IDOR protection)
  it('TEST 1: BOLA/IDOR protection - User cannot download another estate document', async () => {
    await expect(
      documentsService.downloadDocument(testator2Id, document1Id)
    ).rejects.toThrow('ESTATE_ACCESS_DENIED');
  });

  // TEST 2: Witness can attest only to an invited and permitted will version
  it('TEST 2: Witness can attest only to an invited and permitted will version', async () => {
    const uninvitedUser = await prisma.user.create({
      data: {
        email: `uninvited_${uuidv4().slice(0, 8)}@test.com`,
        passwordHash: 'dummy',
      },
    });

    await expect(
      attestationsService.createAttestation(uninvitedUser.id, v1Id, {
        role: RoleType.WITNESS,
        type: 'STEP_UP',
        confirmed: true,
      })
    ).rejects.toThrow('WITNESS_NOT_ELIGIBLE');
  });

  // TEST 4: Changing one byte in a document causes integrity verification failure
  it('TEST 4: Tampering a single byte causes document integrity verification failure', async () => {
    const initialVerify = await documentsService.verifyDocumentIntegrity(document1Id);
    expect(initialVerify.verified).toBe(true);

    await documentsService.corruptDocumentForTest(document1Id);

    const tamperedVerify = await documentsService.verifyDocumentIntegrity(document1Id);
    expect(tamperedVerify.verified).toBe(false);
  });

  // TEST 3 & TEST 5: Version finalization, immutability & superseding
  it('TEST 3 & 5: Finalized version is immutable and supersedes prior version', async () => {
    const cleanDoc = Buffer.from('Clean Testament Document', 'utf8');
    await documentsService.uploadDocument(
      testator1Id,
      estate1Id,
      { buffer: cleanDoc, originalname: 'testament.pdf', mimetype: 'application/pdf', size: cleanDoc.length },
      v1Id
    );

    const finalizedV1 = await willsService.finalizeVersion(testator1Id, v1Id, {
      confirmationStatement: 'I Arthur confirm this will',
    });
    expect(finalizedV1.status).toBe(WillStatus.ACTIVE);

    // TEST 3: Attempting to modify finalized version clauses must fail
    await expect(
      willsService.addClause(testator1Id, v1Id, {
        clauseNo: 99,
        title: 'Unauthorized Modification',
        content: 'Should be rejected',
      })
    ).rejects.toThrow('WILL_FINALIZED');

    // TEST 5: Create Version 2 and finalize it -> Version 1 becomes SUPERSEDED
    const v2 = await willsService.createVersion(testator1Id, will1Id, {
      clauses: [{ clauseNo: 1, title: 'Updated Clause', content: 'V2 content' }],
    });

    const finalizedV2 = await willsService.finalizeVersion(testator1Id, v2.id, {
      confirmationStatement: 'Finalizing V2',
    });
    expect(finalizedV2.status).toBe(WillStatus.ACTIVE);

    const checkV1 = await prisma.willVersion.findUnique({ where: { id: v1Id } });
    expect(checkV1?.status).toBe(WillStatus.SUPERSEDED);
  });
});
