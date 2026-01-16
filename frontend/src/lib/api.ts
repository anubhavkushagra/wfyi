import axios from 'axios';
import type { User, ReconciliationReport } from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const client = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const api = {
    auth: {
        login: async (email: string): Promise<User> => {
            const { data } = await client.post('/login', { email });
            return data;
        },

        logout: async () => {
            // Client-side cleanup only for now
        },

        getUser: (): User | null => {
            // In a real app we'd verify token, here we rely on React Context for state
            return null;
        }
    },

    reports: {
        save: async (report: ReconciliationReport) => {
            await client.post('/reports', report);
        },

        getAll: async (): Promise<ReconciliationReport[]> => {
            const { data } = await client.get('/reports');
            return data;
        }
    }
};
