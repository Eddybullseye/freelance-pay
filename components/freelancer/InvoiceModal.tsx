'use client';

import React, { useState } from 'react';
import { useFreelancePay, advanceBillingDate } from '@/lib/store';
import { Currency, LineItem, RecurringFrequency } from '@/lib/types';
import { X, Plus, Trash2, Calendar, User, FileText, Check, Repeat } from 'lucide-react';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InvoiceModal({ isOpen, onClose }: InvoiceModalProps) {
  const { clients, addInvoice, addClient, currentUser, formatCurrency, addRecurringSchedule } = useFreelancePay();

  // Selected or New Client
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || '');
  const [isAddingNewClient, setIsAddingNewClient] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientCompany, setNewClientCompany] = useState('');

  // Invoice Details
  const [invoiceNumber, setInvoiceNumber] = useState('INV-2026-006');
  const [currency, setInvoiceCurrency] = useState<Currency>('NGN');
  const [description, setDescription] = useState('');
  const [issueDate, setIssueDate] = useState('2026-09-25');
  const [dueDate, setDueDate] = useState('2026-10-09');
  const [notes, setNotes] = useState('Payment is due within 14 days. Thank you for your partnership!');

  // Recurring Schedule Setup
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<RecurringFrequency>('monthly');
  const [recurringAutoSend, setRecurringAutoSend] = useState(true);

  // Line items
  const [lineItems, setLineItems] = useState<LineItem[]>([
    {
      id: 'li-1',
      description: 'Web development & API integration sprint',
      quantity: 1,
      rate: 350000,
      amount: 350000,
    },
  ]);

  if (!isOpen) return null;

  const handleLineItemChange = (index: number, field: keyof LineItem, value: string | number) => {
    const updated = [...lineItems];
    const item = { ...updated[index] };

    if (field === 'description') {
      item.description = String(value);
    } else if (field === 'quantity') {
      const q = Math.max(1, Number(value) || 1);
      item.quantity = q;
      item.amount = q * item.rate;
    } else if (field === 'rate') {
      const r = Math.max(0, Number(value) || 0);
      item.rate = r;
      item.amount = item.quantity * r;
    }

    updated[index] = item;
    setLineItems(updated);
  };

  const addRow = () => {
    setLineItems([
      ...lineItems,
      {
        id: `li-${Date.now()}`,
        description: '',
        quantity: 1,
        rate: 100000,
        amount: 100000,
      },
    ]);
  };

  const removeRow = (index: number) => {
    if (lineItems.length <= 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const processingFee = Math.round(subtotal * 0.015);
  const netPayout = subtotal - processingFee;

  const handleSave = (status: 'draft' | 'sent') => {
    let clientId = selectedClientId;
    let clientName = '';
    let clientEmail = '';
    let clientCompany = '';

    if (isAddingNewClient) {
      if (!newClientName || !newClientEmail) {
        alert('Please provide a client name and email.');
        return;
      }
      const createdClient = addClient({
        freelancerId: currentUser.id,
        name: newClientName,
        email: newClientEmail,
        companyName: newClientCompany || newClientName,
        paymentHistory: 'on_time',
        rating: 5.0,
      });
      clientId = createdClient.id;
      clientName = createdClient.name;
      clientEmail = createdClient.email;
      clientCompany = createdClient.companyName;
    } else {
      const existing = clients.find((c) => c.id === selectedClientId);
      clientName = existing?.name || 'Client';
      clientEmail = existing?.email || '';
      clientCompany = existing?.companyName || '';
    }

    const newInv = addInvoice({
      invoiceNumber,
      freelancerId: currentUser.id,
      freelancerName: currentUser.name,
      freelancerEmail: currentUser.email,
      freelancerBank: currentUser.bankAccount,
      clientId,
      clientName,
      clientEmail,
      clientCompany,
      amount: subtotal,
      currency,
      status,
      issueDate,
      dueDate,
      description: description || lineItems[0]?.description || 'Freelance Services',
      lineItems,
      notes,
      paystackReference: 'PSTK_PENDING',
      processingFee,
      netAmount: netPayout,
      isRecurringGenerated: isRecurring,
    });

    if (isRecurring) {
      const nextDate = advanceBillingDate(issueDate, recurringFrequency);
      addRecurringSchedule({
        freelancerId: currentUser.id,
        clientId,
        clientName,
        clientEmail,
        clientCompany,
        title: `${description || lineItems[0]?.description || 'Client Services'} (${recurringFrequency.toUpperCase()} Retainer)`,
        description: description || `Automated recurring retainer invoice on ${recurringFrequency} cadence.`,
        frequency: recurringFrequency,
        amount: subtotal,
        currency,
        lineItems,
        startDate: issueDate,
        nextBillingDate: nextDate,
        dueDaysAfterIssue: recurringFrequency === 'weekly' ? 7 : 14,
        autoSend: recurringAutoSend,
        status: 'active',
        notes,
        lastGeneratedDate: issueDate,
        lastGeneratedInvoiceId: newInv.id,
        lastGeneratedInvoiceNumber: newInv.invoiceNumber,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-xl overflow-hidden my-8 animate-fade-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/75">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-800 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4 text-teal-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Create New Invoice</h2>
              <p className="text-xs text-slate-500">Auto-calculated with Paystack checkout link generation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
          {/* Top Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Invoice Number</label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-medium text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Issue Date</label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Client Selection */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-teal-600" />
                <span>Client & Billing Recipient</span>
              </span>
              <button
                type="button"
                onClick={() => setIsAddingNewClient(!isAddingNewClient)}
                className="text-xs text-teal-700 font-semibold hover:underline cursor-pointer"
              >
                {isAddingNewClient ? '← Select Existing Client' : '+ Add New Client'}
              </button>
            </div>

            {!isAddingNewClient ? (
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500 cursor-pointer font-medium"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.companyName} ({c.email})
                  </option>
                ))}
              </select>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Client Full Name *"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500"
                />
                <input
                  type="email"
                  placeholder="Client Email Address *"
                  value={newClientEmail}
                  onChange={(e) => setNewClientEmail(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500"
                />
                <input
                  type="text"
                  placeholder="Company / Organization Name"
                  value={newClientCompany}
                  onChange={(e) => setNewClientCompany(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500"
                />
              </div>
            )}
          </div>

          {/* Currency & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Invoice Currency</label>
              <select
                value={currency}
                onChange={(e) => setInvoiceCurrency(e.target.value as Currency)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500 font-semibold cursor-pointer"
              >
                <option value="NGN">NGN (Nigerian Naira - ₦)</option>
                <option value="USD">USD (US Dollar - $)</option>
                <option value="GBP">GBP (British Pound - £)</option>
                <option value="EUR">EUR (Euro - €)</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Summary / Project Header</label>
              <input
                type="text"
                placeholder="e.g. Next.js 15 Webhook Architecture & Deployment Sprint"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Line Items Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-semibold text-slate-800">Deliverables & Line Items</label>
              <button
                type="button"
                onClick={addRow}
                className="text-xs text-teal-700 font-semibold hover:text-teal-800 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-100 text-[11px] font-semibold text-slate-600 uppercase border-b border-slate-200">
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3 w-20 text-center">Qty</th>
                    <th className="py-2.5 px-3 w-32 text-right">Unit Rate</th>
                    <th className="py-2.5 px-3 w-32 text-right">Amount</th>
                    <th className="py-2.5 px-2 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {lineItems.map((item, idx) => (
                    <tr key={item.id}>
                      <td className="p-2">
                        <input
                          type="text"
                          placeholder="Deliverable description..."
                          value={item.description}
                          onChange={(e) => handleLineItemChange(idx, 'description', e.target.value)}
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:bg-white"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleLineItemChange(idx, 'quantity', e.target.value)}
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-center font-mono text-slate-900 focus:outline-none focus:bg-white"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="0"
                          value={item.rate}
                          onChange={(e) => handleLineItemChange(idx, 'rate', e.target.value)}
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-right font-mono text-slate-900 focus:outline-none focus:bg-white"
                        />
                      </td>
                      <td className="p-2 text-right font-mono font-bold tabular-nums text-slate-900">
                        {formatCurrency(item.amount, currency)}
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeRow(idx)}
                          disabled={lineItems.length === 1}
                          className="text-slate-400 hover:text-rose-600 disabled:opacity-20 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Calculation Breakdown */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
            <div className="flex justify-between text-xs text-slate-600">
              <span>Gross Invoice Subtotal:</span>
              <span className="font-mono font-bold text-slate-900 tabular-nums">
                {formatCurrency(subtotal, currency)}
              </span>
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>Paystack Processing Fee (1.5% capped):</span>
              <span className="font-mono tabular-nums text-slate-600">
                - {formatCurrency(processingFee, currency)}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
              <span className="text-teal-900">Estimated Net Bank Payout:</span>
              <span className="font-mono tabular-nums text-teal-700">
                {formatCurrency(netPayout, currency)}
              </span>
            </div>
          </div>

          {/* Recurring Invoice Option Card */}
          <div className="p-4 bg-teal-50/50 rounded-xl border border-teal-200/80 space-y-3">
            <div className="flex items-start gap-2.5">
              <input
                type="checkbox"
                id="modal-recurring-checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
              />
              <label htmlFor="modal-recurring-checkbox" className="cursor-pointer">
                <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                  <Repeat className="w-3.5 h-3.5 text-teal-600" />
                  <span>Set up an automated recurring schedule for this client</span>
                </span>
                <span className="text-slate-500 text-[11px] block mt-0.5">
                  Future invoices will automatically generate on your chosen weekly or monthly schedule with Paystack payment links.
                </span>
              </label>
            </div>

            {isRecurring && (
              <div className="pl-6 pt-2 border-t border-teal-200/60 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-slate-700">Schedule Frequency:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setRecurringFrequency('weekly')}
                      className={`px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                        recurringFrequency === 'weekly'
                          ? 'bg-indigo-600 text-white font-semibold'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Weekly (Every 7 days)
                    </button>
                    <button
                      type="button"
                      onClick={() => setRecurringFrequency('monthly')}
                      className={`px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                        recurringFrequency === 'monthly'
                          ? 'bg-teal-600 text-white font-semibold'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Monthly (Every month)
                    </button>
                    <button
                      type="button"
                      onClick={() => setRecurringFrequency('biweekly')}
                      className={`px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                        recurringFrequency === 'biweekly'
                          ? 'bg-purple-600 text-white font-semibold'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Bi-Weekly (14 days)
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-teal-800">
                  <span className="font-semibold">First Recurring Run:</span>
                  <span className="font-mono bg-white px-2 py-0.5 rounded border border-teal-200">
                    {advanceBillingDate(issueDate, recurringFrequency)}
                  </span>
                  <span className="text-slate-500">
                    · Auto-bills {formatCurrency(subtotal, currency)} per cycle
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Notes & Terms */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Notes & Payment Instructions</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white resize-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSave('draft')}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={() => handleSave('sent')}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save & Dispatch to Client</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
