import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { motion } from 'framer-motion';

export function Login() {
    const { login, isLoading, error } = useAuth();
    const [email, setEmail] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        await login(email);
    };

    return (
        <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-100/50 to-pink-100/50 z-0" />

            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-md z-10"
            >
                <Card className="shadow-2xl border-none backdrop-blur-sm bg-white/90">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-purple-600 bg-clip-text text-transparent mb-2">
                            Smart Recon
                        </h1>
                        <p className="text-gray-500">Sign in to manage your reconciliations</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-3 bg-red-50 text-red-500 text-sm rounded-lg border border-red-100">
                                {error}
                            </div>
                        )}
                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoFocus
                        />

                        <Button
                            type="submit"
                            className="w-full"
                            isLoading={isLoading}
                            size="lg"
                        >
                            Sign In
                        </Button>

                        <p className="text-xs text-center text-gray-400 mt-4">
                            Use any email to sign in (Demo Mode)
                        </p>
                    </form>
                </Card>
            </motion.div>
        </div>
    );
}
