"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProofOfLifeModule = void 0;
const common_1 = require("@nestjs/common");
const proof_of_life_service_1 = require("./proof-of-life.service");
const proof_of_life_controller_1 = require("./proof-of-life.controller");
let ProofOfLifeModule = class ProofOfLifeModule {
};
exports.ProofOfLifeModule = ProofOfLifeModule;
exports.ProofOfLifeModule = ProofOfLifeModule = __decorate([
    (0, common_1.Module)({
        controllers: [proof_of_life_controller_1.ProofOfLifeController],
        providers: [proof_of_life_service_1.ProofOfLifeService],
        exports: [proof_of_life_service_1.ProofOfLifeService],
    })
], ProofOfLifeModule);
//# sourceMappingURL=proof-of-life.module.js.map