import { useState } from 'react';
import Papa from 'papaparse';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FileUploader } from '../components/reconciliation/FileUploader';
import type { ReconciliationRecord, ReconciliationReport } from '../lib/types';
import { api } from '../lib/api';
import { CheckCircle2, AlertOctagon, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { Input } from '../components/ui/Input';

export function Reconcile() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [fileA, setFileA] = useState<File | null>(null);
    const [fileB, setFileB] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [report, setReport] = useState<ReconciliationReport | null>(null);
    const [records, setRecords] = useState<ReconciliationRecord[]>([]);

    // Search & Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'mismatch' | 'missing_a' | 'missing_b'>('all');

    // Filter Logic
    const filteredRecords = records.filter(r => {
        if (r.status === 'matched') return false; // Always hide matched

        // 1. Filter by Type
        if (filterType === 'mismatch' && r.status !== 'mismatch') return false;
        if (filterType === 'missing_a' && r.status !== 'unmatched_b') return false; // Missing in A means it is unmatched_b
        if (filterType === 'missing_b' && r.status !== 'unmatched_a') return false; // Missing in B means it is unmatched_a

        // 2. Search
        if (!searchTerm) return true;
        const lowerSearch = searchTerm.toLowerCase();

        const idMatch = r.id && r.id.toLowerCase().includes(lowerSearch);
        const amountMatch = (r.amount?.toString().includes(searchTerm)) ||
            (r.originalAmount?.toString().includes(searchTerm)) ||
            (r.counterpartAmount?.toString().includes(searchTerm));

        return idMatch || amountMatch;
    });

    // Simple fuzzy match logic
    const reconcileData = async (dataA: any[], dataB: any[]) => {
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1500));

        const results: ReconciliationRecord[] = [];
        let matchCount = 0;
        let unmatchedACount = 0;
        let unmatchedBCount = 0;

        // Normalize helper
        const normalize = (row: any, type: 'fileA' | 'fileB'): ReconciliationRecord => {
            const amountKey = Object.keys(row).find(k => k.toLowerCase().includes('amount') || k.toLowerCase().includes('debit') || k.toLowerCase().includes('credit'));
            const dateKey = Object.keys(row).find(k => k.toLowerCase().includes('date') || k.toLowerCase().includes('dt'));
            const descKey = Object.keys(row).find(k => k.toLowerCase().includes('desc') || k.toLowerCase().includes('particular') || k.toLowerCase().includes('narrat'));
            const idKey = Object.keys(row).find(k => k.toLowerCase().includes('id') || k.toLowerCase().includes('ref') || k.toLowerCase().includes('inv') || k.toLowerCase().includes('cheque') || k.toLowerCase().includes('chk'));

            return {
                id: idKey ? String(row[idKey]) : crypto.randomUUID(),
                amount: amountKey ? parseFloat(String(row[amountKey]).replace(/[^0-9.-]+/g, '')) : 0,
                date: dateKey ? String(row[dateKey]) : '',
                description: descKey ? String(row[descKey]) : 'No description',
                source: type,
                status: ('unmatched_' + (type === 'fileA' ? 'a' : 'b')) as 'unmatched_a' | 'unmatched_b'
            };
        };

        const normalizedA = dataA.map(r => normalize(r, 'fileA'));
        const normalizedB = dataB.map(r => normalize(r, 'fileB'));

        const bUsedIndices = new Set<number>();

        // Matching Logic
        normalizedA.forEach(recordA => {
            let matchIndexB = -1;

            // Find a match in B that hasn't been used yet
            for (let i = 0; i < normalizedB.length; i++) {
                if (bUsedIndices.has(i)) continue;

                const recordB = normalizedB[i];

                // Logic: Exact ID match OR (Exact Amount + Exact Date)
                // In a real app, this would be fuzzier
                const exactIdMatch = recordA.id && recordB.id && recordA.id === recordB.id;
                const fuzzyMatch = recordA.amount === recordB.amount && recordA.date === recordB.date;

                if (exactIdMatch || fuzzyMatch) {
                    matchIndexB = i;
                    break;
                }
            }

            if (matchIndexB !== -1) {
                const recordB = normalizedB[matchIndexB];
                bUsedIndices.add(matchIndexB);

                const isAmountMatch = Math.abs(recordA.amount - recordB.amount) < 0.01;

                if (isAmountMatch) {
                    results.push({ ...recordA, status: 'matched', source: 'fileA' });
                    matchCount++;
                } else {
                    results.push({
                        ...recordA,
                        status: 'mismatch',
                        source: 'fileA',
                        originalAmount: recordA.amount,
                        counterpartAmount: recordB.amount
                    });
                }
            } else {
                results.push({ ...recordA, status: 'unmatched_a', source: 'fileA' });
                unmatchedACount++;
            }
        });

        // Identify remaining items in B
        normalizedB.forEach((recordB, index) => {
            if (!bUsedIndices.has(index)) {
                results.push({ ...recordB, status: 'unmatched_b', source: 'fileB' });
                unmatchedBCount++;
            }
        });

        setRecords(results);
        const mismatchCount = results.filter(r => r.status === 'mismatch').length;
        setIsProcessing(false);

        setReport({
            id: crypto.randomUUID(),
            userId: user?.id || '',
            date: new Date().toISOString(),
            fileAName: fileA!.name || 'File A',
            fileBName: fileB!.name || 'File B',
            totalRecords: normalizedA.length + normalizedB.length,
            matchedCount: matchCount,
            unmatchedACount,
            unmatchedBCount,
            mismatchCount
        });
    };

    const handleReconcile = () => {
        if (!fileA || !fileB) return;
        setIsProcessing(true);

        Papa.parse(fileA, {
            header: true,
            skipEmptyLines: true,
            complete: (resultsA) => {
                Papa.parse(fileB, {
                    header: true,
                    skipEmptyLines: true,
                    complete: async (resultsB) => {
                        await reconcileData(resultsA.data, resultsB.data);
                        setIsProcessing(false);
                    }
                });
            }
        });
    };



    // ... (handleReconcile)

    const saveReport = async () => {
        if (!user || !user.id) {
            alert('You must be logged in to save a report.');
            return;
        }

        if (report) {
            try {
                // Ensure userId is present even if it was missing during initial generation
                const reportToSave = { ...report, userId: user.id };
                await api.reports.save(reportToSave);
                navigate('/reports');
            } catch (error) {
                console.error('Failed to save report:', error);
                alert('Failed to save report. Please try again.');
            }
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Reconcile Data</h1>
                <p className="text-gray-500">Upload two CSV files to automatically identify matches and discrepancies.</p>
            </div>

            {!report ? (
                <Card>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <FileUploader label="Upload Register / Ledger (File A)" onFileSelect={setFileA} />
                        <FileUploader label="Upload Bank Statement (File B)" onFileSelect={setFileB} />
                    </div>

                    <div className="flex justify-end">
                        <Button
                            size="lg"
                            disabled={!fileA || !fileB}
                            isLoading={isProcessing}
                            onClick={handleReconcile}
                            className="w-full md:w-auto"
                        >
                            Start Reconciliation
                        </Button>
                    </div>
                </Card>
            ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div>
                        <p className="text-pink-600 font-medium cursor-pointer hover:underline mb-2" onClick={() => setReport(null)}>← Start Over</p>
                        <h2 className="text-2xl font-bold text-gray-800">Reconciliation Report</h2>
                        <p className="text-gray-500">Comparing {report.fileAName} vs {report.fileBName}</p>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="p-4 border-l-4 border-l-green-500 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Perfect Matches</p>
                                    <h3 className="text-2xl font-bold text-gray-800 mt-1">{report.matchedCount}</h3>
                                </div>
                                <div className="p-2 bg-green-100 rounded-lg text-green-600">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">
                                {((report.matchedCount * 2 / report.totalRecords) * 100).toFixed(1)}% match rate
                            </p>
                        </Card>

                        <Card className="p-4 border-l-4 border-l-amber-500 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Mismatches</p>
                                    <h3 className="text-2xl font-bold text-gray-800 mt-1">{report.mismatchCount || 0}</h3>
                                </div>
                                <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                                    <AlertOctagon className="w-5 h-5" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">Found in both but different amounts</p>
                        </Card>

                        <Card className="p-4 border-l-4 border-l-blue-500 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Missing in {report.fileAName ? report.fileAName.split('.')[0] : 'A'}</p>
                                    <h3 className="text-2xl font-bold text-gray-800 mt-1">{report.unmatchedBCount}</h3>
                                </div>
                                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                    <AlertOctagon className="w-5 h-5" />
                                </div>
                            </div>
                        </Card>

                        <Card className="p-4 border-l-4 border-l-red-500 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Missing in {report.fileBName ? report.fileBName.split('.')[0] : 'B'}</p>
                                    <h3 className="text-2xl font-bold text-gray-800 mt-1">{report.unmatchedACount}</h3>
                                </div>
                                <div className="p-2 bg-red-100 rounded-lg text-red-600">
                                    <AlertOctagon className="w-5 h-5" />
                                </div>
                            </div>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Reconciliation Overview Chart */}
                        <Card className="lg:col-span-1 min-h-[400px]">
                            <h3 className="font-bold text-gray-800 mb-4">Reconciliation Overview</h3>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: 'Matched', value: report.matchedCount, color: '#4ade80' },
                                                { name: 'Mismatch', value: report.mismatchCount, color: '#fbbf24' },
                                                { name: 'Missing in A', value: report.unmatchedBCount, color: '#3b82f6' },
                                                { name: 'Missing in B', value: report.unmatchedACount, color: '#ef4444' },
                                            ].filter(d => (d.value || 0) > 0)}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {[
                                                { name: 'Matched', value: report.matchedCount, color: '#4ade80' },
                                                { name: 'Mismatch', value: report.mismatchCount, color: '#fbbf24' },
                                                { name: 'Missing in A', value: report.unmatchedBCount, color: '#3b82f6' },
                                                { name: 'Missing in B', value: report.unmatchedACount, color: '#ef4444' },
                                            ].filter(d => (d.value || 0) > 0).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip />
                                        <Legend verticalAlign="bottom" height={36} iconType="rect" />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        {/* Discrepancy Details Table */}
                        <Card className="lg:col-span-2 overflow-hidden p-0 min-h-[400px]">
                            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                                <h3 className="font-bold text-gray-800">Discrepancy Details</h3>
                                <div className="flex w-full md:w-auto gap-4">
                                    <div className="w-full md:w-64">
                                        <Input
                                            placeholder="Search by ID or Amount..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <select
                                        className="h-11 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all cursor-pointer"
                                        value={filterType}
                                        onChange={(e) => setFilterType(e.target.value as any)}
                                    >
                                        <option value="all">All Discrepancies</option>
                                        <option value="mismatch">Mismatches Only</option>
                                        <option value="missing_a">Missing in A</option>
                                        <option value="missing_b">Missing in B</option>
                                    </select>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-500 bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 font-medium">Type</th>
                                            <th className="px-6 py-3 font-medium">ID</th>
                                            <th className="px-6 py-3 font-medium">Source A</th>
                                            <th className="px-6 py-3 font-medium">Source B</th>
                                            <th className="px-6 py-3 font-medium">Diff</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredRecords.map((record, idx) => {
                                            let diff = record.amount;
                                            if (record.status === 'mismatch' && record.originalAmount !== undefined && record.counterpartAmount !== undefined) {
                                                diff = Math.abs(record.originalAmount - record.counterpartAmount);
                                            }

                                            return (
                                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <span className={`font-bold ${record.status === 'unmatched_a' ? 'text-red-500' :
                                                            record.status === 'unmatched_b' ? 'text-blue-500' : 'text-amber-500'
                                                            }`}>
                                                            {record.status === 'unmatched_a' ? 'Missing in B' :
                                                                record.status === 'unmatched_b' ? 'Missing in A' : 'Mismatch'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 font-mono text-gray-600 text-xs">
                                                        {record.id ? record.id.slice(0, 8).toUpperCase() : '---'}
                                                    </td>
                                                    <td className="px-6 py-4 font-medium text-gray-900">
                                                        {record.status === 'mismatch' ? record.originalAmount?.toFixed(2) :
                                                            record.source === 'fileA' ? record.amount.toFixed(2) : '---'}
                                                    </td>
                                                    <td className="px-6 py-4 font-medium text-gray-900">
                                                        {record.status === 'mismatch' ? record.counterpartAmount?.toFixed(2) :
                                                            record.source === 'fileB' ? record.amount.toFixed(2) : '---'}
                                                    </td>
                                                    <td className="px-6 py-4 font-medium" style={{ color: diff !== 0 ? 'red' : 'green' }}>
                                                        {diff.toFixed(2)}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {filteredRecords.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                                    No matching discrepancies found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>

                    <div className="flex justify-end gap-4">
                        <Button onClick={saveReport} className="bg-pink-600 hover:bg-pink-700">
                            <Save className="w-4 h-4 mr-2" />
                            Save Report
                        </Button>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
