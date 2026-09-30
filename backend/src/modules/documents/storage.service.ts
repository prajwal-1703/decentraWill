import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface StorageProvider {
  putObject(key: string, data: Buffer): Promise<void>;
  getObject(key: string): Promise<Buffer>;
  deleteObject(key: string): Promise<void>;
}

@Injectable()
export class StorageService implements StorageProvider, OnModuleInit {
  private readonly storageDir: string;

  constructor() {
    this.storageDir = process.env.STORAGE_LOCAL_DIR || path.join(process.cwd(), 'storage_vault');
  }

  onModuleInit() {
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
  }

  async putObject(key: string, data: Buffer): Promise<void> {
    const fullPath = path.join(this.storageDir, key);
    await fs.promises.writeFile(fullPath, data);
  }

  async getObject(key: string): Promise<Buffer> {
    const fullPath = path.join(this.storageDir, key);
    return fs.promises.readFile(fullPath);
  }

  async deleteObject(key: string): Promise<void> {
    const fullPath = path.join(this.storageDir, key);
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
    }
  }

  // Helper to corrupt an object for integrity failure testing (Test 4 from Section 96)
  async corruptObjectForTest(key: string): Promise<void> {
    const buf = await this.getObject(key);
    // Invert the last byte
    buf[buf.length - 1] ^= 0xff;
    await this.putObject(key, buf);
  }
}
