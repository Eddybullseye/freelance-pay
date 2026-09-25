'use client';

import React, { useState } from 'react';
import { Invoice } from '@/lib/types';
import { useFreelancePay } from '@/lib/store';
import { X, Printer, Copy, Check, CreditCard, ShieldCheck } from 'lucide-react';

interface InvoicePreviewModalProps {
  invoice: Invoice | null;
  onClose: () => void;
  onPayNow: (invoice: Invoice) => void;
}

export function InvoicePreviewModal({ invoice, onClose, onPayNow }: InvoicePreviewModalProps) {
  const { formatCurrency } = useFreelancePay();
  const [copied, setCopied] = useState(false);

  if (!invoice) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://freelancepay.io/pay/${invoice.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6">
        {/* Top Control Bar (Hidden on print) */}
        <div className="no-print px-6 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="font-semibold text-slate-900">Invoice Preview</span>
            <span>·</span>
            <span className="font-mono text-slate-500">{invoice.invoiceNumber}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Link Copied!' : 'Copy Payment Link'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Download PDF</span>
            </button>

            {invoice.status !== 'paid' && (
              <button
                onClick={() => {
                  onClose();
                  onPayNow(invoice);
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Pay via Paystack</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Paper Area */}
        <div id="printable-invoice" className="p-8 sm:p-12 text-slate-800 bg-white space-y-8">
          {/* Header & Logo */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-slate-200 pb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-md bg-teal-500 flex items-center justify-center font-bold text-slate-950 text-sm">
                  FP
                </div>
                <span className="text-xl font-black text-slate-900 tracking-tight">FreelancePay</span>
              </div>
              <div className="text-xs text-slate-600 space-y-0.5">
                <p className="font-semibold text-slate-900">{invoice.freelancerName}</p>
                <p>{invoice.freelancerEmail}</p>
                <p className="font-mono text-slate-500">TIN: TIN-98421038-NG</p>
              </div>
            </div>

            <div className="sm:text-right space-y-1">
              <span className="text-2xl font-bold uppercase tracking-wider text-slate-900 block">
                INVOICE
              </span>
              <p className="font-mono font-bold text-teal-700 text-sm">{invoice.invoiceNumber}</p>
              <div className="pt-2 text-xs text-slate-500 space-y-0.5">
                <p>Issue Date: <strong className="font-mono text-slate-800">{invoice.issueDate}</strong></p>
                <p>Due Date: <strong className="font-mono text-slate-800">{invoice.dueDate}</strong></p>
                <p>Status: <strong className={`font-semibold uppercase ${
                  invoice.status === 'paid' ? 'text-emerald-600' : invoice.status === 'overdue' ? 'text-rose-600' : 'text-amber-600'
                }`}>{invoice.status}</strong></p>
              </div>
            </div>
          </div>

          {/* Billed To / Client info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div>
              <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Billed To:
              </span>
              <p className="text-sm font-bold text-slate-900">{invoice.clientName}</p>
              {invoice.clientCompany && <p className="font-medium text-slate-700">{invoice.clientCompany}</p>}
              <p className="text-slate-500">{invoice.clientEmail}</p>
            </div>

            <div className="sm:text-right">
              <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Direct Settlement Bank:
              </span>
              <p className="font-medium text-slate-900">{invoice.freelancerBank?.bankName || 'Access Bank Nigeria'}</p>
              <p className="font-mono text-slate-800">Account: {invoice.freelancerBank?.accountNumber || '0129482019'}</p>
              <p className="text-slate-600">{invoice.freelancerBank?.accountName || invoice.freelancerName}</p>
            </div>
          </div>

          {/* Line items table */}
          <div>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-900 text-[11px] font-bold uppercase text-slate-900">
                  <th className="py-2.5">Item / Service Deliverable</th>
                  <th className="py-2.5 text-center w-16">Qty</th>
                  <th className="py-2.5 text-right w-28">Unit Rate</th>
                  <th className="py-2.5 text-right w-32">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {invoice.lineItems.map((item) => (
                  <tr key={item.id} className="py-2">
                    <td className="py-3 font-medium text-slate-800">{item.description}</td>
                    <td className="py-3 text-center font-mono tabular-nums text-slate-600">{item.quantity}</td>
                    <td className="py-3 text-right font-mono tabular-nums text-slate-600">
                      {formatCurrency(item.rate, invoice.currency)}
                    </td>
                    <td className="py-3 text-right font-mono font-bold tabular-nums text-slate-900">
                      {formatCurrency(item.amount, invoice.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Summary & Total */}
          <div className="flex justify-end pt-2">
            <div className="w-full sm:w-72 space-y-2 text-xs border-t border-slate-200 pt-4">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono tabular-nums font-semibold text-slate-900">
                  {formatCurrency(invoice.amount, invoice.currency)}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>VAT / Tax (0% reverse charge):</span>
                <span className="font-mono tabular-nums">₦0.00</span>
              </div>
              <div className="pt-2 border-t-2 border-slate-900 flex justify-between text-sm font-bold text-slate-900">
                <span>Total Due:</span>
                <span className="font-mono tabular-nums text-teal-800 text-base">
                  {formatCurrency(invoice.amount, invoice.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes & Paystack badge */}
          <div className="pt-6 border-t border-slate-200 text-xs text-slate-600 space-y-2">
            <p className="font-semibold text-slate-800">Notes & Payment Instructions:</p>
            <p className="leading-relaxed text-slate-500">{invoice.notes}</p>
            <div className="pt-4 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>Protected by FreelancePay Escrow & Paystack 256-bit SSL Security</span>
              </div>
              {invoice.paystackReference && (
                <span className="font-mono">Reference: {invoice.paystackReference}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
