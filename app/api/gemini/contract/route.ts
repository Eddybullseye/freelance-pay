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
    const { title, clientName, freelancerName, totalAmount, currency, industry, scope, revisionLimit } =
      await req.json();

    const prompt = `
You are a top-tier international tech and freelance legal advisor.
Draft a concise, crystal-clear, professional Freelance Service & Escrow Agreement between:
- Service Provider (Freelancer): ${freelancerName || 'Chinedu Okafor'}
- Client: ${clientName || 'Client Organization'}

Project Specifications:
- Project Title: ${title || 'Software Engineering Project'}
- Industry Domain: ${industry || 'Software Engineering & Web Development'}
- Agreed Total Fee: ${currency || 'NGN'} ${totalAmount || '1,500,000'}
- Stated Scope of Deliverables: ${scope || 'Full development and deployment as specified'}
- Revision Allowance: ${revisionLimit || 2} rounds of revision included; further revisions billed at hourly standard rate.

Structure your response into the following clear markdown sections:
1. Purpose & Core Scope of Work
2. Milestone Deliverables & Escrow Release Schedule (50% Milestone 1, 50% Final Handover)
3. Revision Policy & Scope Creep Protection Clauses
4. Intellectual Property & Transfer of Rights (upon 100% payment)
5. Cancellation & Dispute Resolution through FreelancePay Escrow Mediation
6. Signatures & Binding Confirmation

Keep the tone authoritative, modern, clean, and direct. Avoid unnecessary legalese filler.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return NextResponse.json({
      contractText: response.text || 'Unable to generate contract text.',
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Contract generation failed';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
