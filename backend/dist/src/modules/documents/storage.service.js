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
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const fs = require("fs");
const path = require("path");
let StorageService = class StorageService {
    constructor() {
        this.storageDir = process.env.STORAGE_LOCAL_DIR || path.join(process.cwd(), 'storage_vault');
    }
    onModuleInit() {
        if (!fs.existsSync(this.storageDir)) {
            fs.mkdirSync(this.storageDir, { recursive: true });
        }
    }
    async putObject(key, data) {
        const fullPath = path.join(this.storageDir, key);
        await fs.promises.writeFile(fullPath, data);
    }
    async getObject(key) {
        const fullPath = path.join(this.storageDir, key);
        return fs.promises.readFile(fullPath);
    }
    async deleteObject(key) {
        const fullPath = path.join(this.storageDir, key);
        if (fs.existsSync(fullPath)) {
            await fs.promises.unlink(fullPath);
        }
    }
    async corruptObjectForTest(key) {
        const buf = await this.getObject(key);
        buf[buf.length - 1] ^= 0xff;
        await this.putObject(key, buf);
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], StorageService);
//# sourceMappingURL=storage.service.js.map