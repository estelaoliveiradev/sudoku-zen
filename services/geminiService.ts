
import { GoogleGenAI, Type } from "@google/genai";
import { Cell, HintResponse } from "../types";

export const getSmartHint = async (board: Cell[][], solution: number[][], customApiKey?: string): Promise<HintResponse | null> => {
  // Em ambientes de produção/Vite, process.env pode não estar definido.
  // Usamos uma verificação segura para evitar crash.
  const envKey = typeof process !== 'undefined' && process.env ? process.env.API_KEY : undefined;
  const apiKey = customApiKey || envKey;
  
  if (!apiKey) {
    console.warn("API Key não fornecida pelo usuário ou ambiente.");
    return null;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const boardState = board.map(row => row.map(cell => cell.value || 0));
    const prompt = `
      Estou jogando Sudoku. Aqui está o estado atual do meu tabuleiro (0 representa vazio):
      ${JSON.stringify(boardState)}
      
      A solução correta é:
      ${JSON.stringify(solution)}
      
      Escolha uma célula vazia estrategicamente para me dar uma dica. 
      Explique o motivo lógico (ex: 'É o único lugar para o número X nesta linha').
      Responda em Português do Brasil.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            row: { type: Type.INTEGER, description: "Índice da linha (0-8)" },
            col: { type: Type.INTEGER, description: "Índice da coluna (0-8)" },
            value: { type: Type.INTEGER, description: "O número correto para esta célula" },
            explanation: { type: Type.STRING, description: "Explicação estratégica do porquê esse número vai ali" }
          },
          required: ["row", "col", "value", "explanation"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;

    return JSON.parse(text) as HintResponse;
  } catch (error) {
    console.error("Erro ao obter dica da IA:", error);
    return null;
  }
};
