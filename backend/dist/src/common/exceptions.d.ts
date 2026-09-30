import { HttpException, HttpStatus } from '@nestjs/common';
export declare class DomainException extends HttpException {
    readonly code: string;
    readonly details: any;
    constructor(code: string, message: string, status?: HttpStatus, details?: any);
}
export declare class AuthException extends DomainException {
    constructor(code: string, message: string, details?: any);
}
export declare class ForbiddenException extends DomainException {
    constructor(code: string, message: string, details?: any);
}
export declare class NotFoundException extends DomainException {
    constructor(code: string, message: string, details?: any);
}
export declare class ConflictException extends DomainException {
    constructor(code: string, message: string, details?: any);
}
