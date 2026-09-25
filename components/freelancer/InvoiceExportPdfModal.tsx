'use client';

import React, { useState } from 'react';
import { Invoice } from '@/lib/types';
import { useFreelancePay } from '@/lib/store';
import {
  X,
  Printer,
  FileDown,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileEdit,
  Download,
  ShieldCheck,
  Building,
  Calendar,
  Layers,
  Check,
} from 'lucide-react';

interface InvoiceExportPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  allInvoices: Invoice[];
  filteredInvoices: Invoice[];
  selectedInvoices: Invoice[];
  initialScope?: 'current-view' | 'selected' | 'single';
  singleInvoice?: Invoice | null;
  activeStatusFilter: string;
}

export function InvoiceExportPdfModal({
  isOpen,
  onClose,
  allInvoices,
  filteredInvoices,
  selectedInvoices,
  initialScope = 'current-view',
  singleInvoice = null,
  activeStatusFilter,
}: InvoiceExportPdfModalProps) {
  const { currentUser, formatCurrency } = useFreelancePay();

  // Export scope: 'current-view' | 'selected' | 'single'
  const [exportScope, setExportScope] = useState<'current-view' | 'selected' | 'single'>(() => {
    if (singleInvoice) return 'single';
    if (selectedInvoices.length > 0) return 'selected';
    return initialScope;
  });

  const [selectedSingleId, setSelectedSingleId] = useState<string>(
    singleInvoice?.id || filteredInvoices[0]?.id || allInvoices[0]?.id || ''
  );

  const [includeNotes, setIncludeNotes] = useState(true);
  const [includeBanking, setIncludeBanking] = useState(true);
  const [reportTitle, setReportTitle] = useState('INVOICES LEDGER & TAX REPORT');

  if (!isOpen) return null;

  // Determine which invoices to display in the PDF document
  let targetInvoices: Invoice[] = [];
  if (exportScope === 'single') {
    const found = allInvoices.find((inv) => inv.id === selectedSingleId);
    targetInvoices = found ? [found] : [];
  } else if (exportScope === 'selected') {
    targetInvoices = selectedInvoices.length > 0 ? selectedInvoices : filteredInvoices;
  } else {
    targetInvoices = filteredInvoices;
  }

  // Summary Metrics for the target set
  const totalAmount = targetInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalPaid = targetInvoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);
  const totalPending = targetInvoices
    .filter((inv) => inv.status === 'sent' || inv.status === 'viewed')
    .reduce((sum, inv) => sum + inv.amount, 0);
  const totalOverdue = targetInvoices
    .filter((inv) => inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.amount, 0);
  const totalEstFee = totalAmount * 0.015;
  const netEarnings = totalPaid - (totalPaid * 0.015);

  const todayStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    const exportData = {
      reportTitle,
      exportScope,
      generatedDate: new Date().toISOString(),
      freelancer: {
        name: currentUser.name,
        email: currentUser.email,
        taxId: currentUser.taxId,
      },
      summary: {
        totalInvoices: targetInvoices.length,
        totalAmount,
        totalPaid,
        totalPending,
        totalOverdue,
      },
      invoices: targetInvoices,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `freelancepay-invoices-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="print-modal-container fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto">
      <div className="print-modal-box bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Top Control Bar (Hidden on Print) */}
        <div className="no-print p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-slate-950 font-bold text-sm shadow-xs">
                <FileDown className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Export Invoices as PDF</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-mono">
                    {targetInvoices.length} {targetInvoices.length === 1 ? 'record' : 'records'}
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Generate print-ready ledger statements or official invoice slips for audits and tax records.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadJson}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Download JSON data file"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>JSON Export</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Save as PDF in browser print dialog"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save as PDF</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scope & Filtering Selector Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-500 font-medium">Export Scope:</span>

              {/* Scope Option 1: Current View */}
              <button
                type="button"
                onClick={() => setExportScope('current-view')}
                className={`px-2.5 py-1 rounded-md border text-xs transition-colors cursor-pointer ${
                  exportScope === 'current-view'
                    ? 'bg-teal-50 border-teal-400 text-teal-950 font-semibold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Current Filtered View ({filteredInvoices.length})
              </button>

              {/* Scope Option 2: Selected Invoices */}
              <button
                type="button"
                onClick={() => setExportScope('selected')}
                disabled={selectedInvoices.length === 0}
                className={`px-2.5 py-1 rounded-md border text-xs transition-colors cursor-pointer ${
                  exportScope === 'selected'
                    ? 'bg-teal-50 border-teal-400 text-teal-950 font-semibold'
                    : selectedInvoices.length === 0
                    ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Selected Invoices ({selectedInvoices.length})
              </button>

              {/* Scope Option 3: Single Invoice */}
              <button
                type="button"
                onClick={() => setExportScope('single')}
                className={`px-2.5 py-1 rounded-md border text-xs transition-colors cursor-pointer ${
                  exportScope === 'single'
                    ? 'bg-teal-50 border-teal-400 text-teal-950 font-semibold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Single Detailed Invoice
              </button>
            </div>

            {/* Single Invoice Dropdown Selector */}
            {exportScope === 'single' && (
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">Select Invoice:</span>
                <select
                  value={selectedSingleId}
                  onChange={(e) => setSelectedSingleId(e.target.value)}
                  className="px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:border-teal-500 text-slate-900 font-mono"
                >
                  {allInvoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceNumber} - {inv.clientName} ({formatCurrency(inv.amount, inv.currency)})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Document Preview Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100/70">
          <div className="max-w-3xl mx-auto">
            {/* The Actual Printable Paper Card */}
            <div
              id="printable-pdf-document"
              className="printable-document bg-white border border-slate-200 sm:rounded-xl shadow-md p-6 sm:p-10 text-slate-800 space-y-6"
            >
              {/* Header Letterhead */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-slate-200 pb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-md bg-teal-500 flex items-center justify-center font-black text-slate-950 text-sm">
                      FP
                    </div>
                    <div>
                      <span className="text-lg font-black text-slate-900 tracking-tight">FreelancePay</span>
                      <span className="text-[10px] uppercase font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded ml-2">
                        Official Record
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-slate-600 space-y-0.5">
                    <p className="font-semibold text-slate-900">{currentUser.name}</p>
                    <p>{currentUser.title} · {currentUser.email}</p>
                    <p className="font-mono text-slate-500">Tax ID: {currentUser.taxId}</p>
                  </div>
                </div>

                <div className="sm:text-right space-y-1">
                  <h1 className="text-lg sm:text-xl font-bold uppercase tracking-wider text-slate-900">
                    {exportScope === 'single'
                      ? `INVOICE ${targetInvoices[0]?.invoiceNumber || ''}`
                      : reportTitle}
                  </h1>
                  <div className="text-xs text-slate-500 space-y-0.5">
                    <p>
                      Date Generated: <span className="font-medium text-slate-800">{todayStr}</span>
                    </p>
                    <p>
                      Report Scope:{' '}
                      <span className="font-medium text-slate-800 capitalize">
                        {exportScope === 'current-view'
                          ? `Filtered View (${activeStatusFilter})`
                          : exportScope === 'selected'
                          ? `Selected (${targetInvoices.length} invoices)`
                          : 'Specific Single Invoice'}
                      </span>
                    </p>
                    <p className="font-mono text-[11px] text-slate-400">
                      DOC-REF: FP-DOC-{Math.abs(allInvoices.length * 997 + targetInvoices.length)}
                    </p>
                  </div>
                </div>
              </div>

              {/* IF SINGLE INVOICE: Detailed Customer & Invoice View */}
              {exportScope === 'single' && targetInvoices[0] && (
                <div className="space-y-6">
                  {/* Bill To & Status Metadata */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50/75 p-4 rounded-lg border border-slate-200 text-xs">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                        Billed To
                      </span>
                      <p className="font-bold text-slate-900 text-sm">{targetInvoices[0].clientName}</p>
                      {targetInvoices[0].clientCompany && (
                        <p className="text-slate-600 font-medium">{targetInvoices[0].clientCompany}</p>
                      )}
                      <p className="text-slate-500">{targetInvoices[0].clientEmail}</p>
                    </div>

                    <div className="sm:text-right space-y-1">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          Payment Status:
                        </span>{' '}
                        <span className="font-bold capitalize text-slate-900 ml-1">
                          {targetInvoices[0].status}
                        </span>
                      </div>
                      <p className="text-slate-600">
                        Issue Date: <span className="font-mono">{targetInvoices[0].issueDate}</span>
                      </p>
                      <p className="text-slate-600">
                        Due Date: <span className="font-mono">{targetInvoices[0].dueDate}</span>
                      </p>
                      {targetInvoices[0].paidAt && (
                        <p className="text-emerald-700 font-medium">
                          Settled on: <span className="font-mono">{targetInvoices[0].paidAt}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Line Items Table */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                      Deliverables & Line Items
                    </h4>
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-100/75 text-slate-600 text-[11px] font-semibold">
                          <th className="py-2.5 px-3">Description</th>
                          <th className="py-2.5 px-3 text-center">Qty</th>
                          <th className="py-2.5 px-3 text-right">Rate</th>
                          <th className="py-2.5 px-3 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {targetInvoices[0].lineItems.map((item) => (
                          <tr key={item.id}>
                            <td className="py-2.5 px-3 text-slate-800">{item.description}</td>
                            <td className="py-2.5 px-3 text-center font-mono">{item.quantity}</td>
                            <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                              {formatCurrency(item.rate, targetInvoices[0].currency)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-semibold tabular-nums text-slate-900">
                              {formatCurrency(item.amount, targetInvoices[0].currency)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Single Invoice Calculation Totals */}
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2 border-t border-slate-200">
                    <div className="text-xs text-slate-500 max-w-sm space-y-1">
                      <p className="font-semibold text-slate-700">Bank Settlement Details:</p>
                      <p>Bank: {targetInvoices[0].freelancerBank.bankName}</p>
                      <p className="font-mono">Account #: {targetInvoices[0].freelancerBank.accountNumber}</p>
                      <p>Account Name: {targetInvoices[0].freelancerBank.accountName}</p>
                    </div>

                    <div className="w-full sm:w-64 space-y-1.5 text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                      <div className="flex justify-between text-slate-600">
                        <span>Subtotal:</span>
                        <span className="font-mono font-medium">
                          {formatCurrency(targetInvoices[0].amount, targetInvoices[0].currency)}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-500 text-[11px]">
                        <span>Payment Processing (1.5%):</span>
                        <span className="font-mono">
                          {formatCurrency(targetInvoices[0].processingFee || 0, targetInvoices[0].currency)}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-900 font-bold text-sm pt-2 border-t border-slate-200">
                        <span>Total Due:</span>
                        <span className="font-mono text-teal-900">
                          {formatCurrency(targetInvoices[0].amount, targetInvoices[0].currency)}
                        </span>
                      </div>
                      <div className="flex justify-between text-emerald-700 text-[11px] font-semibold pt-1">
                        <span>Net Bank Payout:</span>
                        <span className="font-mono">
                          {formatCurrency(targetInvoices[0].netAmount || targetInvoices[0].amount * 0.985, targetInvoices[0].currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* IF MULTIPLE INVOICES (Current View or Selected Scope): Ledger Statement View */}
              {exportScope !== 'single' && (
                <div className="space-y-6">
                  {/* Financial Statement Summary Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-400 uppercase font-semibold block">Total Invoiced</span>
                      <span className="text-sm font-bold font-mono text-slate-900 tabular-nums">
                        {formatCurrency(totalAmount, 'NGN')}
                      </span>
                      <span className="text-[10px] text-slate-500 block">{targetInvoices.length} invoices</span>
                    </div>

                    <div>
                      <span className="text-[11px] text-emerald-600 uppercase font-semibold block">Settled (Paid)</span>
                      <span className="text-sm font-bold font-mono text-emerald-700 tabular-nums">
                        {formatCurrency(totalPaid, 'NGN')}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        Net: {formatCurrency(netEarnings, 'NGN')}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-amber-600 uppercase font-semibold block">Pending Payment</span>
                      <span className="text-sm font-bold font-mono text-amber-700 tabular-nums">
                        {formatCurrency(totalPending, 'NGN')}
                      </span>
                      <span className="text-[10px] text-slate-500 block">Awaiting settlement</span>
                    </div>

                    <div>
                      <span className="text-[11px] text-rose-600 uppercase font-semibold block">Overdue Amount</span>
                      <span className="text-sm font-bold font-mono text-rose-700 tabular-nums">
                        {formatCurrency(totalOverdue, 'NGN')}
                      </span>
                      <span className="text-[10px] text-rose-500 block">Past grace period</span>
                    </div>
                  </div>

                  {/* Invoices Ledger Table */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>Itemized Invoices Ledger</span>
                      <span className="font-normal text-[11px] text-slate-500 font-mono">
                        Showing {targetInvoices.length} records
                      </span>
                    </h4>

                    <div className="overflow-hidden border border-slate-200 rounded-lg">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-100 text-slate-600 text-[10px] font-semibold uppercase tracking-wider">
                            <th className="py-2.5 px-3">Invoice #</th>
                            <th className="py-2.5 px-3">Client</th>
                            <th className="py-2.5 px-3">Issue Date</th>
                            <th className="py-2.5 px-3">Due Date</th>
                            <th className="py-2.5 px-3">Status</th>
                            <th className="py-2.5 px-3 text-right">Gross Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {targetInvoices.map((inv) => (
                            <tr key={inv.id} className="hover:bg-slate-50/50">
                              <td className="py-2 px-3 font-mono font-bold text-slate-900">
                                {inv.invoiceNumber}
                              </td>
                              <td className="py-2 px-3">
                                <div className="font-medium text-slate-900">{inv.clientName}</div>
                                <div className="text-[10px] text-slate-400">{inv.clientCompany || inv.clientEmail}</div>
                              </td>
                              <td className="py-2 px-3 font-mono tabular-nums text-slate-600">
                                {inv.issueDate}
                              </td>
                              <td className="py-2 px-3 font-mono tabular-nums text-slate-600">
                                {inv.dueDate}
                              </td>
                              <td className="py-2 px-3">
                                <span
                                  className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium capitalize ${
                                    inv.status === 'paid'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : inv.status === 'overdue'
                                      ? 'bg-rose-100 text-rose-800'
                                      : inv.status === 'sent' || inv.status === 'viewed'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  {inv.status === 'sent' ? 'Awaiting' : inv.status}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-right font-mono font-bold tabular-nums text-slate-900">
                                {formatCurrency(inv.amount, inv.currency)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-slate-50 border-t border-slate-200 font-bold text-xs">
                            <td colSpan={5} className="py-2.5 px-3 text-slate-800">
                              Total Ledger Balance ({targetInvoices.length} Invoices)
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-900">
                              {formatCurrency(totalAmount, 'NGN')}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Compliance & Audit Footer */}
              <div className="pt-6 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <p className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                    <span>Verified by FreelancePay Platform Ledger</span>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    This document serves as an official accounting statement for tax compliance and audit verification.
                  </p>
                </div>
                <div className="font-mono text-[11px] text-slate-400 text-right">
                  <span>Page 1 of 1 · Generated {todayStr}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="no-print p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Tip: In the print dialog, select <strong>&quot;Save as PDF&quot;</strong> to export to your device.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-1.5 font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
