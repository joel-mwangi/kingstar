import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, assetData, riskRules } = body;

    const fullPrompt = prompt || `You are an elite quantitative trading AI co-pilot. 
    Analyze the following market data and risk parameters for our automated algorithmic trading bot:
    
    Assets & Predictions:
    ${JSON.stringify(assetData, null, 2)}
    
    Risk Management Rules:
    ${JSON.stringify(riskRules, null, 2)}
    
    Provide a professional quant analysis including:
    1. Market Regime Assessment (Bullish/Bearish/Volatile)
    2. ML Model Calibration & Probability Reliability check
    3. Risk Exposure & Tail Risk warnings
    4. Suggested Strategy Tweaks for maximum risk-adjusted return (Sharpe).
    Keep it structured, punchy, and actionable for a trading desk.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
    });

    return NextResponse.json({ analysis: response.text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to connect to Gemini AI" },
      { status: 500 }
    );
  }
}
