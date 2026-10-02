import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

function compact(value: unknown, maxChars: number): string {
  const text = JSON.stringify(value ?? null);
  return text.length > maxChars ? text.slice(0, maxChars) + '...' : text;
}

export async function POST(req: NextRequest) {
  if (!ai) {
    return NextResponse.json({ error: 'GEMINI_API_KEY is not configured.' }, { status: 503 });
  }

  try {
    const body = await req.json();
    const prompt = typeof body?.prompt === 'string' ? body.prompt.trim().slice(0, 2000) : '';
    const assetData = Array.isArray(body?.assetData) ? body.assetData : [];
    const positions = Array.isArray(body?.positions) ? body.positions : [];
    const riskRules = body?.riskRules || {};
    const account = body?.account || {};

    const context =
      'You are an advisory quantitative trading analyst. Do not place orders, claim certainty, or invent missing data. ' +
      'Treat directional confidence as an uncalibrated heuristic score, not as a calibrated probability. ' +
      'Clearly separate observations from inferences.\n\n' +
      'Current account: ' + compact(account, 2500) + '\n' +
      'Assets: ' + compact(assetData, 9000) + '\n' +
      'Positions: ' + compact(positions, 5000) + '\n' +
      'Risk rules: ' + compact(riskRules, 3000) + '\n\n' +
      'User request: ' + (prompt || 'Produce a concise risk and market-structure review of the current account and monitored assets.');

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: context,
    });

    return NextResponse.json({ analysis: response.text || 'No analysis returned.' });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'AI analysis failed.' },
      { status: 500 }
    );
  }
}
