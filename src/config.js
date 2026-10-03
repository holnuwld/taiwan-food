import dotenv from 'dotenv';
dotenv.config();
export const CONFIG = {
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    modelName: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
    maxIterations: parseInt(process.env.MAX_ITERATIONS || '3', 10),
    defaultBudgetKrw: 600000, // 60만 원
    defaultTwdToKrwRate: 42.5,
};
