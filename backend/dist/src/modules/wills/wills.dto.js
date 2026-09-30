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
exports.FinalizeVersionDto = exports.CreateWillVersionDto = exports.CreateClauseDto = exports.CreateWillDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class CreateWillDto {
}
exports.CreateWillDto = CreateWillDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'estate-uuid-here' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateWillDto.prototype, "estateId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Last Will and Testament of John Doe' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateWillDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'TESTATOR_LED', enum: ['TESTATOR_LED', 'ADVOCATE_LED', 'COLLABORATIVE'], required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWillDto.prototype, "mode", void 0);
class CreateClauseDto {
}
exports.CreateClauseDto = CreateClauseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1 }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateClauseDto.prototype, "clauseNo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Appointment of Executor' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateClauseDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'I appoint Jane Doe as the primary executor of this estate.' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateClauseDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateClauseDto.prototype, "metadata", void 0);
class CreateWillVersionDto {
}
exports.CreateWillVersionDto = CreateWillVersionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [CreateClauseDto], required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateClauseDto),
    __metadata("design:type", Array)
], CreateWillVersionDto.prototype, "clauses", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWillVersionDto.prototype, "documentId", void 0);
class FinalizeVersionDto {
}
exports.FinalizeVersionDto = FinalizeVersionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'I confirm and finalize this will under oath and policy guidelines.' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], FinalizeVersionDto.prototype, "confirmationStatement", void 0);
//# sourceMappingURL=wills.dto.js.map