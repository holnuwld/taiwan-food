import { GoogleGenAI } from '@google/genai';
import { CONFIG } from '../config.js';
export class BaseAgent {
    name;
    client = null;
    modelName;
    constructor(name) {
        this.name = name;
        this.modelName = CONFIG.modelName;
        if (CONFIG.geminiApiKey) {
            try {
                this.client = new GoogleGenAI({ apiKey: CONFIG.geminiApiKey });
            }
            catch (err) {
                console.warn(`[${name}] Warning: Could not initialize Gemini client:`, err);
                this.client = null;
            }
        }
    }
    /**
     * Helper to execute Gemini prompt if API key is present
     */
    async callGemini(systemPrompt, userPrompt) {
        if (!this.client) {
            return null;
        }
        try {
            const response = await this.client.interactions.create({
                model: this.modelName,
                input: `${systemPrompt}\n\nUser Request / Context:\n${userPrompt}`,
            });
            return response.output_text || null;
        }
        catch (err) {
            console.warn(`[${this.name}] Gemini call error: ${err.message}. Falling back to rule-based engine.`);
            return null;
        }
    }
}
