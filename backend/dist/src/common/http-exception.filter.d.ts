import { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
export declare class GlobalHttpExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost): void;
}
