'use client';

import React from 'react';
import { useFreelancePay } from '@/lib/store';
import { TrendingUp, Clock, AlertTriangle, Calculator, ArrowUpRight } from 'lucide-react';

export function StatsCards() {
  const { invoices, taxRecord, formatCurrency } = useFreelancePay();

  const totalEarned = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const awaitingPayment = invoices
    .filter((inv) => inv.status === 'sent' || inv.status === 'viewed')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const awaitingCount = invoices.filter((inv) => inv.status === 'sent' || inv.status === 'viewed').length;

  const overdueAmount = invoices
    .filter((inv) => inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const overdueCount = invoices.filter((inv) => inv.status === 'overdue').length;

  const estimatedTax = taxRecord.estimatedTax;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Total Earned */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span className="font-medium">Total Earned (Settled)</span>
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 tracking-tight">
          {formatCurrency(totalEarned)}
        </div>
        <div className="mt-2.5 flex items-center text-xs text-emerald-600 font-medium gap-1">
          <ArrowUpRight className="w-3.5 h-3.5" />
          <span>+24.5% vs previous month</span>
        </div>
      </div>

      {/* Card 2: Awaiting Payment */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span className="font-medium">Awaiting Payment</span>
          <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 tracking-tight">
          {formatCurrency(awaitingPayment)}
        </div>
        <div className="mt-2.5 text-xs text-slate-500">
          <span>{awaitingCount} invoice{awaitingCount === 1 ? '' : 's'} dispatched to clients</span>
        </div>
      </div>

      {/* Card 3: Overdue Amount */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span className="font-medium">Overdue Invoices</span>
          <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 tracking-tight">
          {formatCurrency(overdueAmount)}
        </div>
        <div className="mt-2.5 text-xs text-rose-600 font-medium">
          {overdueCount > 0 ? (
            <span>{overdueCount} invoice overdue · Reminders active</span>
          ) : (
            <span className="text-slate-500">Zero overdue invoices</span>
          )}
        </div>
      </div>

      {/* Card 4: Estimated Tax Owed */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span className="font-medium">Estimated Tax Owed ({taxRecord.country})</span>
          <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
            <Calculator className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 tracking-tight">
          {formatCurrency(estimatedTax)}
        </div>
        <div className="mt-2.5 text-xs text-slate-500">
          <span>Effective rate: {taxRecord.effectiveRate}% after deductions</span>
        </div>
      </div>
    </div>
  );
}
