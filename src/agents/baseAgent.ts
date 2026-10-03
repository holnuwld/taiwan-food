import { GoogleGenAI } from '@google/genai';
import { CONFIG } from '../config.js';
import { AgentName } from '../types.js';

export abstract class BaseAgent {
  public name: AgentName;
  protected client: GoogleGenAI | null = null;
  protected modelName: string;

  constructor(name: AgentName) {
    this.name = name;
    this.modelName = CONFIG.modelName;

    if (CONFIG.geminiApiKey) {
      try {
        this.client = new GoogleGenAI({ apiKey: CONFIG.geminiApiKey });
      } catch (err) {
        console.warn(`[${name}] Warning: Could not initialize Gemini client:`, err);
        this.client = null;
      }
    }
  }

  /**
   * Helper to execute Gemini prompt if API key is present
   */
  protected async callGemini(systemPrompt: string, userPrompt: string): Promise<string | null> {
    if (!this.client) {
      return null;
    }

    try {
      const response = await this.client.interactions.create({
        model: this.modelName,
        input: `${systemPrompt}\n\nUser Request / Context:\n${userPrompt}`,
      });
      return response.output_text || null;
    } catch (err: any) {
      console.warn(`[${this.name}] Gemini call error: ${err.message}. Falling back to rule-based engine.`);
      return null;
    }
  }
}
