'use client';

import React, { useState } from 'react';
import { useFreelancePay } from '@/lib/store';
import { Invoice, InvoiceStatus } from '@/lib/types';
import {
  Search,
  Filter,
  Eye,
  CreditCard,
  Send,
  Bell,
  Trash2,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileEdit,
  ExternalLink,
} from 'lucide-react';

interface InvoicesListProps {
  onOpenCreate: () => void;
  onPreviewInvoice: (invoice: Invoice) => void;
  onOpenPayment: (invoice: Invoice) => void;
}

export function InvoicesList({
  onOpenCreate,
  onPreviewInvoice,
  onOpenPayment,
}: InvoicesListProps) {
  const { invoices, deleteInvoice, sendInvoice, sendReminder, formatCurrency } = useFreelancePay();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | InvoiceStatus>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSendEmail = (invoice: Invoice) => {
    sendInvoice(invoice.id);
    showToast(`Invoice ${invoice.invoiceNumber} emailed to ${invoice.clientEmail} with payment link.`);
  };

  const handleSendReminder = (invoice: Invoice) => {
    sendReminder(invoice.id);
    showToast(`Payment reminder dispatch queued for ${invoice.clientEmail}. Reminder #${(invoice.reminderSentCount || 0) + 1}.`);
  };

  const handleDelete = (id: string, num: string) => {
    if (confirm(`Are you sure you want to delete invoice ${num}?`)) {
      deleteInvoice(id);
      showToast(`Invoice ${num} deleted.`);
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Paid</span>
          </span>
        );
      case 'sent':
      case 'viewed':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Sent · Awaiting</span>
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-700">
            <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
            <span>Overdue</span>
          </span>
        );
      case 'draft':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
            <FileEdit className="w-3.5 h-3.5 text-slate-400" />
            <span>Draft</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="bg-slate-900 text-teal-300 text-xs px-4 py-2.5 flex items-center justify-between animate-fade-in">
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-4 text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Control Header & Filters */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search invoice # or client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 focus:bg-white text-slate-900"
            />
          </div>

          {/* Interactive filter tabs adhering to Section 1.A interactive segmented rules */}
          <div className="hidden sm:flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({invoices.length})
            </button>
            <button
              onClick={() => setStatusFilter('paid')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                statusFilter === 'paid'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Paid
            </button>
            <button
              onClick={() => setStatusFilter('sent')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                statusFilter === 'sent'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Awaiting
            </button>
            <button
              onClick={() => setStatusFilter('overdue')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                statusFilter === 'overdue'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Overdue
            </button>
            <button
              onClick={() => setStatusFilter('draft')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                statusFilter === 'draft'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Draft
            </button>
          </div>
        </div>

        <button
          onClick={onOpenCreate}
          className="px-3.5 py-2 text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>New Invoice</span>
        </button>
      </div>

      {/* Invoice Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Invoice #</th>
              <th className="py-3 px-4">Client</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">Due Date</th>
              <th className="py-3 px-4 text-right">Amount</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  <p className="font-medium text-slate-700">No invoices match your filter criteria.</p>
                  <p className="text-xs text-slate-400 mt-1">Create a new invoice to start billing your clients.</p>
                </td>
              </tr>
            ) : (
              filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Invoice # */}
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                    <button
                      onClick={() => onPreviewInvoice(inv)}
                      className="hover:text-teal-600 transition-colors underline cursor-pointer text-left"
                    >
                      {inv.invoiceNumber}
                    </button>
                  </td>

                  {/* Client */}
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-900">{inv.clientName}</div>
                    <div className="text-[11px] text-slate-400">{inv.clientCompany || inv.clientEmail}</div>
                  </td>

                  {/* Description */}
                  <td className="py-3.5 px-4 max-w-xs truncate text-slate-600" title={inv.description}>
                    {inv.description}
                  </td>

                  {/* Due Date */}
                  <td className="py-3.5 px-4 font-mono tabular-nums text-slate-600 whitespace-nowrap">
                    {inv.dueDate}
                  </td>

                  {/* Amount with Tabular Numerals */}
                  <td className="py-3.5 px-4 text-right font-mono font-bold tabular-nums text-slate-900 whitespace-nowrap">
                    {formatCurrency(inv.amount, inv.currency)}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getStatusBadge(inv.status)}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* View & Preview */}
                      <button
                        onClick={() => onPreviewInvoice(inv)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                        title="View / Print Invoice"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Pay Now Button (if not paid) */}
                      {inv.status !== 'paid' && (
                        <button
                          onClick={() => onOpenPayment(inv)}
                          className="px-2 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 text-[11px] font-semibold rounded-md flex items-center gap-1 transition-colors cursor-pointer"
                          title="Simulate Paystack Checkout"
                        >
                          <CreditCard className="w-3 h-3 text-teal-600" />
                          <span>Pay Now</span>
                        </button>
                      )}

                      {/* Send to Client Email */}
                      {inv.status === 'draft' && (
                        <button
                          onClick={() => handleSendEmail(inv)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-semibold rounded-md flex items-center gap-1 transition-colors cursor-pointer"
                          title="Send to client via email"
                        >
                          <Send className="w-3 h-3" />
                          <span>Send</span>
                        </button>
                      )}

                      {/* Send Reminder (if overdue) */}
                      {inv.status === 'overdue' && (
                        <button
                          onClick={() => handleSendReminder(inv)}
                          className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-semibold rounded-md flex items-center gap-1 transition-colors cursor-pointer"
                          title="Send payment reminder email"
                        >
                          <Bell className="w-3 h-3 text-rose-500" />
                          <span>Remind ({inv.reminderSentCount || 0})</span>
                        </button>
                      )}

                      {/* Delete Action */}
                      <button
                        onClick={() => handleDelete(inv.id, inv.invoiceNumber)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                        title="Delete invoice"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Pagination / Summary */}
      <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
        <span>Showing {filteredInvoices.length} of {invoices.length} invoices</span>
        <div className="flex items-center gap-3 font-mono tabular-nums">
          <span>Processed via Paystack & Direct Debit</span>
        </div>
      </div>
    </div>
  );
}
