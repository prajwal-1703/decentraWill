export declare class CreateWillDto {
    estateId: string;
    title: string;
    mode?: string;
}
export declare class CreateClauseDto {
    clauseNo: number;
    title: string;
    content: string;
    metadata?: any;
}
export declare class CreateWillVersionDto {
    clauses?: CreateClauseDto[];
    documentId?: string;
}
export declare class FinalizeVersionDto {
    confirmationStatement: string;
}
