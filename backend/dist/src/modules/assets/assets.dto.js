"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTransferCaseDto = exports.CreateAllocationDto = exports.CreateAssetDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateAssetDto {
}
exports.CreateAssetDto = CreateAssetDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Downtown Residence Property' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "label", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'REAL_ESTATE', enum: ['REAL_ESTATE', 'BANK_ACCOUNT', 'CRYPTO', 'STOCKS', 'VEHICLE', 'VALUABLES', 'IP'] }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 450000.00, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateAssetDto.prototype, "valuation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'USD', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateAssetDto.prototype, "isDigital", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: '0x1234567890abcdef1234567890abcdef12345678' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "tokenAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: '1' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "tokenId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: 11155111 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateAssetDto.prototype, "chainId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateAssetDto.prototype, "details", void 0);
class CreateAllocationDto {
}
exports.CreateAllocationDto = CreateAllocationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Beneficiary user ID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateAllocationDto.prototype, "beneficiaryId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 50.0, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateAllocationDto.prototype, "percentage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 25000.0, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateAllocationDto.prototype, "fixedAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Transfer upon completion of probate and identity verification', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAllocationDto.prototype, "instructions", void 0);
class CreateTransferCaseDto {
}
exports.CreateTransferCaseDto = CreateTransferCaseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'PHYSICAL_LEGAL', enum: ['PHYSICAL_LEGAL', 'BLOCKCHAIN_NATIVE'] }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTransferCaseDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Target beneficiary user ID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTransferCaseDto.prototype, "beneficiaryId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Assigned executor user ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTransferCaseDto.prototype, "executorId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, example: 'Probate Court Doc #8892' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTransferCaseDto.prototype, "externalRef", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateTransferCaseDto.prototype, "evidence", void 0);
//# sourceMappingURL=assets.dto.js.map