export declare class CreateAssetDto {
    label: string;
    category: string;
    valuation?: number;
    currency?: string;
    isDigital: boolean;
    tokenAddress?: string;
    tokenId?: string;
    chainId?: number;
    details?: any;
}
export declare class CreateAllocationDto {
    beneficiaryId: string;
    percentage?: number;
    fixedAmount?: number;
    instructions?: string;
}
export declare class CreateTransferCaseDto {
    type: string;
    beneficiaryId: string;
    executorId?: string;
    externalRef?: string;
    evidence?: any;
}
