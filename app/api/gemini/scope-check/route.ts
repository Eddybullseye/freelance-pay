import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export async function POST(req: NextRequest) {
  try {
    const { contractScope, clientMessage } = await req.json();

    const prompt = `
You are a senior freelance project manager and negotiation expert for FreelancePay.
Analyze whether the following client request constitutes "Scope Creep" beyond the agreed contract deliverables.

Agreed Contract Scope:
"${contractScope || 'Development of standard responsive landing page and basic checkout'}"

New Client Message / Feature Request:
"${clientMessage || 'Can we also add a multi-vendor admin dashboard and automated SMS reminders by tomorrow?'}"

Provide an assessment in JSON format with these exact keys:
- isScopeCreep: boolean (true if request expands beyond original deliverables)
- severity: "none" | "low" | "medium" | "high"
- reason: short explanation of why it is or is not within scope
- suggestedFeeEstimate: recommended additional change-order fee (in percentage or amount)
- suggestedEmailResponse: a courteous, professional, client-friendly email reply the freelancer can copy-paste to explain why this requires an additional change order or milestone invoice.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return NextResponse.json(parsed);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Scope check analysis failed';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
