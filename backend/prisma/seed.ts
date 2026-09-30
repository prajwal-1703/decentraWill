import { PrismaClient, RoleType, KycStatus, WillStatus } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding DecentraWill Database ---');

  const defaultPassword = 'SecureP@ssw0rd!2026';
  const passwordHash = await argon2.hash(defaultPassword, { type: argon2.argon2id });

  // 1. Create Core Users
  const users = [
    { email: 'admin@decentrawill.org', fullName: 'DecentraWill Security Admin', role: RoleType.ADMIN },
    { email: 'testator@decentrawill.org', fullName: 'Arthur Pendelton (Testator)', role: RoleType.TESTATOR },
    { email: 'advocate@lawfirm.com', fullName: 'Claire Sterling, Esq. (Advocate)', role: RoleType.ADVOCATE },
    { email: 'witness1@example.com', fullName: 'Dr. Robert Vance (Witness 1)', role: RoleType.WITNESS },
    { email: 'witness2@example.com', fullName: 'Eleanor Bennett (Witness 2)', role: RoleType.WITNESS },
    { email: 'executor@trustee.org', fullName: 'Marcus Vance (Executor)', role: RoleType.EXECUTOR },
    { email: 'beneficiary1@family.org', fullName: 'Chloe Pendelton (Beneficiary 1)', role: RoleType.BENEFICIARY },
    { email: 'beneficiary2@family.org', fullName: 'Julian Pendelton (Beneficiary 2)', role: RoleType.BENEFICIARY },
  ];

  const userMap = new Map<string, string>();

  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        passwordHash,
        profile: {
          create: {
            fullName: u.fullName,
            kycStatus: KycStatus.VERIFIED,
            kycReference: `mock_kyc_${u.email.split('@')[0]}`,
            kycVerifiedAt: new Date(),
          },
        },
      },
    });
    userMap.set(u.email, user.id);
  }

  const testatorId = userMap.get('testator@decentrawill.org')!;
  const advocateId = userMap.get('advocate@lawfirm.com')!;
  const witness1Id = userMap.get('witness1@example.com')!;
  const witness2Id = userMap.get('witness2@example.com')!;
  const executorId = userMap.get('executor@trustee.org')!;
  const ben1Id = userMap.get('beneficiary1@family.org')!;
  const ben2Id = userMap.get('beneficiary2@family.org')!;

  // 2. Create Estate
  let estate = await prisma.estate.findFirst({
    where: { ownerId: testatorId, name: 'The Pendelton Trust Estate' },
  });

  if (!estate) {
    estate = await prisma.estate.create({
      data: {
        name: 'The Pendelton Trust Estate',
        description: 'Comprehensive family trust covering real property, liquid capital, and sovereign digital assets.',
        ownerId: testatorId,
      },
    });
  }

  // 3. Create Estate Memberships
  const memberships = [
    { userId: testatorId, role: RoleType.TESTATOR },
    { userId: advocateId, role: RoleType.ADVOCATE },
    { userId: witness1Id, role: RoleType.WITNESS },
    { userId: witness2Id, role: RoleType.WITNESS },
    { userId: executorId, role: RoleType.EXECUTOR },
    { userId: ben1Id, role: RoleType.BENEFICIARY },
    { userId: ben2Id, role: RoleType.BENEFICIARY },
  ];

  for (const m of memberships) {
    await prisma.estateMembership.upsert({
      where: {
        estateId_userId_role: {
          estateId: estate.id,
          userId: m.userId,
          role: m.role,
        },
      },
      update: { status: 'ACTIVE' },
      create: {
        estateId: estate.id,
        userId: m.userId,
        role: m.role,
        status: 'ACTIVE',
      },
    });
  }

  // 4. Create Workflow Policy
  await prisma.workflowPolicy.create({
    data: {
      estateId: estate.id,
      version: 1,
      requiredAdvocate: true,
      requiredWitnesses: 2,
      quorum: 2,
      threshold: 2,
      gracePeriodDays: 30,
      proofOfLifeDays: 90,
      reminderEveryDays: 7,
      eligibleRoles: ['ADVOCATE', 'EXECUTOR', 'BENEFICIARY'],
      isActive: true,
    },
  });

  // 5. Create Sample Will & V1 Draft
  const will = await prisma.will.create({
    data: {
      estateId: estate.id,
      title: 'Last Will and Testament of Arthur Pendelton',
      mode: 'TESTATOR_LED',
      status: WillStatus.DRAFT,
      versions: {
        create: {
          estateId: estate.id,
          versionNo: 1,
          status: WillStatus.DRAFT,
          clauses: {
            create: [
              {
                clauseNo: 1,
                title: 'Revocation of Prior Wills',
                content: 'I hereby revoke any and all prior wills and testamentary dispositions made by me.',
              },
              {
                clauseNo: 2,
                title: 'Appointment of Executor',
                content: 'I appoint Marcus Vance as the Executor of this Will and Trustee of my Estate.',
              },
              {
                clauseNo: 3,
                title: 'Distribution of Real Estate',
                content: 'I devise my family residential estate to Chloe Pendelton (60%) and Julian Pendelton (40%).',
              },
            ],
          },
        },
      },
    },
  });

  // 6. Create Assets
  const assets = [
    {
      label: 'Pendelton Family Manor',
      category: 'REAL_ESTATE',
      valuation: 850000.0,
      currency: 'USD',
      isDigital: false,
      details: { address: '742 Evergreen Terrace, Springfield' },
    },
    {
      label: 'Sovereign Trust ETH Vault',
      category: 'CRYPTO',
      valuation: 120000.0,
      currency: 'USD',
      isDigital: true,
      tokenAddress: '0x0000000000000000000000000000000000000000',
      chainId: 11155111,
      details: { network: 'Ethereum Sepolia', targetAllocation: 'Cold Storage Multisig' },
    },
  ];

  for (const a of assets) {
    const createdAsset = await prisma.asset.create({
      data: {
        estateId: estate.id,
        label: a.label,
        category: a.category,
        valuation: a.valuation,
        currency: a.currency,
        isDigital: a.isDigital,
        tokenAddress: a.tokenAddress,
        chainId: a.chainId,
        details: a.details,
      },
    });

    // Allocations
    await prisma.assetAllocation.create({
      data: {
        assetId: createdAsset.id,
        beneficiaryId: ben1Id,
        percentage: 60.0,
        instructions: 'Primary distribution share',
      },
    });
    await prisma.assetAllocation.create({
      data: {
        assetId: createdAsset.id,
        beneficiaryId: ben2Id,
        percentage: 40.0,
        instructions: 'Secondary distribution share',
      },
    });
  }

  // 7. Initial Proof of Life Cycle
  await prisma.proofOfLifeCycle.create({
    data: {
      estateId: estate.id,
      testatorId,
      intervalDays: 90,
      status: 'ACTIVE',
      nextCheckAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('--- Database Seed Complete! ---');
  console.log(`Demo Estate ID: ${estate.id}`);
  console.log(`Default Passwords for all accounts: ${defaultPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
