'use client';

import React, { useState } from 'react';
import { useFreelancePay } from '@/lib/store';
import { RecurringSchedule, RecurringFrequency } from '@/lib/types';
import {
  CalendarClock,
  Repeat,
  Play,
  Pause,
  Edit2,
  Trash2,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  ArrowRight,
  TrendingUp,
  FileText,
  Calendar,
  Zap,
} from 'lucide-react';

interface RecurringSchedulesViewProps {
  onOpenCreateSchedule: () => void;
  onEditSchedule: (schedule: RecurringSchedule) => void;
  onViewGeneratedInvoices?: (scheduleId: string) => void;
}

export function RecurringSchedulesView({
  onOpenCreateSchedule,
  onEditSchedule,
  onViewGeneratedInvoices,
}: RecurringSchedulesViewProps) {
  const {
    recurringSchedules,
    toggleRecurringScheduleStatus,
    deleteRecurringSchedule,
    generateRecurringInvoice,
    checkAndGenerateDueRecurringInvoices,
    formatCurrency,
  } = useFreelancePay();

  const [searchQuery, setSearchQuery] = useState('');
  const [frequencyFilter, setFrequencyFilter] = useState<'all' | RecurringFrequency>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCheckingDue, setIsCheckingDue] = useState(false);
  const todayStr = new Date().toISOString().split('T')[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleGenerateNow = (schedule: RecurringSchedule) => {
    const inv = generateRecurringInvoice(schedule.id);
    if (inv) {
      showToast(
        `Generated invoice ${inv.invoiceNumber} (${formatCurrency(inv.amount, inv.currency)}) for ${schedule.clientName}! Next bill advanced to ${schedule.nextBillingDate}.`
      );
    } else {
      showToast('Could not generate invoice for schedule.');
    }
  };

  const handleCheckDueNow = () => {
    setIsCheckingDue(true);
    setTimeout(() => {
      const res = checkAndGenerateDueRecurringInvoices();
      setIsCheckingDue(false);
      if (res.generatedCount > 0) {
        showToast(
          `Processed due schedules: ${res.generatedCount} invoice(s) automatically generated and added to ledger!`
        );
      } else {
        showToast(
          'All recurring schedules are up to date. Next automatic runs will trigger on their scheduled billing dates.'
        );
      }
    }, 400);
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete the recurring schedule "${title}"? Existing generated invoices will be preserved.`)) {
      deleteRecurringSchedule(id);
      showToast(`Schedule "${title}" deleted.`);
    }
  };

  // Filtered schedules
  const filteredSchedules = recurringSchedules.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.clientCompany && s.clientCompany.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFreq = frequencyFilter === 'all' || s.frequency === frequencyFilter;
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;

    return matchesSearch && matchesFreq && matchesStatus;
  });

  // Calculate projected Monthly Recurring Revenue (MRR)
  const activeSchedules = recurringSchedules.filter((s) => s.status === 'active');
  const totalProjectedMRR = activeSchedules.reduce((sum, s) => {
    let monthlyEquiv = s.amount;
    if (s.frequency === 'weekly') {
      monthlyEquiv = s.amount * 4.33; // Average weeks per month
    } else if (s.frequency === 'biweekly') {
      monthlyEquiv = s.amount * 2.16;
    } else if (s.frequency === 'quarterly') {
      monthlyEquiv = s.amount / 3;
    }
    return sum + monthlyEquiv;
  }, 0);

  const totalInvoicesAutomated = recurringSchedules.reduce(
    (sum, s) => sum + (s.totalInvoicesGenerated || 0),
    0
  );

  // Find next upcoming billing date among active schedules
  const upcomingDates = activeSchedules
    .map((s) => s.nextBillingDate)
    .filter(Boolean)
    .sort();
  const nextRunDate = upcomingDates.length > 0 ? upcomingDates[0] : 'None scheduled';

  const getFrequencyBadge = (freq: RecurringFrequency) => {
    switch (freq) {
      case 'weekly':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Repeat className="w-3 h-3 text-indigo-600" />
            <span>Weekly</span>
          </span>
        );
      case 'monthly':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-teal-50 text-teal-800 border border-teal-200">
            <Calendar className="w-3 h-3 text-teal-600" />
            <span>Monthly</span>
          </span>
        );
      case 'biweekly':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <Clock className="w-3 h-3 text-purple-600" />
            <span>Bi-Weekly</span>
          </span>
        );
      case 'quarterly':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <CalendarClock className="w-3 h-3 text-amber-600" />
            <span>Quarterly</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="bg-slate-900 text-teal-300 text-xs px-4 py-2.5 rounded-xl flex items-center justify-between animate-fade-in shadow-md">
          <span className="font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-4 text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Analytics & Projection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Active Schedules
            </div>
            <div className="text-xl font-extrabold text-slate-900 mt-1 font-mono tabular-nums">
              {activeSchedules.length}{' '}
              <span className="text-xs font-normal text-slate-400">
                / {recurringSchedules.length} total
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <CalendarClock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Projected MRR
            </div>
            <div className="text-xl font-extrabold text-teal-700 mt-1 font-mono tabular-nums">
              {formatCurrency(totalProjectedMRR)}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Next Automated Run
            </div>
            <div className="text-sm font-bold text-slate-900 mt-1 font-mono">
              {nextRunDate}
            </div>
            <div className="text-[10px] text-teal-700 font-medium mt-0.5">
              Scheduled auto-dispatch
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Invoices Automated
            </div>
            <div className="text-xl font-extrabold text-slate-900 mt-1 font-mono tabular-nums">
              {totalInvoicesAutomated}{' '}
              <span className="text-xs font-normal text-slate-400">generated</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Header Banner & Automation Engine Controller */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                Client Retainers & Recurring Schedules
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-teal-100 text-teal-900 border border-teal-200">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-pulse" />
                <span>Auto-Scheduler Active</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Set weekly or monthly schedules that automatically generate invoices with Paystack checkout links for specific clients
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCheckDueNow}
              disabled={isCheckingDue}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Scan and immediately trigger invoice generation for any schedules with billing dates on or before today"
            >
              <Zap className={`w-3.5 h-3.5 text-amber-500 ${isCheckingDue ? 'animate-spin' : ''}`} />
              <span>{isCheckingDue ? 'Evaluating...' : 'Run Due Schedules'}</span>
            </button>

            <button
              type="button"
              onClick={onOpenCreateSchedule}
              className="px-3.5 py-2 text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>New Schedule</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-3 sm:px-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {/* Search Input */}
            <div className="relative min-w-[200px] sm:max-w-xs flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search schedule or client..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 focus:bg-white text-slate-900"
              />
            </div>

            {/* Frequency Filter Chips */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setFrequencyFilter('all')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                  frequencyFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFrequencyFilter('weekly')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                  frequencyFilter === 'weekly'
                    ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Weekly
              </button>
              <button
                type="button"
                onClick={() => setFrequencyFilter('monthly')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                  frequencyFilter === 'monthly'
                    ? 'bg-white text-teal-800 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setFrequencyFilter('biweekly')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                  frequencyFilter === 'biweekly'
                    ? 'bg-white text-purple-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Bi-Weekly
              </button>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'paused')}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-teal-500 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="paused">Paused Only</option>
            </select>
          </div>

          <div className="text-[11px] text-slate-400 font-mono">
            {filteredSchedules.length} schedule{filteredSchedules.length === 1 ? '' : 's'} found
          </div>
        </div>

        {/* Schedules Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Client & Retainer</th>
                <th className="py-3 px-3">Schedule</th>
                <th className="py-3 px-3">Billing Amount</th>
                <th className="py-3 px-3">Next Billing Date</th>
                <th className="py-3 px-3">Delivery Mode</th>
                <th className="py-3 px-3 text-center">Generated</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredSchedules.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <CalendarClock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700 text-sm">
                      No recurring schedules match your criteria
                    </p>
                    <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
                      Create a weekly or monthly schedule to automate recurring invoices for your retainer clients.
                    </p>
                    <button
                      type="button"
                      onClick={onOpenCreateSchedule}
                      className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Set Up First Schedule</span>
                    </button>
                  </td>
                </tr>
              ) : (
                filteredSchedules.map((schedule) => {
                  const isActive = schedule.status === 'active';
                  const isUpcomingToday =
                    schedule.nextBillingDate <= todayStr;

                  return (
                    <tr
                      key={schedule.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        !isActive ? 'bg-slate-50/40 opacity-75' : ''
                      }`}
                    >
                      {/* Client & Title */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-xs">
                          {schedule.title}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-600 mt-0.5">
                          <span className="font-medium text-slate-800">
                            {schedule.clientName}
                          </span>
                          {schedule.clientCompany && (
                            <>
                              <span className="text-slate-300">·</span>
                              <span className="text-slate-500">
                                {schedule.clientCompany}
                              </span>
                            </>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-xs mt-0.5">
                          {schedule.clientEmail}
                        </div>
                      </td>

                      {/* Frequency Badge */}
                      <td className="py-3.5 px-3">
                        <div className="space-y-1">
                          {getFrequencyBadge(schedule.frequency)}
                          <div className="text-[10px] text-slate-400">
                            Due in {schedule.dueDaysAfterIssue || 14}d
                          </div>
                        </div>
                      </td>

                      {/* Billing Amount */}
                      <td className="py-3.5 px-3">
                        <div className="font-mono font-bold text-slate-900 tabular-nums">
                          {formatCurrency(schedule.amount, schedule.currency)}
                        </div>
                        <div className="text-[10px] text-slate-400 capitalize">
                          per {schedule.frequency === 'weekly' ? 'week' : schedule.frequency === 'monthly' ? 'month' : schedule.frequency}
                        </div>
                      </td>

                      {/* Next Billing Date */}
                      <td className="py-3.5 px-3 font-mono">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-semibold ${
                              isUpcomingToday && isActive
                                ? 'text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200'
                                : 'text-slate-800'
                            }`}
                          >
                            {schedule.nextBillingDate}
                          </span>
                        </div>
                        {isUpcomingToday && isActive && (
                          <div className="text-[10px] text-amber-700 font-sans font-medium mt-0.5">
                            Due for generation
                          </div>
                        )}
                      </td>

                      {/* Delivery Mode */}
                      <td className="py-3.5 px-3">
                        {schedule.autoSend ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-teal-800 font-medium">
                            <Send className="w-3 h-3 text-teal-600" />
                            <span>Auto-Email Link</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                            <FileText className="w-3 h-3 text-slate-400" />
                            <span>Save as Draft</span>
                          </span>
                        )}
                      </td>

                      {/* Generated Stats */}
                      <td className="py-3.5 px-3 text-center font-mono">
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                          {schedule.totalInvoicesGenerated || 0}
                        </span>
                        {schedule.lastGeneratedInvoiceNumber && (
                          <div className="text-[10px] text-slate-400 mt-1">
                            Last: {schedule.lastGeneratedInvoiceNumber}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700">
                            <span className="w-2 h-2 rounded-full bg-amber-400" />
                            <span>Paused</span>
                          </span>
                        )}
                      </td>

                      {/* Row Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Generate Invoice Now */}
                          <button
                            type="button"
                            onClick={() => handleGenerateNow(schedule)}
                            className="p-1.5 text-teal-700 hover:text-teal-900 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                            title="Generate an invoice from this schedule immediately"
                          >
                            <Zap className="w-3.5 h-3.5" />
                          </button>

                          {/* Pause / Resume */}
                          <button
                            type="button"
                            onClick={() => toggleRecurringScheduleStatus(schedule.id)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isActive
                                ? 'text-slate-400 hover:text-amber-700 hover:bg-amber-50'
                                : 'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50'
                            }`}
                            title={isActive ? 'Pause Schedule' : 'Resume Schedule'}
                          >
                            {isActive ? (
                              <Pause className="w-3.5 h-3.5" />
                            ) : (
                              <Play className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Edit Schedule */}
                          <button
                            type="button"
                            onClick={() => onEditSchedule(schedule)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit schedule settings"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Schedule */}
                          <button
                            type="button"
                            onClick={() => handleDelete(schedule.id, schedule.title)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete recurring schedule"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Info Callout */}
        <div className="p-3 sm:px-5 bg-slate-50/70 border-t border-slate-100 text-[11px] text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-700">How Recurring Billing Works:</span>
            <span>
              On each scheduled billing date, an official invoice is generated, the next billing date advances automatically, and the invoice appears in your primary invoice ledger.
            </span>
          </div>
          <div className="text-slate-400 font-mono text-[10px] shrink-0">
            Powered by FreelancePay Automation Engine
          </div>
        </div>
      </div>
    </div>
  );
}
