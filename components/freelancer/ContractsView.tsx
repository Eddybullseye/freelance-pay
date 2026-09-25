'use client';

import React, { useState } from 'react';
import { useFreelancePay } from '@/lib/store';
import { Contract, ContractMilestone } from '@/lib/types';
import {
  FileText,
  Shield,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  ExternalLink,
  PenTool,
  Send,
  Loader2,
  X,
  FileCheck,
} from 'lucide-react';

export function ContractsView() {
  const { contracts, submitMilestone, signContract, formatCurrency } = useFreelancePay();

  // Active modal states
  const [selectedContract, setSelectedContract] = useState<Contract | null>(contracts[0] || null);
  const [submittingMilestone, setSubmittingMilestone] = useState<{
    contractId: string;
    milestone: ContractMilestone;
  } | null>(null);
  const [deliverableLink, setDeliverableLink] = useState('https://github.com/finpulse/core-api/pull/18');
  const [deliverableNotes, setDeliverableNotes] = useState('All sprint test fixtures passing with 99% coverage.');

  // AI Contract Generator State
  const [isGeneratingContract, setIsGeneratingContract] = useState(false);
  const [generatedContractText, setGeneratedContractText] = useState<string | null>(null);
  const [contractTitle, setContractTitle] = useState('Fintech API & Mobile Checkout Service Agreement');
  const [contractClientName, setContractClientName] = useState('FinPulse Systems Ltd');
  const [contractFee, setContractFee] = useState('1500000');
  const [contractIndustry, setContractIndustry] = useState('Software Engineering & Payment Systems');
  const [contractScope, setContractScope] = useState(
    'Implementation of Paystack virtual accounts, webhook reconciliation engine, and automated dispute resolution state machine.'
  );

  // Scope Creep Detector State
  const [isCheckingScope, setIsCheckingScope] = useState(false);
  const [scopeCheckClientMsg, setScopeCheckClientMsg] = useState(
    'Can we also quickly add an automated SMS alert system to all Nigerian banks and a multi-branch team permission manager before launch?'
  );
  const [scopeCheckResult, setScopeCheckResult] = useState<{
    isScopeCreep: boolean;
    severity: string;
    reason: string;
    suggestedFeeEstimate: string;
    suggestedEmailResponse: string;
  } | null>(null);

  // E-Signature state
  const [signatureName, setSignatureName] = useState('Chinedu Okafor');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSubmitMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingMilestone) return;

    submitMilestone(
      submittingMilestone.contractId,
      submittingMilestone.milestone.id,
      deliverableLink,
      deliverableNotes
    );
    setSubmittingMilestone(null);
    showToast(`Milestone "${submittingMilestone.milestone.title}" submitted for client verification.`);
  };

  const handleSignContract = (contractId: string) => {
    if (!signatureName) return;
    signContract(contractId, 'freelancer', signatureName);
    showToast(`Contract electronically signed with legal hash confirmation.`);
  };

  const handleGenerateContractAI = async () => {
    setIsGeneratingContract(true);
    try {
      const res = await fetch('/api/gemini/contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: contractTitle,
          clientName: contractClientName,
          freelancerName: 'Chinedu Okafor',
          totalAmount: contractFee,
          currency: 'NGN',
          industry: contractIndustry,
          scope: contractScope,
          revisionLimit: 2,
        }),
      });
      const data = await res.json();
      setGeneratedContractText(data.contractText || 'Draft ready.');
    } catch {
      showToast('Error generating AI contract draft.');
    } finally {
      setIsGeneratingContract(false);
    }
  };

  const handleAnalyzeScopeCreep = async () => {
    setIsCheckingScope(true);
    try {
      const res = await fetch('/api/gemini/scope-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractScope: selectedContract?.scopeSummary || contractScope,
          clientMessage: scopeCheckClientMsg,
        }),
      });
      const data = await res.json();
      setScopeCheckResult(data);
    } catch {
      showToast('Error analyzing scope creep.');
    } finally {
      setIsCheckingScope(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-slate-900 text-teal-300 text-xs px-4 py-2.5 rounded-lg flex items-center justify-between shadow-md animate-fade-in">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Contracts, Milestone Escrow & AI Protection
              </h2>
              <p className="text-xs text-slate-500">
                Guaranteed escrow funding, milestone sign-offs, revision enforcement, and AI contract generation.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setGeneratedContractText(null)}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>AI Contract Generator</span>
          </button>
        </div>
      </div>

      {/* Active Contracts & Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Contract Details & Milestones */}
        <div className="lg:col-span-2 space-y-4">
          {contracts.map((contract) => (
            <div key={contract.id} className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{contract.title}</h3>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                      contract.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {contract.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Client: <strong className="text-slate-800">{contract.clientName}</strong> · Total Value:{' '}
                    <strong className="font-mono text-slate-900 font-bold">{formatCurrency(contract.totalAmount, contract.currency)}</strong>
                  </p>
                </div>

                <div className="text-xs text-slate-500 sm:text-right">
                  <span>Revisions Used: </span>
                  <strong className="font-mono text-slate-900 font-bold">
                    {contract.revisionsUsed} of {contract.revisionLimit} max
                  </strong>
                </div>
              </div>

              {/* Scope Summary */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs text-slate-700 leading-relaxed font-sans">
                <span className="font-semibold text-slate-900 block mb-1">Agreed Deliverables Scope:</span>
                {contract.scopeSummary}
              </div>

              {/* Milestones List */}
              <div className="space-y-3">
                <span className="text-xs font-semibold text-slate-800 block">
                  Milestone Escrow Payment Schedule (Funds held securely until client sign-off)
                </span>
                <div className="space-y-2">
                  {contract.milestones.map((m, idx) => (
                    <div
                      key={m.id}
                      className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{m.title}</span>
                          <span className="text-slate-400">({m.percentage}%)</span>
                        </div>
                        <p className="text-slate-500 text-[11px]">{m.description}</p>
                        <div className="text-[11px] text-slate-400 font-mono">
                          Target Due: {m.dueDate}
                          {m.deliverableLink && (
                            <span className="ml-2 text-teal-700 underline">
                              <a href={m.deliverableLink} target="_blank" rel="noreferrer">View Submitted Link</a>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono font-bold text-slate-900 tabular-nums">
                          {formatCurrency(m.amount, contract.currency)}
                        </span>

                        {m.status === 'approved' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Approved & Released</span>
                          </span>
                        ) : m.status === 'submitted' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Under Client Review</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => setSubmittingMilestone({ contractId: contract.id, milestone: m })}
                            className="px-3 py-1.5 bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold rounded-lg shadow-xs flex items-center gap-1 text-[11px] transition-colors cursor-pointer"
                          >
                            <Send className="w-3 h-3" />
                            <span>Submit Deliverable</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Electronic Signature Box */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  <span>
                    Freelancer Signature:{' '}
                    <strong>{contract.signedByFreelancer ? contract.freelancerSignature : 'Pending Sign-Off'}</strong>
                  </span>
                </div>
                {!contract.signedByFreelancer && (
                  <button
                    onClick={() => handleSignContract(contract.id)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>E-Sign Contract</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Right Col: AI Scope Creep Detector */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">AI Scope Creep Sentinel</h3>
                <p className="text-[11px] text-slate-500">Detect unpaid out-of-scope client requests</p>
              </div>
            </div>

            <p className="text-slate-600 leading-relaxed">
              Did a client ask for &quot;one quick tweak&quot; or extra features? Paste their message below to verify if it violates your contract scope.
            </p>

            <textarea
              rows={3}
              value={scopeCheckClientMsg}
              onChange={(e) => setScopeCheckClientMsg(e.target.value)}
              placeholder="Paste client email or Slack request..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white resize-none"
            />

            <button
              onClick={handleAnalyzeScopeCreep}
              disabled={isCheckingScope}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
            >
              {isCheckingScope ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing against signed scope...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                  <span>Analyze Scope Creep</span>
                </>
              )}
            </button>

            {scopeCheckResult && (
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 animate-fade-in font-sans">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">Assessment:</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                      scopeCheckResult.isScopeCreep
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {scopeCheckResult.isScopeCreep ? `Scope Creep (${scopeCheckResult.severity})` : 'Within Scope'}
                  </span>
                </div>

                <p className="text-slate-700 leading-relaxed text-[11px]">
                  {scopeCheckResult.reason}
                </p>

                {scopeCheckResult.suggestedFeeEstimate && (
                  <div className="bg-amber-50 p-2 rounded border border-amber-200 text-amber-900 text-[11px] font-mono">
                    <strong>Suggested Change Order Fee:</strong> {scopeCheckResult.suggestedFeeEstimate}
                  </div>
                )}

                <div>
                  <span className="font-semibold text-slate-800 block mb-1">
                    Canned Polite Response Script:
                  </span>
                  <div className="bg-white p-2.5 rounded border border-slate-200 text-slate-600 text-[11px] italic leading-relaxed">
                    &quot;{scopeCheckResult.suggestedEmailResponse}&quot;
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(scopeCheckResult.suggestedEmailResponse);
                      showToast('Response script copied to clipboard!');
                    }}
                    className="mt-1.5 text-[11px] text-teal-700 font-semibold hover:underline cursor-pointer"
                  >
                    Copy Response
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Contract Generator Modal */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900">Generate Legally Protective Contract with Gemini AI</h3>
          </div>
          <span className="text-slate-400">Model: gemini-3.8-flash</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Project Agreement Title</label>
            <input
              type="text"
              value={contractTitle}
              onChange={(e) => setContractTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Client Organization</label>
            <input
              type="text"
              value={contractClientName}
              onChange={(e) => setContractClientName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Total Fee (₦)</label>
            <input
              type="number"
              value={contractFee}
              onChange={(e) => setContractFee(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900 focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Scope & Handover Inclusions</label>
          <textarea
            rows={2}
            value={contractScope}
            onChange={(e) => setContractScope(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500 resize-none font-sans"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleGenerateContractAI}
            disabled={isGeneratingContract}
            className="px-4 py-2 bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
          >
            {isGeneratingContract ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Drafting Clauses...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Legal Contract Draft</span>
              </>
            )}
          </button>
        </div>

        {generatedContractText && (
          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 leading-relaxed font-sans text-xs whitespace-pre-wrap animate-fade-in max-h-96 overflow-y-auto">
            {generatedContractText}
          </div>
        )}
      </div>

      {/* Submit Milestone Modal */}
      {submittingMilestone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-fade-in text-xs">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Submit Milestone Deliverable</h3>
                <p className="text-[11px] text-slate-500">{submittingMilestone.milestone.title}</p>
              </div>
              <button
                onClick={() => setSubmittingMilestone(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitMilestone} className="p-6 space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Deliverable URL (GitHub Pull Request, Figma link, Staging URL)
                </label>
                <input
                  type="url"
                  value={deliverableLink}
                  onChange={(e) => setDeliverableLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Handover Notes & Verification Instructions for Client
                </label>
                <textarea
                  rows={4}
                  value={deliverableNotes}
                  onChange={(e) => setDeliverableNotes(e.target.value)}
                  placeholder="Describe completed tasks, test coverage, and sign-off instructions..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white resize-none"
                  required
                />
              </div>

              <div className="p-3 bg-teal-50 rounded-lg border border-teal-200 text-teal-900 text-[11px]">
                Upon submission, the client is notified to review within 3 business days. Once approved, the escrow deposit of <strong>{formatCurrency(submittingMilestone.milestone.amount)}</strong> is immediately released to your bank account.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSubmittingMilestone(null)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-lg font-medium text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Confirm & Dispatch</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
