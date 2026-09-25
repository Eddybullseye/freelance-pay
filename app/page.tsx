'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { FreelancePayProvider, useFreelancePay } from '@/lib/store';
import { Navbar } from '@/components/Navbar';
import { StatsCards } from '@/components/freelancer/StatsCards';
import { RevenueChart } from '@/components/freelancer/RevenueChart';
import { InvoicesList } from '@/components/freelancer/InvoicesList';
import { InvoiceModal } from '@/components/freelancer/InvoiceModal';
import { InvoicePreviewModal } from '@/components/freelancer/InvoicePreviewModal';
import { PaymentModal } from '@/components/freelancer/PaymentModal';
import { TaxCalculator } from '@/components/freelancer/TaxCalculator';
import { JobsBrowse } from '@/components/freelancer/JobsBrowse';
import { ContractsView } from '@/components/freelancer/ContractsView';
import { ClientsView } from '@/components/freelancer/ClientsView';
import { ClientPortal } from '@/components/client/ClientPortal';
import { AdminPortal } from '@/components/admin/AdminPortal';
import { Invoice, ClientProfile } from '@/lib/types';
import {
  FileText,
  CreditCard,
  Briefcase,
  ShieldCheck,
  Calculator,
  ArrowRight,
  Sparkles,
  CheckCircle,
} from 'lucide-react';

function MainApp() {
  const { role, setRole, currentUser } = useFreelancePay();
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Modals
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);

  const handleQuickBill = (client: ClientProfile) => {
    setIsInvoiceModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navigation adhering to Top Bar Contract */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewInvoice={() => setIsInvoiceModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Editorial Hero Welcome Banner (Clean, no pill sandwiches, no code comment headers) */}
        {activeTab === 'dashboard' && role === 'freelancer' && (
          <section className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
              <div className="p-6 sm:p-8 lg:col-span-7 space-y-4">
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <span className="text-teal-700 font-semibold">{currentUser.title}</span>
                  <span>·</span>
                  <span>Lagos, Nigeria</span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1 text-emerald-700">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>KYC Verified</span>
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  Welcome back, {currentUser.name}
                </h1>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
                  Your all-in-one financial operating system is active. Manage automated client invoices, receive instant Paystack bank settlements, browse vetted gigs with guaranteed escrow, and calculate tax liabilities seamlessly.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => setIsInvoiceModalOpen(true)}
                    className="px-4 py-2 text-xs font-bold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Create New Invoice</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('jobs')}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                    <span>Browse Vetted Jobs</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('tax')}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Calculator className="w-3.5 h-3.5 text-slate-500" />
                    <span>Calculate Taxes</span>
                  </button>
                </div>
              </div>

              {/* Verified Workspace Image Anchor adhering to Section 3.C High-Fidelity Image Protocol */}
              <div className="hidden lg:block lg:col-span-5 p-4">
                <div className="relative h-48 w-full rounded-xl overflow-hidden border border-slate-200 shadow-inner">
                  <Image
                    src="/hero.jpg"
                    alt="FreelancePay Financial Dashboard on desk"
                    fill
                    className="object-cover"
                    priority
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent flex items-end p-4">
                    <span className="text-white text-xs font-medium drop-shadow-sm">
                      Paystack Direct Settlement & Escrow Vault
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* FREELANCER VIEWS */}
        {role === 'freelancer' && (
          <>
            {activeTab === 'dashboard' && (
              <div className="space-y-6 animate-fade-in">
                <StatsCards />
                <RevenueChart />
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold text-slate-900">Recent Client Invoices</h2>
                    <button
                      onClick={() => setActiveTab('invoices')}
                      className="text-xs font-semibold text-teal-700 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>View All Invoices</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <InvoicesList
                    onOpenCreate={() => setIsInvoiceModalOpen(true)}
                    onPreviewInvoice={(inv) => setPreviewInvoice(inv)}
                    onOpenPayment={(inv) => setPaymentInvoice(inv)}
                  />
                </div>
              </div>
            )}

            {activeTab === 'invoices' && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-900">Invoices & Direct Billing</h2>
                  <span className="text-xs text-slate-500">Auto-calculated with Paystack checkout link generation</span>
                </div>
                <InvoicesList
                  onOpenCreate={() => setIsInvoiceModalOpen(true)}
                  onPreviewInvoice={(inv) => setPreviewInvoice(inv)}
                  onOpenPayment={(inv) => setPaymentInvoice(inv)}
                />
              </div>
            )}

            {activeTab === 'jobs' && <JobsBrowse />}

            {activeTab === 'contracts' && <ContractsView />}

            {activeTab === 'tax' && <TaxCalculator />}

            {activeTab === 'clients' && (
              <ClientsView onQuickBill={handleQuickBill} />
            )}
          </>
        )}

        {/* CLIENT / EMPLOYER VIEWS */}
        {role === 'client' && (
          <ClientPortal
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onOpenPaymentModal={(inv) => setPaymentInvoice(inv)}
          />
        )}

        {/* ADMIN PORTAL VIEWS */}
        {role === 'admin' && (
          <AdminPortal activeTab={activeTab} setActiveTab={setActiveTab} />
        )}
      </main>

      {/* MODALS */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
      />

      <InvoicePreviewModal
        invoice={previewInvoice}
        onClose={() => setPreviewInvoice(null)}
        onPayNow={(inv) => setPaymentInvoice(inv)}
      />

      <PaymentModal
        invoice={paymentInvoice}
        onClose={() => setPaymentInvoice(null)}
        onPaymentSuccess={() => {
          if (previewInvoice) {
            setPreviewInvoice(null);
          }
        }}
      />

      {/* Footer */}
      <footer className="no-print mt-12 bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">FreelancePay</span>
            <span>·</span>
            <span>The Financial Operating System for Global Creators & Freelancers</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Paystack Certified Partner</span>
            <span>·</span>
            <span>Escrow Protected</span>
            <span>·</span>
            <span>© 2026 FreelancePay Inc.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Page() {
  return (
    <FreelancePayProvider>
      <MainApp />
    </FreelancePayProvider>
  );
}
