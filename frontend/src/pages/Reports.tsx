import { Card } from '../components/ui/Card';
import { api } from '../lib/api';
import { FileClock } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { ReconciliationReport } from '../lib/types';

import { useAuth } from '../context/AuthContext';

export function Reports() {
    const { user } = useAuth();
    const [reports, setReports] = useState<ReconciliationReport[]>([]);

    useEffect(() => {
        if (user?.id) {
            api.reports.getAll(user.id).then(setReports).catch(console.error);
        }
    }, [user?.id]);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">History Reports</h1>
                <p className="text-gray-500">View past reconciliation sessions.</p>
            </div>

            <div className="grid gap-4">
                {reports.map((report) => (
                    <Card key={report.id} className="cursor-pointer hover:shadow-soft-xl transition-shadow">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-gray-100 rounded-lg text-gray-600">
                                    <FileClock className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">
                                        {report.fileAName} vs {report.fileBName}
                                    </h3>
                                    <p className="text-sm text-gray-500">{new Date(report.date).toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-center">
                                    <p className="text-xs text-green-600 font-bold uppercase">Matched</p>
                                    <p className="text-lg font-bold text-gray-800">{report.matchedCount}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-orange-600 font-bold uppercase">Unmatched</p>
                                    <p className="text-lg font-bold text-gray-800">{report.unmatchedACount + report.unmatchedBCount}</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}

                {reports.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                        <FileClock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No reports found. Run a reconciliation to see it here.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
