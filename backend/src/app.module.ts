import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configuration } from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { AuditModule } from './modules/audit/audit.module';
import { JobsModule } from './jobs/jobs.module';
import { AuthModule } from './modules/auth/auth.module';
import { IdentityModule } from './modules/identity/identity.module';
import { EstatesModule } from './modules/estates/estates.module';
import { WillsModule } from './modules/wills/wills.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { AssetsModule } from './modules/assets/assets.module';
import { AttestationsModule } from './modules/attestations/attestations.module';
import { WorkflowsModule } from './modules/workflows/workflows.module';
import { GovernanceModule } from './modules/governance/governance.module';
import { ProofOfLifeModule } from './modules/proof-of-life/proof-of-life.module';
import { InheritanceModule } from './modules/inheritance/inheritance.module';
import { BlockchainModule } from './modules/blockchain/blockchain.module';
import { NotificationModule } from './modules/notifications/notification.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    DatabaseModule,
    AuditModule,
    JobsModule,
    AuthModule,
    IdentityModule,
    EstatesModule,
    WillsModule,
    DocumentsModule,
    AssetsModule,
    AttestationsModule,
    WorkflowsModule,
    GovernanceModule,
    ProofOfLifeModule,
    InheritanceModule,
    BlockchainModule,
    NotificationModule,
    AdminModule,
  ],
})
export class AppModule {}
