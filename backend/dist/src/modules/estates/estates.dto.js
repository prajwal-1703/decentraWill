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
exports.InviteParticipantDto = exports.CreateEstateDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class CreateEstateDto {
}
exports.CreateEstateDto = CreateEstateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'The Alexander Family Trust Estate' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateEstateDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Primary estate for family inheritance and digital trust', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEstateDto.prototype, "description", void 0);
class InviteParticipantDto {
}
exports.InviteParticipantDto = InviteParticipantDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'advocate@lawfirm.com' }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], InviteParticipantDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.RoleType, example: client_1.RoleType.ADVOCATE }),
    (0, class_validator_1.IsEnum)(client_1.RoleType),
    __metadata("design:type", String)
], InviteParticipantDto.prototype, "role", void 0);
//# sourceMappingURL=estates.dto.js.map