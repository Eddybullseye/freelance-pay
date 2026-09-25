'use client';

import React, { useState } from 'react';
import { useFreelancePay } from '@/lib/store';
import {
  ShieldAlert,
  DollarSign,
  TrendingUp,
  Users,
  CheckCircle,
  XCircle,
  FileCheck,
  Scale,
  Building,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';

interface AdminPortalProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function AdminPortal({ activeTab, setActiveTab }: AdminPortalProps) {
  const {
    invoices,
    contracts,
    payments,
    clients,
    disputes,
    resolveDispute,
    formatCurrency,
  } = useFreelancePay();

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState(
    'Mediator review concluded that deliverable scope was met per signed contract agreement.'
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Compute Platform Financials
  const totalGMV = invoices.reduce((sum, inv) => sum + inv.amount, 0) + contracts.reduce((sum, c) => sum + c.totalAmount, 0);
  const totalSettledPayments = payments.reduce((sum, p) => sum + p.amount, 0);
  const platformFeeRevenue = Math.round(totalSettledPayments * 0.015);
  const escrowHeld = contracts
    .filter((c) => c.status === 'active')
    .reduce((sum, c) => {
      const pendingMilestones = c.milestones.filter((m) => m.status !== 'approved');
      return sum + pendingMilestones.reduce((mSum, m) => mSum + m.amount, 0);
    }, 0);

  const handleResolve = (
    disputeId: string,
    action: 'release_to_freelancer' | 'refund_to_client'
  ) => {
    resolveDispute(disputeId, action, resolutionNotes);
    showToast(`Dispute marked as ${action === 'release_to_freelancer' ? 'Resolved (Funds to Freelancer)' : 'Refunded to Client'}`);
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

      {/* Admin Header */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">Platform Admin & Operations Console</h2>
                <span className="text-[11px] bg-slate-900 text-teal-400 px-2 py-0.5 rounded font-mono font-semibold">
                  Founder Access
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Gross Merchandise Value, 1.5% transaction commission, escrow holdbacks, and dispute mediation.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
          <button
            onClick={() => setActiveTab('admin-overview')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
              activeTab === 'admin-overview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Metrics & Revenue
          </button>
          <button
            onClick={() => setActiveTab('admin-disputes')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
              activeTab === 'admin-disputes' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Disputes ({disputes.length})
          </button>
          <button
            onClick={() => setActiveTab('admin-kyc')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
              activeTab === 'admin-kyc' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            KYC Verification
          </button>
          <button
            onClick={() => setActiveTab('admin-ledger')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
              activeTab === 'admin-ledger' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Escrow Ledger
          </button>
        </div>
      </div>

      {/* Admin KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block mb-1">Platform GMV (Gross Value)</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {formatCurrency(totalGMV)}
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">All processed invoices & contracts</span>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block mb-1">FreelancePay Net Revenue (1.5%)</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600">
            {formatCurrency(platformFeeRevenue)}
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold mt-2 block">
            Paystack auto-split processing fee
          </span>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block mb-1">Escrow Vault Active Hold</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-teal-800">
            {formatCurrency(escrowHeld)}
          </div>
          <span className="text-[11px] text-teal-700 font-semibold mt-2 block">
            Secured funds awaiting milestone sign-off
          </span>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block mb-1">Open Dispute Cases</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-rose-600">
            {disputes.filter((d) => d.status === 'open' || d.status === 'under_review').length}
          </div>
          <span className="text-[11px] text-rose-600 font-medium mt-2 block">
            Target SLA: 24h mediation
          </span>
        </div>
      </div>

      {/* DISPUTES MEDIATION VIEW */}
      {activeTab === 'admin-disputes' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900">Active Dispute Resolution Queue</h3>
            <div className="space-y-4">
              {disputes.map((disp) => (
                <div key={disp.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{disp.reason}</span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold uppercase bg-amber-100 text-amber-800">
                          {disp.status}
                        </span>
                      </div>
                      <p className="text-slate-500 mt-0.5">Contract: {disp.contractTitle}</p>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {formatCurrency(disp.amount, disp.currency)}
                      </span>
                      <div className="text-[11px] text-slate-400">Escrow Value at Stake</div>
                    </div>
                  </div>

                  {/* Statements */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                      <span className="font-semibold text-slate-900">Freelancer Statement ({disp.freelancerName}):</span>
                      <p className="text-slate-600 leading-relaxed text-[11px]">&quot;{disp.freelancerStatement}&quot;</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                      <span className="font-semibold text-slate-900">Client Statement ({disp.clientName}):</span>
                      <p className="text-slate-600 leading-relaxed text-[11px]">&quot;{disp.clientStatement}&quot;</p>
                    </div>
                  </div>

                  {/* Resolution Input & Actions */}
                  {disp.status === 'under_review' || disp.status === 'open' ? (
                    <div className="pt-2 border-t border-slate-200 space-y-2">
                      <label className="block font-semibold text-slate-700">Admin Mediator Findings & Ruling:</label>
                      <input
                        type="text"
                        value={resolutionNotes}
                        onChange={(e) => setResolutionNotes(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900"
                      />
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          onClick={() => handleResolve(disp.id, 'refund_to_client')}
                          className="px-3 py-1.5 border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-lg cursor-pointer"
                        >
                          Refund Escrow to Client
                        </button>
                        <button
                          onClick={() => handleResolve(disp.id, 'release_to_freelancer')}
                          className="px-3.5 py-1.5 bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold rounded-lg shadow-xs cursor-pointer"
                        >
                          Release Escrow to Freelancer
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-800 font-medium">
                      Resolved: {disp.resolutionDetails}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* KYC VERIFICATION QUEUE */}
      {activeTab === 'admin-kyc' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden text-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
            Pending Identity Verification & Anti-Fraud Queue
          </div>
          <div className="divide-y divide-slate-100">
            <div className="p-4 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 text-sm">Chinedu Okafor</span>
                <p className="text-slate-500">Document: National Identity Number (NIN) · Bank: Access Bank (0129482019)</p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-semibold text-[11px]">
                Verified & Active
              </span>
            </div>

            <div className="p-4 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 text-sm">FinPulse Systems Ltd (Amara Sterling)</span>
                <p className="text-slate-500">Document: CAC Corporate Certificate · Verified Paystack Corporate Card</p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-semibold text-[11px]">
                Verified Safe Client
              </span>
            </div>

            <div className="p-4 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 text-sm">Vance Digital US (Marcus Vance)</span>
                <p className="text-slate-500">Document: US Delaware LLC Certificate · Payment Method: International Visa</p>
              </div>
              <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded font-semibold text-[11px]">
                Under Tier 2 Review
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ESCROW LEDGER VIEW */}
      {(activeTab === 'admin-overview' || activeTab === 'admin-ledger') && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden text-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between font-semibold text-slate-700">
            <span>Escrow Settlement & Payout Ledger</span>
            <span className="text-[11px] text-slate-500 font-mono">Real-time ledger audit</span>
          </div>

          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-100 text-[11px] font-semibold text-slate-600 uppercase border-b border-slate-200">
                <th className="py-2.5 px-4">Transaction ID</th>
                <th className="py-2.5 px-4">Payer</th>
                <th className="py-2.5 px-4">Method</th>
                <th className="py-2.5 px-4 text-right">Gross Amount</th>
                <th className="py-2.5 px-4 text-right">1.5% Fee</th>
                <th className="py-2.5 px-4 text-right">Net Payout</th>
                <th className="py-2.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-semibold text-slate-900">{p.processorReference}</td>
                  <td className="py-3 px-4 text-slate-700">{p.paidBy}</td>
                  <td className="py-3 px-4 uppercase font-mono text-[11px] text-slate-500">{p.paymentMethod}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-slate-900">
                    {formatCurrency(p.amount, p.currency)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-700 tabular-nums">
                    {formatCurrency(p.processingFee, p.currency)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-slate-900">
                    {formatCurrency(p.netAmount, p.currency)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Settled
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
