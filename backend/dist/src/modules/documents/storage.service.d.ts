import { OnModuleInit } from '@nestjs/common';
export interface StorageProvider {
    putObject(key: string, data: Buffer): Promise<void>;
    getObject(key: string): Promise<Buffer>;
    deleteObject(key: string): Promise<void>;
}
export declare class StorageService implements StorageProvider, OnModuleInit {
    private readonly storageDir;
    constructor();
    onModuleInit(): void;
    putObject(key: string, data: Buffer): Promise<void>;
    getObject(key: string): Promise<Buffer>;
    deleteObject(key: string): Promise<void>;
    corruptObjectForTest(key: string): Promise<void>;
}
