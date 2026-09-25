'use client';

import React, { useState } from 'react';
import { useFreelancePay } from '@/lib/store';
import {
  Currency,
  LineItem,
  RecurringFrequency,
  RecurringSchedule,
} from '@/lib/types';
import {
  X,
  Plus,
  Trash2,
  Calendar,
  User,
  Clock,
  Repeat,
  Check,
  Send,
  CalendarClock,
} from 'lucide-react';

interface RecurringScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheduleToEdit?: RecurringSchedule | null;
  onSaved?: (schedule: RecurringSchedule, isNew: boolean) => void;
}

// Helper function to calculate default next billing date based on start date and frequency
function computeDefaultNextBilling(startStr: string, freq: RecurringFrequency): string {
  const parts = startStr.split('-');
  const year = parseInt(parts[0], 10) || 2026;
  const month = (parseInt(parts[1], 10) || 1) - 1;
  const day = parseInt(parts[2], 10) || 1;
  const date = new Date(year, month, day);

  if (freq === 'weekly') {
    date.setDate(date.getDate() + 7);
  } else if (freq === 'biweekly') {
    date.setDate(date.getDate() + 14);
  } else if (freq === 'monthly') {
    date.setMonth(date.getMonth() + 1);
  } else if (freq === 'quarterly') {
    date.setMonth(date.getMonth() + 3);
  }

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function RecurringScheduleForm({
  onClose,
  scheduleToEdit,
  onSaved,
}: {
  onClose: () => void;
  scheduleToEdit?: RecurringSchedule | null;
  onSaved?: (schedule: RecurringSchedule, isNew: boolean) => void;
}) {
  const {
    clients,
    addClient,
    currentUser,
    addRecurringSchedule,
    updateRecurringSchedule,
    formatCurrency,
  } = useFreelancePay();

  // Selected or New Client
  const [selectedClientId, setSelectedClientId] = useState(
    scheduleToEdit?.clientId || clients[0]?.id || ''
  );
  const [isAddingNewClient, setIsAddingNewClient] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientCompany, setNewClientCompany] = useState('');

  // Schedule Details
  const [title, setTitle] = useState(
    scheduleToEdit?.title || 'Monthly Engineering Retainer'
  );
  const [description, setDescription] = useState(
    scheduleToEdit?.description ||
      'Dedicated engineering sprint, continuous code reviews, and Paystack integration support.'
  );
  const [frequency, setFrequency] = useState<RecurringFrequency>(
    scheduleToEdit?.frequency || 'monthly'
  );
  const [currency, setScheduleCurrency] = useState<Currency>(
    scheduleToEdit?.currency || 'NGN'
  );
  const [startDate, setStartDate] = useState(
    scheduleToEdit?.startDate || '2026-09-25'
  );
  const [nextBillingDate, setNextBillingDate] = useState(
    scheduleToEdit?.nextBillingDate ||
      computeDefaultNextBilling(
        scheduleToEdit?.startDate || '2026-09-25',
        scheduleToEdit?.frequency || 'monthly'
      )
  );
  const [dueDaysAfterIssue, setDueDaysAfterIssue] = useState<number>(
    scheduleToEdit?.dueDaysAfterIssue || (scheduleToEdit?.frequency === 'weekly' ? 7 : 14)
  );
  const [autoSend, setAutoSend] = useState<boolean>(
    scheduleToEdit?.autoSend ?? true
  );
  const [notes, setNotes] = useState(
    scheduleToEdit?.notes ||
      'Standard recurring retainer invoice. Payment is due upon receipt or before the due date.'
  );

  // Line items
  const [lineItems, setLineItems] = useState<LineItem[]>(() => {
    if (scheduleToEdit?.lineItems && scheduleToEdit.lineItems.length > 0) {
      return scheduleToEdit.lineItems;
    }
    return [
      {
        id: 'li-rec-1',
        description: 'Monthly Engineering & Maintenance Retainer',
        quantity: 1,
        rate: 450000,
        amount: 450000,
      },
    ];
  });

  // Update next billing date when frequency changes if user hasn't explicitly customized it
  const handleFrequencyChange = (newFreq: RecurringFrequency) => {
    setFrequency(newFreq);
    setNextBillingDate(computeDefaultNextBilling(startDate, newFreq));
    if (newFreq === 'weekly') {
      setDueDaysAfterIssue(7);
    } else {
      setDueDaysAfterIssue(14);
    }
  };

  const handleStartDateChange = (newStart: string) => {
    setStartDate(newStart);
    setNextBillingDate(computeDefaultNextBilling(newStart, frequency));
  };

  const handleLineItemChange = (
    index: number,
    field: keyof LineItem,
    value: string | number
  ) => {
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
    const uniqueId = 'li-rec-' + String(new Date().getTime());
    setLineItems([
      ...lineItems,
      {
        id: uniqueId,
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

  const handleSave = () => {
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
      if (!existing && clients.length > 0) {
        clientId = clients[0].id;
        clientName = clients[0].name;
        clientEmail = clients[0].email;
        clientCompany = clients[0].companyName;
      } else if (existing) {
        clientName = existing.name;
        clientEmail = existing.email;
        clientCompany = existing.companyName;
      }
    }

    if (!title.trim()) {
      alert('Please enter a schedule title.');
      return;
    }

    if (scheduleToEdit) {
      updateRecurringSchedule(scheduleToEdit.id, {
        clientId,
        clientName,
        clientEmail,
        clientCompany,
        title,
        description,
        frequency,
        amount: subtotal,
        currency,
        lineItems,
        startDate,
        nextBillingDate,
        dueDaysAfterIssue,
        autoSend,
        notes,
      });

      if (onSaved) {
        onSaved(
          {
            ...scheduleToEdit,
            clientId,
            clientName,
            clientEmail,
            clientCompany,
            title,
            description,
            frequency,
            amount: subtotal,
            currency,
            lineItems,
            startDate,
            nextBillingDate,
            dueDaysAfterIssue,
            autoSend,
            notes,
          },
          false
        );
      }
    } else {
      const created = addRecurringSchedule({
        freelancerId: currentUser.id,
        clientId,
        clientName,
        clientEmail,
        clientCompany,
        title,
        description,
        frequency,
        amount: subtotal,
        currency,
        lineItems,
        startDate,
        nextBillingDate,
        dueDaysAfterIssue,
        autoSend,
        status: 'active',
        notes,
      });

      if (onSaved) {
        onSaved(created, true);
      }
    }

    onClose();
  };

  const frequencyOptions: {
    value: RecurringFrequency;
    label: string;
    sublabel: string;
  }[] = [
    {
      value: 'weekly',
      label: 'Weekly',
      sublabel: 'Every 7 days · Best for agile dev & sprint cycles',
    },
    {
      value: 'monthly',
      label: 'Monthly',
      sublabel: 'Every month · Ideal for retainers & maintenance',
    },
    {
      value: 'biweekly',
      label: 'Bi-Weekly',
      sublabel: 'Every 14 days · Mid-month deliverable sign-offs',
    },
    {
      value: 'quarterly',
      label: 'Quarterly',
      sublabel: 'Every 3 months · Long-term strategy & advisory',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-fade-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/75">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-800 flex items-center justify-center font-bold">
              <CalendarClock className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>
                  {scheduleToEdit
                    ? 'Edit Recurring Schedule'
                    : 'Set New Recurring Schedule'}
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                  Automated Invoicing
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Automatically generate and schedule invoices for specific clients on a weekly or monthly cadence
              </p>
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
          {/* Schedule Frequency Selector - Prominently highlighting Weekly and Monthly */}
          <div className="p-4 bg-teal-50/50 rounded-xl border border-teal-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                <Repeat className="w-3.5 h-3.5 text-teal-600" />
                <span>Invoice Generation Frequency</span>
              </label>
              <span className="text-[11px] text-teal-700 font-medium">
                Auto-bills on exact cadence
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {frequencyOptions.map((opt) => {
                const isSelected = frequency === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleFrequencyChange(opt.value)}
                    className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white border-teal-500 shadow-xs ring-2 ring-teal-500/20 text-slate-900'
                        : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-slate-900">
                        {opt.label}
                      </span>
                      {isSelected && (
                        <span className="w-4 h-4 rounded-full bg-teal-500 text-slate-950 flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 leading-tight">
                      {opt.sublabel}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Client Selection */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-teal-600" />
                <span>Target Client</span>
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
                    {c.name} · {c.companyName} ({c.email})
                  </option>
                ))}
              </select>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Client Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Sarah Jenkins"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Client Email *</label>
                  <input
                    type="email"
                    placeholder="sarah@client.co"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Company (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Jenkins Digital"
                    value={newClientCompany}
                    onChange={(e) => setNewClientCompany(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Schedule Title & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Schedule / Retainer Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Monthly Senior Frontend Engineering Retainer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Currency</label>
              <select
                value={currency}
                onChange={(e) => setScheduleCurrency(e.target.value as Currency)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white font-medium cursor-pointer"
              >
                <option value="NGN">NGN (₦) Nigerian Naira</option>
                <option value="USD">USD ($) US Dollar</option>
                <option value="GBP">GBP (£) British Pound</option>
                <option value="EUR">EUR (€) Euro</option>
              </select>
            </div>
          </div>

          {/* Schedule Dates & Terms */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                <span>Start Date</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-slate-900 focus:outline-none focus:border-teal-500"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">When retainer begins</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                <span>Next Billing Date</span>
              </label>
              <input
                type="date"
                value={nextBillingDate}
                onChange={(e) => setNextBillingDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-slate-900 focus:outline-none focus:border-teal-500"
              />
              <span className="text-[10px] text-teal-700 font-medium mt-0.5 block">
                Next automatic invoice run
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Payment Due Window
              </label>
              <select
                value={dueDaysAfterIssue}
                onChange={(e) => setDueDaysAfterIssue(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500 cursor-pointer"
              >
                <option value={7}>Due in 7 days (Weekly standard)</option>
                <option value={14}>Due in 14 days (Net-14)</option>
                <option value={30}>Due in 30 days (Net-30)</option>
                <option value={1}>Due immediately upon issue</option>
              </select>
              <span className="text-[10px] text-slate-500 mt-0.5 block">Payment due term</span>
            </div>
          </div>

          {/* Automated Delivery Option */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
            <input
              type="checkbox"
              id="auto-send-toggle"
              checked={autoSend}
              onChange={(e) => setAutoSend(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
            />
            <label htmlFor="auto-send-toggle" className="cursor-pointer text-xs">
              <span className="font-semibold text-slate-900 block flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-teal-600" />
                <span>Automatically dispatch invoice email with Paystack checkout link upon generation</span>
              </span>
              <span className="text-slate-500 text-[11px] block mt-0.5">
                {autoSend
                  ? 'Invoices will be marked as "Sent" and immediately dispatched to client with direct settlement link.'
                  : 'Invoices will be generated as "Draft" for your review in the Invoices ledger before sending.'}
              </span>
            </label>
          </div>

          {/* Line Items Builder */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-800 text-xs">
                Recurring Line Items & Services
              </span>
              <button
                type="button"
                onClick={addRow}
                className="text-xs text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <th className="py-2 px-3">Service Description</th>
                    <th className="py-2 px-3 w-16 text-center">Qty</th>
                    <th className="py-2 px-3 w-28 text-right">Unit Rate</th>
                    <th className="py-2 px-3 w-28 text-right">Amount</th>
                    <th className="py-2 px-2 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {lineItems.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="p-2">
                        <input
                          type="text"
                          value={item.description}
                          placeholder="e.g. Weekly QA testing & bug triage"
                          onChange={(e) =>
                            handleLineItemChange(idx, 'description', e.target.value)
                          }
                          className="w-full px-2 py-1 bg-transparent border-0 border-b border-transparent focus:border-teal-500 text-slate-900 focus:outline-none"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleLineItemChange(idx, 'quantity', e.target.value)
                          }
                          className="w-12 text-center py-1 bg-transparent border border-slate-200 rounded text-slate-900 font-mono"
                        />
                      </td>
                      <td className="p-2 text-right">
                        <input
                          type="number"
                          min="0"
                          step="5000"
                          value={item.rate}
                          onChange={(e) =>
                            handleLineItemChange(idx, 'rate', e.target.value)
                          }
                          className="w-24 text-right py-1 bg-transparent border border-slate-200 rounded text-slate-900 font-mono"
                        />
                      </td>
                      <td className="p-2 text-right font-mono font-semibold text-slate-900 tabular-nums">
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
              <span>Recurring Billing Subtotal (per {frequency === 'weekly' ? 'week' : frequency === 'monthly' ? 'month' : frequency}):</span>
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
              <span className="text-teal-900">Estimated Net Payout Per Cycle:</span>
              <span className="font-mono tabular-nums text-teal-700">
                {formatCurrency(netPayout, currency)}
              </span>
            </div>
          </div>

          {/* Notes & Terms */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Recurring Retainer Notes & Client Instructions
            </label>
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
              onClick={handleSave}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{scheduleToEdit ? 'Update Schedule' : 'Activate Recurring Schedule'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RecurringScheduleModal({
  isOpen,
  onClose,
  scheduleToEdit,
  onSaved,
}: RecurringScheduleModalProps) {
  if (!isOpen) return null;

  return (
    <RecurringScheduleForm
      key={scheduleToEdit?.id || 'new-schedule'}
      onClose={onClose}
      scheduleToEdit={scheduleToEdit}
      onSaved={onSaved}
    />
  );
}
