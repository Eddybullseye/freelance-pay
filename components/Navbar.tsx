'use client';

import React from 'react';
import { useFreelancePay } from '@/lib/store';
import { Currency, UserRole } from '@/lib/types';
import {
  FileText,
  Briefcase,
  Calculator,
  ShieldCheck,
  CreditCard,
  Building2,
  Users,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNewInvoice?: () => void;
}

export function Navbar({ activeTab, setActiveTab, onOpenNewInvoice }: NavbarProps) {
  const { role, setRole, currency, setCurrency, resetAllData } = useFreelancePay();

  const handleReset = () => {
    if (confirm('Reset demo data to initial defaults?')) {
      resetAllData();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      {/* Role Switching & Quick Notice Top Strip */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 sm:px-8 py-1.5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-medium text-slate-200">FreelancePay System Live</span>
          <span className="hidden md:inline text-slate-400">· Paystack Gateway Active (NGN/USD/GBP/EUR)</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            title="Reset demo data"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset Demo</span>
          </button>
          <div className="h-3 w-px bg-slate-700 hidden sm:block" />
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 hidden sm:inline">Active Portal:</span>
            <div className="flex items-center bg-slate-800 p-0.5 rounded border border-slate-700">
              <button
                onClick={() => {
                  setRole('freelancer');
                  setActiveTab('dashboard');
                }}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  role === 'freelancer'
                    ? 'bg-teal-500 text-slate-950 font-semibold shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Freelancer
              </button>
              <button
                onClick={() => {
                  setRole('client');
                  setActiveTab('client-overview');
                }}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  role === 'client'
                    ? 'bg-teal-500 text-slate-950 font-semibold shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Client
              </button>
              <button
                onClick={() => {
                  setRole('admin');
                  setActiveTab('admin-overview');
                }}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  role === 'admin'
                    ? 'bg-teal-500 text-slate-950 font-semibold shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Top Bar adhering strictly to Top Bar Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-slate-950 font-black text-lg shadow-sm">
              FP
            </div>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab(role === 'freelancer' ? 'dashboard' : role === 'client' ? 'client-overview' : 'admin-overview');
              }}
              className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5"
            >
              FreelancePay
            </a>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-medium text-slate-600">
          {role === 'freelancer' && (
            <>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('invoices')}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  activeTab === 'invoices'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Invoices
              </button>
              <button
                onClick={() => setActiveTab('jobs')}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  activeTab === 'jobs'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Find Work
              </button>
              <button
                onClick={() => setActiveTab('contracts')}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  activeTab === 'contracts'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Contracts & Escrow
              </button>
              <button
                onClick={() => setActiveTab('tax')}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  activeTab === 'tax'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Tax Calculator
              </button>
              <button
                onClick={() => setActiveTab('clients')}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  activeTab === 'clients'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Clients CRM
              </button>
            </>
          )}

          {role === 'client' && (
            <>
              <button
                onClick={() => setActiveTab('client-overview')}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  activeTab === 'client-overview'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Client Overview
              </button>
              <button
                onClick={() => setActiveTab('client-jobs')}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  activeTab === 'client-jobs'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Manage Job Postings
              </button>
              <button
                onClick={() => setActiveTab('client-applicants')}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  activeTab === 'client-applicants'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Applications & Hiring
              </button>
              <button
                onClick={() => setActiveTab('client-escrow')}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  activeTab === 'client-escrow'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Escrow & Milestones
              </button>
            </>
          )}

          {role === 'admin' && (
            <>
              <button
                onClick={() => setActiveTab('admin-overview')}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  activeTab === 'admin-overview'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Platform Metrics
              </button>
              <button
                onClick={() => setActiveTab('admin-disputes')}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  activeTab === 'admin-disputes'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Dispute Mediation
              </button>
              <button
                onClick={() => setActiveTab('admin-kyc')}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  activeTab === 'admin-kyc'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                KYC Verification
              </button>
              <button
                onClick={() => setActiveTab('admin-ledger')}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  activeTab === 'admin-ledger'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Escrow Ledger
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: Actions & Controls */}
        <div className="flex items-center gap-2.5">
          {/* Currency Selector */}
          <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium">Currency:</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              aria-label="Currency"
              className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="NGN">NGN (₦)</option>
              <option value="USD">USD ($)</option>
              <option value="GBP">GBP (£)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>

          {/* Primary Action Button according to Role */}
          {role === 'freelancer' && onOpenNewInvoice && (
            <button
              onClick={onOpenNewInvoice}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Create Invoice</span>
            </button>
          )}

          {role === 'client' && (
            <button
              onClick={() => setActiveTab('client-jobs')}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Post New Job</span>
            </button>
          )}

          {role === 'admin' && (
            <div className="flex items-center gap-1.5 text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>SuperAdmin</span>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation Sub-Bar */}
      <div className="lg:hidden border-t border-slate-200 px-4 py-2 flex items-center gap-2 overflow-x-auto text-xs font-medium text-slate-600">
        {role === 'freelancer' && (
          <>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-2.5 py-1 rounded whitespace-nowrap ${
                activeTab === 'dashboard' ? 'bg-slate-900 text-white' : 'bg-slate-100'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`px-2.5 py-1 rounded whitespace-nowrap ${
                activeTab === 'invoices' ? 'bg-slate-900 text-white' : 'bg-slate-100'
              }`}
            >
              Invoices
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-2.5 py-1 rounded whitespace-nowrap ${
                activeTab === 'jobs' ? 'bg-slate-900 text-white' : 'bg-slate-100'
              }`}
            >
              Find Work
            </button>
            <button
              onClick={() => setActiveTab('contracts')}
              className={`px-2.5 py-1 rounded whitespace-nowrap ${
                activeTab === 'contracts' ? 'bg-slate-900 text-white' : 'bg-slate-100'
              }`}
            >
              Contracts
            </button>
            <button
              onClick={() => setActiveTab('tax')}
              className={`px-2.5 py-1 rounded whitespace-nowrap ${
                activeTab === 'tax' ? 'bg-slate-900 text-white' : 'bg-slate-100'
              }`}
            >
              Tax
            </button>
            <button
              onClick={() => setActiveTab('clients')}
              className={`px-2.5 py-1 rounded whitespace-nowrap ${
                activeTab === 'clients' ? 'bg-slate-900 text-white' : 'bg-slate-100'
              }`}
            >
              Clients
            </button>
          </>
        )}
        {role === 'client' && (
          <>
            <button
              onClick={() => setActiveTab('client-overview')}
              className={`px-2.5 py-1 rounded whitespace-nowrap ${
                activeTab === 'client-overview' ? 'bg-slate-900 text-white' : 'bg-slate-100'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('client-jobs')}
              className={`px-2.5 py-1 rounded whitespace-nowrap ${
                activeTab === 'client-jobs' ? 'bg-slate-900 text-white' : 'bg-slate-100'
              }`}
            >
              Jobs
            </button>
            <button
              onClick={() => setActiveTab('client-applicants')}
              className={`px-2.5 py-1 rounded whitespace-nowrap ${
                activeTab === 'client-applicants' ? 'bg-slate-900 text-white' : 'bg-slate-100'
              }`}
            >
              Applicants
            </button>
            <button
              onClick={() => setActiveTab('client-escrow')}
              className={`px-2.5 py-1 rounded whitespace-nowrap ${
                activeTab === 'client-escrow' ? 'bg-slate-900 text-white' : 'bg-slate-100'
              }`}
            >
              Escrow
            </button>
          </>
        )}
        {role === 'admin' && (
          <>
            <button
              onClick={() => setActiveTab('admin-overview')}
              className={`px-2.5 py-1 rounded whitespace-nowrap ${
                activeTab === 'admin-overview' ? 'bg-slate-900 text-white' : 'bg-slate-100'
              }`}
            >
              Metrics
            </button>
            <button
              onClick={() => setActiveTab('admin-disputes')}
              className={`px-2.5 py-1 rounded whitespace-nowrap ${
                activeTab === 'admin-disputes' ? 'bg-slate-900 text-white' : 'bg-slate-100'
              }`}
            >
              Disputes
            </button>
            <button
              onClick={() => setActiveTab('admin-kyc')}
              className={`px-2.5 py-1 rounded whitespace-nowrap ${
                activeTab === 'admin-kyc' ? 'bg-slate-900 text-white' : 'bg-slate-100'
              }`}
            >
              KYC
            </button>
            <button
              onClick={() => setActiveTab('admin-ledger')}
              className={`px-2.5 py-1 rounded whitespace-nowrap ${
                activeTab === 'admin-ledger' ? 'bg-slate-900 text-white' : 'bg-slate-100'
              }`}
            >
              Ledger
            </button>
          </>
        )}
      </div>
    </header>
  );
}
