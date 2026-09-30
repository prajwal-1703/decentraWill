import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../audit/audit.service';
import { KycStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

export interface KycProvider {
  startVerification(userId: string): Promise<{ providerRef: string; status: KycStatus }>;
  checkStatus(providerRef: string): Promise<{ status: KycStatus; verifiedAt?: Date }>;
}

@Injectable()
export class MockKycProvider implements KycProvider {
  async startVerification(userId: string) {
    return {
      providerRef: `mock_kyc_${uuidv4().slice(0, 8)}`,
      status: KycStatus.PENDING,
    };
  }

  async checkStatus(providerRef: string) {
    return {
      status: KycStatus.VERIFIED,
      verifiedAt: new Date(),
    };
  }
}

@Injectable()
export class IdentityService {
  private kycProvider: KycProvider;

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService
  ) {
    // Configurable KYC provider boundary
    this.kycProvider = new MockKycProvider();
  }

  async startKyc(userId: string) {
    const res = await this.kycProvider.startVerification(userId);

    const profile = await this.prisma.userProfile.upsert({
      where: { userId },
      update: {
        kycStatus: res.status,
        kycReference: res.providerRef,
      },
      create: {
        userId,
        kycStatus: res.status,
        kycReference: res.providerRef,
      },
    });

    await this.audit.logEvent({
      actorId: userId,
      eventType: 'KYC_STARTED',
      resourceType: 'IDENTITY',
      resourceId: profile.id,
      metadata: { providerRef: res.providerRef },
    });

    return { kycStatus: profile.kycStatus, providerRef: profile.kycReference };
  }

  async getKycStatus(userId: string) {
    const profile = await this.prisma.userProfile.findUnique({ where: { userId } });
    return {
      kycStatus: profile?.kycStatus || KycStatus.NOT_STARTED,
      kycReference: profile?.kycReference || null,
      kycVerifiedAt: profile?.kycVerifiedAt || null,
    };
  }

  async verifyKycMock(userId: string) {
    const profile = await this.prisma.userProfile.update({
      where: { userId },
      data: {
        kycStatus: KycStatus.VERIFIED,
        kycVerifiedAt: new Date(),
      },
    });

    await this.audit.logEvent({
      actorId: userId,
      eventType: 'KYC_VERIFIED',
      resourceType: 'IDENTITY',
      resourceId: profile.id,
    });

    return { kycStatus: profile.kycStatus, verifiedAt: profile.kycVerifiedAt };
  }
}
