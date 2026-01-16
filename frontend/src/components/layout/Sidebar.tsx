import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileSpreadsheet, History, LogOut } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

export function Sidebar() {
    const { logout } = useAuth();

    const links = [
        { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/reconcile', icon: FileSpreadsheet, label: 'Reconcile' },
        { to: '/reports', icon: History, label: 'Reports' },
    ];

    return (
        <div className="h-screen w-64 bg-white border-r border-gray-100 flex flex-col fixed left-0 top-0 z-20">
            <div className="p-6">
                <h1 className="text-xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-purple-600 bg-clip-text text-transparent">
                    Smart Recon
                </h1>
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-4">
                {links.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-[var(--color-primary)] text-white shadow-soft-xl"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            )
                        }
                    >
                        <link.icon className="w-5 h-5" />
                        {link.label}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-100">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </button>
            </div>
        </div>
    );
}
