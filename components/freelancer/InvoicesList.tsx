import React, { useState, useRef, useEffect } from 'react';
import { useFreelancePay } from '@/lib/store';
import { Invoice, InvoiceStatus, RecurringSchedule } from '@/lib/types';
import { InvoiceExportPdfModal } from './InvoiceExportPdfModal';
import { RecurringScheduleModal } from './RecurringScheduleModal';
import { RecurringSchedulesView } from './RecurringSchedulesView';
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
  ChevronDown,
  Check,
  X,
  FileDown,
  Printer,
  Repeat,
  CalendarClock,
  Calendar,
  FileText,
} from 'lucide-react';

interface InvoicesListProps {
  onOpenCreate: () => void;
  onPreviewInvoice: (invoice: Invoice) => void;
  onOpenPayment: (invoice: Invoice) => void;
}

type FilterStatusType = 'all' | 'paid' | 'pending' | 'overdue' | 'draft' | 'recurring';

export function InvoicesList({
  onOpenCreate,
  onPreviewInvoice,
  onOpenPayment,
}: InvoicesListProps) {
  const { invoices, recurringSchedules, deleteInvoice, sendInvoice, sendReminder, formatCurrency } = useFreelancePay();
  const [activeView, setActiveView] = useState<'invoices' | 'schedules'>('invoices');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatusType>('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Recurring Schedule Modal State
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [scheduleToEdit, setScheduleToEdit] = useState<RecurringSchedule | null>(null);

  // PDF Export Modal State & Invoices Selection
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfExportScope, setPdfExportScope] = useState<'current-view' | 'selected' | 'single'>('current-view');
  const [pdfSingleInvoice, setPdfSingleInvoice] = useState<Invoice | null>(null);
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

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

  const statusOptions: {
    value: FilterStatusType;
    label: string;
    description: string;
    count: number;
    colorDot: string;
  }[] = [
    {
      value: 'all',
      label: 'All Invoices',
      description: 'View all invoices regardless of status',
      count: invoices.length,
      colorDot: 'bg-slate-400',
    },
    {
      value: 'paid',
      label: 'Paid',
      description: 'Settled invoices received in full',
      count: invoices.filter((i) => i.status === 'paid').length,
      colorDot: 'bg-emerald-500',
    },
    {
      value: 'pending',
      label: 'Pending',
      description: 'Sent & viewed awaiting settlement',
      count: invoices.filter((i) => i.status === 'sent' || i.status === 'viewed').length,
      colorDot: 'bg-amber-500',
    },
    {
      value: 'overdue',
      label: 'Overdue',
      description: 'Past due date needing payment reminders',
      count: invoices.filter((i) => i.status === 'overdue').length,
      colorDot: 'bg-rose-500',
    },
    {
      value: 'draft',
      label: 'Draft',
      description: 'Unsent invoices in preparation',
      count: invoices.filter((i) => i.status === 'draft').length,
      colorDot: 'bg-slate-400',
    },
    {
      value: 'recurring',
      label: 'Recurring Retainers',
      description: 'Invoices generated from recurring schedules',
      count: invoices.filter((i) => i.isRecurringGenerated || i.recurringScheduleId).length,
      colorDot: 'bg-teal-500',
    },
  ];

  const currentOption = statusOptions.find((opt) => opt.value === statusFilter) || statusOptions[0];

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter === 'all') {
      matchesStatus = true;
    } else if (statusFilter === 'pending') {
      matchesStatus = inv.status === 'sent' || inv.status === 'viewed';
    } else if (statusFilter === 'recurring') {
      matchesStatus = !!(inv.isRecurringGenerated || inv.recurringScheduleId);
    } else {
      matchesStatus = inv.status === statusFilter;
    }

    return matchesSearch && matchesStatus;
  });

  // Selection helpers
  const toggleSelectInvoice = (id: string) => {
    setSelectedInvoiceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllVisible = () => {
    if (filteredInvoices.length === 0) return;
    const allVisibleSelected = filteredInvoices.every((inv) =>
      selectedInvoiceIds.includes(inv.id)
    );
    if (allVisibleSelected) {
      const visibleIds = new Set(filteredInvoices.map((inv) => inv.id));
      setSelectedInvoiceIds((prev) => prev.filter((id) => !visibleIds.has(id)));
    } else {
      const newSelected = new Set([...selectedInvoiceIds, ...filteredInvoices.map((inv) => inv.id)]);
      setSelectedInvoiceIds(Array.from(newSelected));
    }
  };

  const isAllVisibleSelected =
    filteredInvoices.length > 0 &&
    filteredInvoices.every((inv) => selectedInvoiceIds.includes(inv.id));
  const isSomeVisibleSelected =
    filteredInvoices.some((inv) => selectedInvoiceIds.includes(inv.id)) &&
    !isAllVisibleSelected;

  const selectedInvoicesList = invoices.filter((i) => selectedInvoiceIds.includes(i.id));

  const handleExportCurrentView = () => {
    setPdfExportScope(selectedInvoiceIds.length > 0 ? 'selected' : 'current-view');
    setPdfSingleInvoice(null);
    setIsPdfModalOpen(true);
  };

  const handleExportSelected = () => {
    setPdfExportScope('selected');
    setPdfSingleInvoice(null);
    setIsPdfModalOpen(true);
  };

  const handleExportSingleInvoice = (invoice: Invoice) => {
    setPdfExportScope('single');
    setPdfSingleInvoice(invoice);
    setIsPdfModalOpen(true);
  };

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
            <span>Pending · Awaiting</span>
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

  const activeSchedulesCount = recurringSchedules.filter((s) => s.status === 'active').length;

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

      {/* Top Navigation Tabs: Invoices vs Recurring Retainers */}
      <div className="flex items-center justify-between border-b border-slate-200 px-4 sm:px-5 pt-3 bg-slate-50/75">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveView('invoices')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeView === 'invoices'
                ? 'border-teal-500 text-teal-950 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>All Invoices</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono tabular-nums ${
                activeView === 'invoices'
                  ? 'bg-teal-100 text-teal-800 font-bold'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {invoices.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('schedules')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeView === 'schedules'
                ? 'border-teal-500 text-teal-950 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Repeat className="w-3.5 h-3.5" />
            <span>Recurring Schedules</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono tabular-nums flex items-center gap-1 ${
                activeView === 'schedules'
                  ? 'bg-teal-100 text-teal-800 font-bold'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              <span>{recurringSchedules.length}</span>
              {activeSchedulesCount > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </span>
          </button>
        </div>

        <div className="pb-2 hidden sm:flex items-center gap-2">
          {activeView === 'invoices' ? (
            <button
              type="button"
              onClick={() => {
                setScheduleToEdit(null);
                setIsRecurringModalOpen(true);
              }}
              className="text-xs text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1 cursor-pointer px-2 py-1 rounded hover:bg-teal-50"
            >
              <CalendarClock className="w-3.5 h-3.5" />
              <span>+ Set Recurring Schedule</span>
            </button>
          ) : (
            <span className="text-xs text-slate-400">
              Weekly & Monthly automated invoice generation
            </span>
          )}
        </div>
      </div>

      {/* RENDER ACTIVE VIEW */}
      {activeView === 'schedules' ? (
        <div className="p-4 sm:p-5">
          <RecurringSchedulesView
            onOpenCreateSchedule={() => {
              setScheduleToEdit(null);
              setIsRecurringModalOpen(true);
            }}
            onEditSchedule={(sched) => {
              setScheduleToEdit(sched);
              setIsRecurringModalOpen(true);
            }}
            onViewGeneratedInvoices={(schedId) => {
              setStatusFilter('recurring');
              setActiveView('invoices');
            }}
          />
        </div>
      ) : (
        <>
          {/* Control Header & Filters for Invoices */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              {/* Search Input */}
              <div className="relative flex-1 min-w-[200px] sm:max-w-xs">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search invoice # or client..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 focus:bg-white text-slate-900"
                />
              </div>

              {/* Filtering Dropdown that lets users view invoices by status */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  id="invoice-status-filter-button"
                  aria-haspopup="listbox"
                  aria-expanded={isDropdownOpen}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer select-none ${
                    statusFilter !== 'all'
                      ? 'bg-teal-50/80 border-teal-300 text-teal-950 font-semibold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Filter className={`w-3.5 h-3.5 ${statusFilter !== 'all' ? 'text-teal-600' : 'text-slate-400'}`} />
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 font-normal">Status:</span>
                    <span className="flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${currentOption.colorDot}`} />
                      <span>{currentOption.label}</span>
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                      isDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu Box */}
                {isDropdownOpen && (
                  <div
                    role="listbox"
                    aria-labelledby="invoice-status-filter-button"
                    className="absolute left-0 mt-1.5 w-60 bg-white rounded-lg border border-slate-200 shadow-xl py-1.5 z-30 animate-in fade-in slide-in-from-top-1 duration-150"
                  >
                    <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100 flex items-center justify-between">
                      <span>Filter By Status</span>
                      <span className="text-slate-400 font-mono text-[10px]">
                        {filteredInvoices.length} visible
                      </span>
                    </div>

                    <div className="py-1">
                      {statusOptions.map((opt) => {
                        const isSelected = statusFilter === opt.value;
                        return (
                          <button
                            key={opt.value}
                            role="option"
                            aria-selected={isSelected}
                            type="button"
                            onClick={() => {
                              setStatusFilter(opt.value);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-2 text-xs flex items-center justify-between transition-colors text-left cursor-pointer ${
                              isSelected
                                ? 'bg-teal-50 text-teal-950 font-semibold'
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className={`w-2 h-2 rounded-full ${opt.colorDot}`} />
                              <div>
                                <div className="text-xs leading-none">{opt.label}</div>
                                <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                                  {opt.description}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 ml-2">
                              <span
                                className={`text-[11px] px-1.5 py-0.5 rounded-full font-mono tabular-nums ${
                                  isSelected
                                    ? 'bg-teal-200/70 text-teal-900'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {opt.count}
                              </span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {statusFilter !== 'all' && (
                      <div className="pt-1.5 mt-1 border-t border-slate-100 px-2">
                        <button
                          type="button"
                          onClick={() => {
                            setStatusFilter('all');
                            setIsDropdownOpen(false);
                          }}
                          className="w-full text-center py-1 text-[11px] text-slate-500 hover:text-teal-700 cursor-pointer font-medium hover:bg-slate-50 rounded"
                        >
                          Clear Status Filter
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Active Filter Clear Pill */}
              {statusFilter !== 'all' && (
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 text-xs bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                    <span>Filtering: <strong>{currentOption.label}</strong></span>
                    <button
                      type="button"
                      onClick={() => setStatusFilter('all')}
                      className="p-0.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded cursor-pointer"
                      title="Remove filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Export PDF Button */}
              <button
                type="button"
                onClick={handleExportCurrentView}
                className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                title="Export invoices as print-ready PDF"
              >
                <FileDown className="w-4 h-4 text-teal-600" />
                <span>Export PDF</span>
                {selectedInvoiceIds.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-teal-100 text-teal-800 font-bold font-mono">
                    {selectedInvoiceIds.length}
                  </span>
                )}
              </button>

              {/* New Recurring Schedule Button */}
              <button
                type="button"
                onClick={() => {
                  setScheduleToEdit(null);
                  setIsRecurringModalOpen(true);
                }}
                className="px-3 py-2 text-xs font-semibold text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                title="Set a weekly or monthly schedule for automatically generating client invoices"
              >
                <CalendarClock className="w-4 h-4 text-teal-600" />
                <span>Recurring Schedule</span>
              </button>

              <button
                onClick={onOpenCreate}
                className="px-3.5 py-2 text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>New Invoice</span>
              </button>
            </div>
          </div>

      {/* Invoice Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={isAllVisibleSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isSomeVisibleSelected;
                  }}
                  onChange={handleSelectAllVisible}
                  aria-label="Select all visible invoices"
                  className="w-3.5 h-3.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                />
              </th>
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
                <td colSpan={8} className="py-12 text-center text-slate-500">
                  <p className="font-medium text-slate-700">No invoices match your filter criteria.</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {statusFilter !== 'all' ? (
                      <span>
                        No invoices currently marked as{' '}
                        <strong className="text-slate-600 font-semibold">{currentOption.label}</strong>.{' '}
                        <button
                          type="button"
                          onClick={() => setStatusFilter('all')}
                          className="text-teal-600 hover:text-teal-700 hover:underline font-semibold cursor-pointer ml-1"
                        >
                          Show all invoices
                        </button>
                      </span>
                    ) : (
                      'Create a new invoice to start billing your clients.'
                    )}
                  </p>
                </td>
              </tr>
            ) : (
              filteredInvoices.map((inv) => (
                <tr
                  key={inv.id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    selectedInvoiceIds.includes(inv.id) ? 'bg-teal-50/40' : ''
                  }`}
                >
                  {/* Row Checkbox */}
                  <td className="py-3.5 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={selectedInvoiceIds.includes(inv.id)}
                      onChange={() => toggleSelectInvoice(inv.id)}
                      aria-label={`Select invoice ${inv.invoiceNumber}`}
                      className="w-3.5 h-3.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                    />
                  </td>

                  {/* Invoice # */}
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => onPreviewInvoice(inv)}
                        className="hover:text-teal-600 transition-colors underline cursor-pointer text-left"
                      >
                        {inv.invoiceNumber}
                      </button>
                      {(inv.isRecurringGenerated || inv.recurringScheduleId) && (
                        <span
                          className="inline-flex items-center gap-1 text-[10px] font-semibold text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200 w-fit"
                          title="Generated automatically from a recurring retainer schedule"
                        >
                          <Repeat className="w-2.5 h-2.5 text-teal-600" />
                          <span>Recurring</span>
                        </span>
                      )}
                    </div>
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
                        title="View / Print Invoice Preview"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Export Single Invoice as PDF */}
                      <button
                        type="button"
                        onClick={() => handleExportSingleInvoice(inv)}
                        className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-md transition-colors cursor-pointer"
                        title="Export this invoice as PDF"
                      >
                        <FileDown className="w-3.5 h-3.5 text-teal-600" />
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

      {/* Batch Floating Action Bar when items selected */}
      {selectedInvoiceIds.length > 0 && (
        <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between text-xs border-t border-slate-800 animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span className="font-semibold text-slate-100">
              {selectedInvoiceIds.length} {selectedInvoiceIds.length === 1 ? 'invoice' : 'invoices'} selected
            </span>
            <span className="text-slate-400 hidden sm:inline">
              (Total: {formatCurrency(selectedInvoicesList.reduce((acc, i) => acc + i.amount, 0), 'NGN')})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportSelected}
              className="px-3 py-1 bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Export Selected as PDF ({selectedInvoiceIds.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedInvoiceIds([])}
              className="px-2 py-1 text-slate-400 hover:text-white transition-colors cursor-pointer text-xs"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Footer Pagination / Summary */}
      <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
        <span>Showing {filteredInvoices.length} of {invoices.length} invoices</span>
        <div className="flex items-center gap-3 font-mono tabular-nums">
          <span>Processed via Paystack & Direct Debit</span>
        </div>
      </div>
      </>
      )}

      {/* Dedicated Invoice Export to PDF Modal */}
      <InvoiceExportPdfModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        allInvoices={invoices}
        filteredInvoices={filteredInvoices}
        selectedInvoices={selectedInvoicesList}
        initialScope={pdfExportScope}
        singleInvoice={pdfSingleInvoice}
        activeStatusFilter={currentOption.label}
      />

      {/* Recurring Schedule Modal */}
      <RecurringScheduleModal
        isOpen={isRecurringModalOpen}
        onClose={() => {
          setIsRecurringModalOpen(false);
          setScheduleToEdit(null);
        }}
        scheduleToEdit={scheduleToEdit}
        onSaved={(sched, isNew) => {
          showToast(
            isNew
              ? `Created recurring schedule for ${sched.clientName} (${sched.frequency.toUpperCase()}).`
              : `Updated recurring schedule for ${sched.clientName}.`
          );
        }}
      />
    </div>
  );
}
