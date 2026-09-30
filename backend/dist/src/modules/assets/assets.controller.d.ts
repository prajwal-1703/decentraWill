import { AssetsService } from './assets.service';
import { CreateAssetDto, CreateAllocationDto, CreateTransferCaseDto } from './assets.dto';
export declare class AssetsController {
    private readonly assetsService;
    constructor(assetsService: AssetsService);
    createAsset(userId: string, estateId: string, dto: CreateAssetDto): Promise<{
        id: string;
        estateId: string;
        createdAt: Date;
        updatedAt: Date;
        details: import("@prisma/client/runtime/library").JsonValue | null;
        label: string;
        category: string;
        valuation: import("@prisma/client/runtime/library").Decimal | null;
        currency: string;
        isDigital: boolean;
        tokenAddress: string | null;
        tokenId: string | null;
        chainId: number | null;
    }>;
    listEstateAssets(userId: string, estateId: string): Promise<({
        allocations: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            beneficiaryId: string;
            percentage: import("@prisma/client/runtime/library").Decimal | null;
            fixedAmount: import("@prisma/client/runtime/library").Decimal | null;
            instructions: string | null;
            assetId: string;
            conditions: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
    } & {
        id: string;
        estateId: string;
        createdAt: Date;
        updatedAt: Date;
        details: import("@prisma/client/runtime/library").JsonValue | null;
        label: string;
        category: string;
        valuation: import("@prisma/client/runtime/library").Decimal | null;
        currency: string;
        isDigital: boolean;
        tokenAddress: string | null;
        tokenId: string | null;
        chainId: number | null;
    })[]>;
    createAllocation(userId: string, assetId: string, dto: CreateAllocationDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        beneficiaryId: string;
        percentage: import("@prisma/client/runtime/library").Decimal | null;
        fixedAmount: import("@prisma/client/runtime/library").Decimal | null;
        instructions: string | null;
        assetId: string;
        conditions: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    createTransferCase(userId: string, assetId: string, dto: CreateTransferCaseDto): Promise<{
        id: string;
        estateId: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.TransferStatus;
        updatedAt: Date;
        type: string;
        txHash: string | null;
        beneficiaryId: string;
        executorId: string | null;
        externalRef: string | null;
        evidence: import("@prisma/client/runtime/library").JsonValue | null;
        assetId: string;
    }>;
}
