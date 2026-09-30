"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictException = exports.NotFoundException = exports.ForbiddenException = exports.AuthException = exports.DomainException = void 0;
const common_1 = require("@nestjs/common");
class DomainException extends common_1.HttpException {
    constructor(code, message, status = common_1.HttpStatus.BAD_REQUEST, details = {}) {
        super({ code, message, details }, status);
        this.code = code;
        this.details = details;
        this.message = `[${code}] ${message}`;
    }
}
exports.DomainException = DomainException;
class AuthException extends DomainException {
    constructor(code, message, details) {
        super(code, message, common_1.HttpStatus.UNAUTHORIZED, details);
    }
}
exports.AuthException = AuthException;
class ForbiddenException extends DomainException {
    constructor(code, message, details) {
        super(code, message, common_1.HttpStatus.FORBIDDEN, details);
    }
}
exports.ForbiddenException = ForbiddenException;
class NotFoundException extends DomainException {
    constructor(code, message, details) {
        super(code, message, common_1.HttpStatus.NOT_FOUND, details);
    }
}
exports.NotFoundException = NotFoundException;
class ConflictException extends DomainException {
    constructor(code, message, details) {
        super(code, message, common_1.HttpStatus.CONFLICT, details);
    }
}
exports.ConflictException = ConflictException;
//# sourceMappingURL=exceptions.js.map