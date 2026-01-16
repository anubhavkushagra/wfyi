
import { Sidebar } from './Sidebar';
import { Outlet } from 'react-router-dom';

export function Layout() {
    return (
        <div className="min-h-screen bg-[var(--color-background)]">
            <Sidebar />
            <main className="pl-64 p-8 transition-all duration-300">
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
