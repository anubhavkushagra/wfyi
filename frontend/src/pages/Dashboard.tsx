import { Card } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FileCheck, AlertCircle, Clock, ArrowUpRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { ReconciliationReport } from '../lib/types';

export function Dashboard() {
    const { user } = useAuth();
    const [reports, setReports] = useState<ReconciliationReport[]>([]);

    useEffect(() => {
        if (user?.id) {
            api.reports.getAll(user.id).then(setReports).catch(console.error);
        }
    }, [user?.id]);

    // Quick stats
    const totalReconciliations = reports.length;
    const totalMatches = reports.reduce((acc, curr) => acc + curr.matchedCount, 0);
    const totalMismatches = reports.reduce((acc, curr) => acc + curr.unmatchedACount + curr.unmatchedBCount, 0);

    // Recent activity chart data - last 5 reports
    const chartData = reports.slice(0, 5).reverse().map(r => ({
        name: new Date(r.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        Matched: r.matchedCount,
        Unmatched: r.unmatchedACount + r.unmatchedBCount,
    }));

    const stats = [
        { title: 'Total Reconciliations', value: totalReconciliations, icon: FileCheck, color: 'text-green-500', bg: 'bg-green-50' },
        { title: 'Total Matches', value: totalMatches, icon: ArrowUpRight, color: 'text-blue-500', bg: 'bg-blue-50' },
        { title: 'Open Discrepancies', value: totalMismatches, icon: AlertCircle, color: 'text-[var(--color-primary)]', bg: 'bg-pink-50' },
    ];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Welcome back, {user?.name}</h1>
                    <p className="text-gray-500">Here's what's happening with your accounts today.</p>
                </div>
                <div className="text-sm text-gray-400 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> {new Date().toLocaleDateString()}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat) => (
                    <Card key={stat.title} className="p-6">
                        <div className="flex items-center gap-4">
                            <div className={`p-4 rounded-xl ${stat.bg}`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart */}
                <div className="lg:col-span-2">
                    <Card className="h-full min-h-[400px]">
                        <h3 className="text-lg font-bold text-gray-800 mb-6">Reconciliation Trends</h3>
                        <div className="h-[300px] w-full">
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} barSize={20}>
                                        <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            cursor={{ fill: 'transparent' }}
                                        />
                                        <Bar dataKey="Matched" fill="#82ca9d" radius={[4, 4, 0, 0]}>
                                            {chartData.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill="#4ade80" />
                                            ))}
                                        </Bar>
                                        <Bar dataKey="Unmatched" fill="#cb0c9f" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-400">
                                    No data available yet
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Recent Activity */}
                <div className="lg:col-span-1">
                    <Card className="h-full">
                        <h3 className="text-lg font-bold text-gray-800 mb-6">Recent Reports</h3>
                        <div className="space-y-4">
                            {reports.slice(0, 5).map((report) => (
                                <div key={report.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
                                            <FileSpreadsheet className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                                                {new Date(report.date).toLocaleDateString()}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {report.totalRecords} records
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${report.unmatchedACount + report.unmatchedBCount === 0
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-orange-100 text-orange-700'
                                        }`}>
                                        {report.matchedCount} / {report.totalRecords}
                                    </span>
                                </div>
                            ))}
                            {reports.length === 0 && (
                                <p className="text-center text-gray-400 text-sm py-8">
                                    No reconciliations performed yet.
                                </p>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

// Need to import icon which I forgot in the imports above
import { FileSpreadsheet } from 'lucide-react';
