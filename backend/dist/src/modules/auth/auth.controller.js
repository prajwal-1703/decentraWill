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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("./auth.service");
const auth_dto_1 = require("./auth.dto");
const guards_1 = require("../../common/guards");
const decorators_1 = require("../../common/decorators");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async register(dto, req) {
        const ip = req.ip || req.headers['x-forwarded-for'];
        const corrId = req.headers['x-correlation-id'];
        return this.authService.register(dto, ip, corrId);
    }
    async login(dto, req) {
        const userAgent = req.headers['user-agent'];
        const ip = req.ip || req.headers['x-forwarded-for'];
        const corrId = req.headers['x-correlation-id'];
        return this.authService.login(dto, userAgent, ip, corrId);
    }
    async refresh(dto) {
        return this.authService.refresh(dto);
    }
    async logout(authHeader) {
        const token = authHeader.replace('Bearer ', '');
        return this.authService.logout(token);
    }
    async stepUp(userId, dto, req) {
        const ip = req.ip || req.headers['x-forwarded-for'];
        const corrId = req.headers['x-correlation-id'];
        return this.authService.stepUp(userId, dto, ip, corrId);
    }
    async connectWallet(userId, dto) {
        return this.authService.connectWallet(userId, dto);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('auth/register'),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new user account' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.RegisterDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('auth/login'),
    (0, swagger_1.ApiOperation)({ summary: 'Authenticate with email and password' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.LoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('auth/refresh'),
    (0, swagger_1.ApiOperation)({ summary: 'Rotate and refresh access token' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.RefreshDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)('auth/logout'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Revoke current session' }),
    __param(0, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)('auth/step-up'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Perform step-up authentication to receive high-privilege token' }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, auth_dto_1.StepUpDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "stepUp", null);
__decorate([
    (0, common_1.Post)('wallets/connect'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Link crypto wallet address to authenticated account' }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, auth_dto_1.ConnectWalletDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "connectWallet", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Authentication'),
    (0, common_1.Controller)('api/v1'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map