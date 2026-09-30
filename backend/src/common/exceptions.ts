import { HttpException, HttpStatus } from '@nestjs/common';

export class DomainException extends HttpException {
  constructor(
    public readonly code: string,
    message: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
    public readonly details: any = {}
  ) {
    super({ code, message, details }, status);
    this.message = `[${code}] ${message}`;
  }
}

export class AuthException extends DomainException {
  constructor(code: string, message: string, details?: any) {
    super(code, message, HttpStatus.UNAUTHORIZED, details);
  }
}

export class ForbiddenException extends DomainException {
  constructor(code: string, message: string, details?: any) {
    super(code, message, HttpStatus.FORBIDDEN, details);
  }
}

export class NotFoundException extends DomainException {
  constructor(code: string, message: string, details?: any) {
    super(code, message, HttpStatus.NOT_FOUND, details);
  }
}

export class ConflictException extends DomainException {
  constructor(code: string, message: string, details?: any) {
    super(code, message, HttpStatus.CONFLICT, details);
  }
}
