export interface User {
    id: string;
    name: string;
    email: string;
}

export type ReconciliationRecordStatus = 'matched' | 'unmatched_a' | 'unmatched_b' | 'mismatch';

export interface ReconciliationRecord {
    id: string;
    date: string;
    description: string;
    amount: number;
    status: ReconciliationRecordStatus;
    source: 'fileA' | 'fileB';
    originalAmount?: number; // Helpers for UI
    counterpartAmount?: number;
}

export interface ReconciliationReport {
    id: string;
    userId: string;
    date: string;
    fileAName: string;
    fileBName: string;
    totalRecords: number;
    matchedCount: number;
    unmatchedACount: number;
    unmatchedBCount: number;
    mismatchCount?: number;
}
