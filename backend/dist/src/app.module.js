"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const configuration_1 = require("./config/configuration");
const database_module_1 = require("./database/database.module");
const audit_module_1 = require("./modules/audit/audit.module");
const jobs_module_1 = require("./jobs/jobs.module");
const auth_module_1 = require("./modules/auth/auth.module");
const identity_module_1 = require("./modules/identity/identity.module");
const estates_module_1 = require("./modules/estates/estates.module");
const wills_module_1 = require("./modules/wills/wills.module");
const documents_module_1 = require("./modules/documents/documents.module");
const assets_module_1 = require("./modules/assets/assets.module");
const attestations_module_1 = require("./modules/attestations/attestations.module");
const workflows_module_1 = require("./modules/workflows/workflows.module");
const governance_module_1 = require("./modules/governance/governance.module");
const proof_of_life_module_1 = require("./modules/proof-of-life/proof-of-life.module");
const inheritance_module_1 = require("./modules/inheritance/inheritance.module");
const blockchain_module_1 = require("./modules/blockchain/blockchain.module");
const notification_module_1 = require("./modules/notifications/notification.module");
const admin_module_1 = require("./modules/admin/admin.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [configuration_1.configuration],
            }),
            database_module_1.DatabaseModule,
            audit_module_1.AuditModule,
            jobs_module_1.JobsModule,
            auth_module_1.AuthModule,
            identity_module_1.IdentityModule,
            estates_module_1.EstatesModule,
            wills_module_1.WillsModule,
            documents_module_1.DocumentsModule,
            assets_module_1.AssetsModule,
            attestations_module_1.AttestationsModule,
            workflows_module_1.WorkflowsModule,
            governance_module_1.GovernanceModule,
            proof_of_life_module_1.ProofOfLifeModule,
            inheritance_module_1.InheritanceModule,
            blockchain_module_1.BlockchainModule,
            notification_module_1.NotificationModule,
            admin_module_1.AdminModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map