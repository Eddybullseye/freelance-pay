'use client';

import React, { useState } from 'react';
import { useFreelancePay } from '@/lib/store';
import { ClientProfile, PaymentHistoryStatus } from '@/lib/types';
import {
  Users,
  Plus,
  Star,
  ShieldCheck,
  Building,
  Mail,
  Globe,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
} from 'lucide-react';

interface ClientsViewProps {
  onQuickBill: (client: ClientProfile) => void;
}

export function ClientsView({ onQuickBill }: ClientsViewProps) {
  const { clients, addClient, currentUser, formatCurrency } = useFreelancePay();
  const [isAddingClient, setIsAddingClient] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryStatus>('on_time');
  const [notes, setNotes] = useState('');

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    addClient({
      freelancerId: currentUser.id,
      name,
      email,
      companyName: companyName || name,
      website,
      paymentHistory,
      notes,
      rating: 5.0,
      isVerified: true,
    });

    setName('');
    setEmail('');
    setCompanyName('');
    setWebsite('');
    setNotes('');
    setIsAddingClient(false);
  };

  const getPaymentHistoryBadge = (status: PaymentHistoryStatus) => {
    switch (status) {
      case 'early':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            <span>Pays Early</span>
          </span>
        );
      case 'on_time':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            <Clock className="w-3 h-3 text-slate-600" />
            <span>On-Time Payer</span>
          </span>
        );
      case 'late':
      case 'never':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            <span>Frequent Delays</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Client CRM & Payment Reliability Directory</h2>
              <p className="text-xs text-slate-500">
                Track client payout history, internal working notes, and lifetime billed volume.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsAddingClient(true)}
          className="px-3.5 py-2 bg-teal-400 hover:bg-teal-300 text-slate-950 text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Client</span>
        </button>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map((client) => (
          <div
            key={client.id}
            className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-colors flex flex-col justify-between space-y-4 text-xs"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <span>{client.name}</span>
                    {client.isVerified && (
                      <span title="Identity & Payment Verified">
                        <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                      </span>
                    )}
                  </h3>
                  <p className="text-slate-500 font-medium">{client.companyName}</p>
                </div>
                <div>{getPaymentHistoryBadge(client.paymentHistory)}</div>
              </div>

              {/* Contact Info */}
              <div className="space-y-1 text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-slate-400" />
                  <span>{client.email}</span>
                </div>
                {client.website && (
                  <div className="flex items-center gap-1.5 text-teal-700">
                    <Globe className="w-3 h-3 text-slate-400" />
                    <a href={client.website} target="_blank" rel="noreferrer" className="hover:underline">
                      {client.website.replace('https://', '')}
                    </a>
                  </div>
                )}
              </div>

              {/* Rating & Notes */}
              <div className="flex items-center gap-2 text-slate-600">
                <div className="flex items-center text-amber-600 font-semibold gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{client.rating}</span>
                </div>
                <span>·</span>
                <span>{client.reviewCount} reviews</span>
              </div>

              {client.notes && (
                <p className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-slate-600 leading-relaxed text-[11px] italic">
                  &quot;{client.notes}&quot;
                </p>
              )}
            </div>

            {/* Lifetime Billed & Quick Action */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">Total Billed:</span>
                <span className="font-mono font-bold text-slate-900 text-xs">
                  {formatCurrency(client.totalBilled || 0)}
                </span>
              </div>

              <button
                onClick={() => onQuickBill(client)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-teal-600" />
                <span>Create Invoice</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Client Modal */}
      {isAddingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-fade-in text-xs">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Add New Client Profile</h3>
              <button
                onClick={() => setIsAddingClient(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="p-6 space-y-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contact Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Amara Sterling"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hiring@company.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company / Team Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. FinPulse Systems Ltd"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Website URL</label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Track Record</label>
                <select
                  value={paymentHistory}
                  onChange={(e) => setPaymentHistory(e.target.value as PaymentHistoryStatus)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500 cursor-pointer"
                >
                  <option value="early">Pays Early (Within 24 Hours)</option>
                  <option value="on_time">On-Time (Net 7–14 days)</option>
                  <option value="late">Tends to lag / Needs Reminders</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Internal Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Preferences, accounting email, payment terms..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingClient(false)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-lg font-medium text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold rounded-lg shadow-xs cursor-pointer"
                >
                  Save Client Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
