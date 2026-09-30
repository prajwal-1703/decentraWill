import { PrismaClient, RoleType, WillStatus, KycStatus, VoteChoice } from '@prisma/client';
import { WillsService } from '../../src/modules/wills/wills.service';
import { GovernanceService } from '../../src/modules/governance/governance.service';
import { CryptoService } from '../../src/common/crypto.service';
import { AuditService } from '../../src/modules/audit/audit.service';
import { OutboxService } from '../../src/jobs/outbox.service';
import { QueueService } from '../../src/jobs/queue.service';
import { v4 as uuidv4 } from 'uuid';

describe('Concurrency Tests (Section 78 & 96)', () => {
  let prisma: PrismaClient;
  let willsService: WillsService;
  let governanceService: GovernanceService;
  let queueService: QueueService;

  let testatorId: string;
  let voterId: string;
  let estateId: string;
  let willId: string;
  let proposalId: string;

  beforeAll(async () => {
    prisma = new PrismaClient();
    await prisma.$connect();

    const cryptoService = new CryptoService();
    const auditService = new AuditService(prisma as any, cryptoService);
    queueService = new QueueService();
    queueService.onModuleInit();
    const outboxService = new OutboxService(prisma as any, queueService);

    willsService = new WillsService(prisma as any, cryptoService, auditService, outboxService);
    governanceService = new GovernanceService(prisma as any, auditService);

    const pass = await cryptoService.hashPassword('Pass123!');

    const t = await prisma.user.create({
      data: {
        email: `conc_t_${uuidv4().slice(0, 8)}@test.com`,
        passwordHash: pass,
        profile: { create: { kycStatus: KycStatus.VERIFIED } },
      },
    });
    testatorId = t.id;

    const v = await prisma.user.create({
      data: {
        email: `conc_v_${uuidv4().slice(0, 8)}@test.com`,
        passwordHash: pass,
        profile: { create: { kycStatus: KycStatus.VERIFIED } },
      },
    });
    voterId = v.id;

    const est = await prisma.estate.create({
      data: {
        name: 'Concurrency Estate',
        ownerId: testatorId,
        memberships: {
          create: [
            { userId: testatorId, role: RoleType.TESTATOR },
            { userId: voterId, role: RoleType.EXECUTOR },
          ],
        },
        policies: {
          create: {
            requiredAdvocate: false,
            requiredWitnesses: 0,
            quorum: 2,
            threshold: 2,
            eligibleRoles: ['TESTATOR', 'EXECUTOR'],
          },
        },
      },
    });
    estateId = est.id;

    const will = await prisma.will.create({
      data: { estateId, title: 'Concurrency Will' },
    });
    willId = will.id;

    const proposal = await prisma.proposal.create({
      data: {
        estateId,
        title: 'Concurrent Vote Proposal',
        description: 'Testing concurrency',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
    proposalId = proposal.id;
  });

  afterAll(async () => {
    if (queueService) await queueService.onModuleDestroy();
    await prisma.$disconnect();
  });

  it('TEST 14: Concurrent finalization requests - exactly one succeeds, no duplicate active versions', async () => {
    const version = await prisma.willVersion.create({
      data: {
        willId,
        estateId,
        versionNo: 99,
        status: WillStatus.DRAFT,
      },
    });

    const p1 = willsService.finalizeVersion(testatorId, version.id, { confirmationStatement: 'Thread 1' });
    const p2 = willsService.finalizeVersion(testatorId, version.id, { confirmationStatement: 'Thread 2' });

    const results = await Promise.allSettled([p1, p2]);

    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(1);

    const activeVersions = await prisma.willVersion.findMany({
      where: { estateId, status: WillStatus.ACTIVE },
    });
    expect(activeVersions.length).toBe(1);
  });

  it('TEST 15: Concurrent votes from same user - exactly one succeeds, no duplicate votes', async () => {
    const v1 = governanceService.castVote(voterId, proposalId, { choice: VoteChoice.FOR });
    const v2 = governanceService.castVote(voterId, proposalId, { choice: VoteChoice.FOR });

    const results = await Promise.allSettled([v1, v2]);

    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(1);

    const votes = await prisma.vote.findMany({
      where: { proposalId, voterId },
    });
    expect(votes.length).toBe(1);
  });
});
