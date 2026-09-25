'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  Currency,
  UserRole,
  Invoice,
  ClientProfile,
  PaymentTransaction,
  JobListing,
  JobApplication,
  Contract,
  TaxRecord,
  Dispute,
  TaxDeduction,
} from './types';
import {
  INITIAL_INVOICES,
  INITIAL_CLIENTS,
  INITIAL_PAYMENTS,
  INITIAL_JOBS,
  INITIAL_APPLICATIONS,
  INITIAL_CONTRACTS,
  INITIAL_TAX_RECORD,
  INITIAL_DISPUTES,
  CURRENT_FREELANCER,
  CURRENT_CLIENT,
} from './initial-data';

interface FreelancePayContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  currency: Currency;
  setCurrency: (curr: Currency) => void;
  formatCurrency: (amount: number, targetCurrency?: Currency) => string;
  invoices: Invoice[];
  clients: ClientProfile[];
  payments: PaymentTransaction[];
  jobs: JobListing[];
  applications: JobApplication[];
  contracts: Contract[];
  taxRecord: TaxRecord;
  disputes: Dispute[];
  currentUser: typeof CURRENT_FREELANCER;
  currentClient: typeof CURRENT_CLIENT;
  // Invoice actions
  addInvoice: (invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'reminderSentCount'>) => Invoice;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  sendInvoice: (id: string) => void;
  sendReminder: (id: string) => void;
  payInvoice: (
    id: string,
    method: 'paystack' | 'card' | 'bank_transfer',
    payerName?: string
  ) => { success: boolean; reference: string };
  // Client actions
  addClient: (client: Omit<ClientProfile, 'id' | 'totalBilled' | 'reviewCount'>) => ClientProfile;
  // Job actions
  postJob: (
    jobData: Omit<JobListing, 'id' | 'createdAt' | 'applicationsCount' | 'status'>
  ) => JobListing;
  applyToJob: (jobId: string, proposalText: string, proposedRate: number, portfolioUrl?: string) => void;
  updateApplicationStatus: (applicationId: string, newStatus: 'shortlisted' | 'accepted' | 'rejected') => void;
  // Contract actions
  createContract: (contractData: Omit<Contract, 'id'>) => Contract;
  submitMilestone: (contractId: string, milestoneId: string, link: string, notes: string) => void;
  approveMilestone: (contractId: string, milestoneId: string) => void;
  signContract: (contractId: string, role: 'freelancer' | 'client', signature: string) => void;
  // Tax actions
  addTaxDeduction: (deduction: Omit<TaxDeduction, 'id'>) => void;
  removeTaxDeduction: (id: string) => void;
  setTaxCountry: (country: 'NG' | 'UK' | 'US') => void;
  // Dispute actions
  resolveDispute: (id: string, resolution: 'release_to_freelancer' | 'refund_to_client', notes: string) => void;
  resetAllData: () => void;
}

const STORAGE_KEYS = {
  ROLE: 'fp_user_role_v1',
  CURRENCY: 'fp_currency_v1',
  INVOICES: 'fp_invoices_v1',
  CLIENTS: 'fp_clients_v1',
  PAYMENTS: 'fp_payments_v1',
  JOBS: 'fp_jobs_v1',
  APPLICATIONS: 'fp_apps_v1',
  CONTRACTS: 'fp_contracts_v1',
  TAX_DEDUCTIONS: 'fp_tax_ded_v1',
  TAX_COUNTRY: 'fp_tax_country_v1',
  DISPUTES: 'fp_disputes_v1',
};

const FreelancePayContext = createContext<FreelancePayContextType | undefined>(undefined);

// Exchange rates relative to 1 NGN
const RATES_FROM_NGN: Record<Currency, number> = {
  NGN: 1,
  USD: 1 / 1550,
  GBP: 1 / 2020,
  EUR: 1 / 1720,
};

function getSavedItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

export function FreelancePayProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole>(() => {
    if (typeof window === 'undefined') return 'freelancer';
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ROLE);
      if (saved === 'freelancer' || saved === 'client' || saved === 'admin') return saved;
    } catch {}
    return 'freelancer';
  });

  const [currency, setCurrencyState] = useState<Currency>(() => {
    if (typeof window === 'undefined') return 'NGN';
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENCY);
      if (saved === 'NGN' || saved === 'USD' || saved === 'GBP' || saved === 'EUR') return saved;
    } catch {}
    return 'NGN';
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() =>
    getSavedItem(STORAGE_KEYS.INVOICES, INITIAL_INVOICES)
  );
  const [clients, setClients] = useState<ClientProfile[]>(() =>
    getSavedItem(STORAGE_KEYS.CLIENTS, INITIAL_CLIENTS)
  );
  const [payments, setPayments] = useState<PaymentTransaction[]>(() =>
    getSavedItem(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS)
  );
  const [jobs, setJobs] = useState<JobListing[]>(() =>
    getSavedItem(STORAGE_KEYS.JOBS, INITIAL_JOBS)
  );
  const [applications, setApplications] = useState<JobApplication[]>(() =>
    getSavedItem(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS)
  );
  const [contracts, setContracts] = useState<Contract[]>(() =>
    getSavedItem(STORAGE_KEYS.CONTRACTS, INITIAL_CONTRACTS)
  );
  const [taxCountry, setTaxCountryState] = useState<'NG' | 'UK' | 'US'>(() => {
    if (typeof window === 'undefined') return 'NG';
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TAX_COUNTRY);
      if (saved === 'NG' || saved === 'UK' || saved === 'US') return saved;
    } catch {}
    return 'NG';
  });
  const [taxDeductions, setTaxDeductions] = useState<TaxDeduction[]>(() =>
    getSavedItem(STORAGE_KEYS.TAX_DEDUCTIONS, INITIAL_TAX_RECORD.deductions)
  );
  const [disputes, setDisputes] = useState<Dispute[]>(() =>
    getSavedItem(STORAGE_KEYS.DISPUTES, INITIAL_DISPUTES)
  );

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ROLE, role);
      localStorage.setItem(STORAGE_KEYS.CURRENCY, currency);
      localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
      localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
      localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(applications));
      localStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(contracts));
      localStorage.setItem(STORAGE_KEYS.TAX_COUNTRY, taxCountry);
      localStorage.setItem(STORAGE_KEYS.TAX_DEDUCTIONS, JSON.stringify(taxDeductions));
      localStorage.setItem(STORAGE_KEYS.DISPUTES, JSON.stringify(disputes));
    } catch {
      // Storage quota or private browsing
    }
  }, [
    role,
    currency,
    invoices,
    clients,
    payments,
    jobs,
    applications,
    contracts,
    taxCountry,
    taxDeductions,
    disputes,
  ]);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
  };

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
  };

  // Convert and format currency amounts
  const formatCurrency = (amountInNGN: number, targetCurrency?: Currency): string => {
    const target = targetCurrency || currency;
    const rate = RATES_FROM_NGN[target];
    const converted = amountInNGN * rate;

    const symbols: Record<Currency, string> = {
      NGN: '₦',
      USD: '$',
      GBP: '£',
      EUR: '€',
    };

    const formattedNumber = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: target === 'NGN' ? 0 : 2,
      maximumFractionDigits: target === 'NGN' ? 0 : 2,
    }).format(converted);

    return `${symbols[target]}${formattedNumber}`;
  };

  // Pure derived state for Tax Record (zero useEffect cascading renders)
  const taxRecord: TaxRecord = useMemo(() => {
    const paidSum = invoices
      .filter((inv) => inv.status === 'paid')
      .reduce((acc, inv) => acc + inv.amount, 0);

    const totalDeductions = taxDeductions.reduce((acc, d) => acc + d.amount, 0);
    const taxable = Math.max(0, paidSum - totalDeductions);

    let estimatedTax = 0;
    let effectiveRate = 0;

    if (taxCountry === 'NG') {
      // Simplified flat 20% on net freelance profit
      estimatedTax = Math.round(taxable * 0.2);
      effectiveRate = paidSum > 0 ? (estimatedTax / paidSum) * 100 : 0;
    } else if (taxCountry === 'UK') {
      // Convert to GBP for brackets
      const gbpRate = RATES_FROM_NGN['GBP'];
      const taxableGBP = taxable * gbpRate;
      const allowance = 12570;
      let taxInGBP = 0;
      if (taxableGBP > allowance) {
        const excess = taxableGBP - allowance;
        taxInGBP = excess * 0.2; // 20% basic
      }
      estimatedTax = Math.round(taxInGBP / gbpRate);
      effectiveRate = paidSum > 0 ? (estimatedTax / paidSum) * 100 : 0;
    } else if (taxCountry === 'US') {
      // 15.3% Self-Employment tax + 10% base
      estimatedTax = Math.round(taxable * 0.253);
      effectiveRate = paidSum > 0 ? (estimatedTax / paidSum) * 100 : 0;
    }

    return {
      year: 2026,
      country: taxCountry,
      currency: 'NGN',
      grossIncome: paidSum,
      totalDeductions,
      taxableIncome: taxable,
      estimatedTax,
      effectiveRate: Math.round(effectiveRate * 10) / 10,
      deductions: taxDeductions,
    };
  }, [invoices, taxCountry, taxDeductions]);

  // Invoice Handlers
  const addInvoice = (invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'reminderSentCount'>): Invoice => {
    const uniqueId = 'inv-' + String(new Date().getTime());
    const newInvoice: Invoice = {
      ...invoiceData,
      id: uniqueId,
      createdAt: new Date().toISOString(),
      reminderSentCount: 0,
      processingFee: Math.round(invoiceData.amount * 0.015),
      netAmount: Math.round(invoiceData.amount * 0.985),
    };
    setInvoices((prev) => [newInvoice, ...prev]);
    return newInvoice;
  };

  const updateInvoice = (id: string, updates: Partial<Invoice>) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, ...updates } : inv))
    );
  };

  const deleteInvoice = (id: string) => {
    setInvoices((prev) => prev.filter((inv) => inv.id !== id));
  };

  const sendInvoice = (id: string) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === id
          ? {
              ...inv,
              status: inv.status === 'draft' ? 'sent' : inv.status,
              paymentUrl: `https://freelancepay.io/pay/${inv.id}`,
            }
          : inv
      )
    );
  };

  const sendReminder = (id: string) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === id
          ? {
              ...inv,
              reminderSentCount: (inv.reminderSentCount || 0) + 1,
              lastReminderDate: new Date().toISOString().split('T')[0],
            }
          : inv
      )
    );
  };

  const payInvoice = (
    id: string,
    method: 'paystack' | 'card' | 'bank_transfer',
    payerName?: string
  ) => {
    const targetInvoice = invoices.find((inv) => inv.id === id);
    if (!targetInvoice) return { success: false, reference: '' };

    const ref = `PSTK_${new Date().getTime()}`;
    const fee = Math.round(targetInvoice.amount * 0.015);
    const net = targetInvoice.amount - fee;

    // Update invoice status
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === id
          ? {
              ...inv,
              status: 'paid',
              paidAt: new Date().toISOString(),
              paystackReference: ref,
              processingFee: fee,
              netAmount: net,
            }
          : inv
      )
    );

    // Create payment transaction
    const newTx: PaymentTransaction = {
      id: `pay-${new Date().getTime()}`,
      invoiceId: targetInvoice.id,
      invoiceNumber: targetInvoice.invoiceNumber,
      freelancerId: targetInvoice.freelancerId,
      amount: targetInvoice.amount,
      currency: targetInvoice.currency,
      status: 'success',
      paymentMethod: method,
      processorReference: ref,
      processingFee: fee,
      netAmount: net,
      payoutStatus: 'paid',
      payoutDate: new Date().toISOString(),
      paidBy: payerName || targetInvoice.clientName,
      createdAt: new Date().toISOString(),
    };
    setPayments((prev) => [newTx, ...prev]);

    return { success: true, reference: ref };
  };

  // Client Handlers
  const addClient = (clientData: Omit<ClientProfile, 'id' | 'totalBilled' | 'reviewCount'>): ClientProfile => {
    const newClient: ClientProfile = {
      ...clientData,
      id: `cli-${new Date().getTime()}`,
      totalBilled: 0,
      reviewCount: 1,
      isVerified: true,
    };
    setClients((prev) => [newClient, ...prev]);
    return newClient;
  };

  // Job Handlers
  const postJob = (
    jobData: Omit<JobListing, 'id' | 'createdAt' | 'applicationsCount' | 'status'>
  ): JobListing => {
    const newJob: JobListing = {
      ...jobData,
      id: `job-${new Date().getTime()}`,
      createdAt: new Date().toISOString(),
      applicationsCount: 0,
      status: 'open',
    };
    setJobs((prev) => [newJob, ...prev]);
    return newJob;
  };

  const applyToJob = (
    jobId: string,
    proposalText: string,
    proposedRate: number,
    portfolioUrl?: string
  ) => {
    const targetJob = jobs.find((j) => j.id === jobId);
    if (!targetJob) return;

    const newApp: JobApplication = {
      id: `app-${new Date().getTime()}`,
      jobId,
      jobTitle: targetJob.title,
      freelancerId: CURRENT_FREELANCER.id,
      freelancerName: CURRENT_FREELANCER.name,
      freelancerEmail: CURRENT_FREELANCER.email,
      freelancerRating: CURRENT_FREELANCER.rating,
      proposalText,
      proposedRate,
      currency: targetJob.currency,
      portfolioUrl,
      status: 'applied',
      createdAt: new Date().toISOString(),
    };

    setApplications((prev) => [newApp, ...prev]);
    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId ? { ...j, applicationsCount: j.applicationsCount + 1 } : j
      )
    );
  };

  const updateApplicationStatus = (
    applicationId: string,
    newStatus: 'shortlisted' | 'accepted' | 'rejected'
  ) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === applicationId ? { ...app, status: newStatus } : app))
    );

    // If accepted, auto-generate a verified contract with 2 milestones (50/50 split)
    if (newStatus === 'accepted') {
      const app = applications.find((a) => a.id === applicationId);
      if (app) {
        const targetJob = jobs.find((j) => j.id === app.jobId);
        const upfrontAmount = Math.round(app.proposedRate * 0.5);
        const completionAmount = app.proposedRate - upfrontAmount;
        const nowTime = new Date().getTime();

        const newContract: Contract = {
          id: `con-${nowTime}`,
          jobId: app.jobId,
          title: app.jobTitle,
          freelancerId: app.freelancerId,
          freelancerName: app.freelancerName,
          clientId: targetJob?.clientId || CURRENT_CLIENT.id,
          clientName: targetJob?.clientName || CURRENT_CLIENT.name,
          templateType: 'development',
          totalAmount: app.proposedRate,
          currency: app.currency,
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
          revisionLimit: 2,
          revisionsUsed: 0,
          status: 'active',
          signedByFreelancer: true,
          signedByClient: true,
          freelancerSignature: app.freelancerName,
          clientSignature: targetJob?.clientName || CURRENT_CLIENT.name,
          signedAt: new Date().toISOString(),
          scopeSummary: `Accepted proposal for "${app.jobTitle}". Client escrow funds held in FreelancePay secure vault.`,
          legalTerms:
            'All intellectual property rights transfer to Client upon 100% final milestone approval and payout.',
          milestones: [
            {
              id: `ms-${nowTime}-1`,
              contractId: `con-${nowTime}`,
              title: 'Phase 1: Initial Architecture & Baseline Deliverable',
              description: '50% initial deliverable and design alignment verification.',
              amount: upfrontAmount,
              percentage: 50,
              dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
              status: 'in_progress',
            },
            {
              id: `ms-${nowTime}-2`,
              contractId: `con-${nowTime}`,
              title: 'Phase 2: Production Deployment & Final Sign-Off',
              description: 'Full code review, production launch, and project handover.',
              amount: completionAmount,
              percentage: 50,
              dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
              status: 'pending',
            },
          ],
        };

        setContracts((prev) => [newContract, ...prev]);
      }
    }
  };

  const createContract = (contractData: Omit<Contract, 'id'>): Contract => {
    const newContract: Contract = {
      ...contractData,
      id: `con-${new Date().getTime()}`,
    };
    setContracts((prev) => [newContract, ...prev]);
    return newContract;
  };

  const submitMilestone = (
    contractId: string,
    milestoneId: string,
    link: string,
    notes: string
  ) => {
    setContracts((prev) =>
      prev.map((c) => {
        if (c.id !== contractId) return c;
        return {
          ...c,
          milestones: c.milestones.map((m) =>
            m.id === milestoneId
              ? {
                  ...m,
                  status: 'submitted',
                  deliverableLink: link,
                  deliverableNotes: notes,
                  submittedAt: new Date().toISOString(),
                }
              : m
          ),
        };
      })
    );
  };

  const approveMilestone = (contractId: string, milestoneId: string) => {
    setContracts((prev) =>
      prev.map((c) => {
        if (c.id !== contractId) return c;
        const updatedMilestones = c.milestones.map((m) =>
          m.id === milestoneId
            ? {
                ...m,
                status: 'approved' as const,
                approvedAt: new Date().toISOString(),
              }
            : m
        );
        const allApproved = updatedMilestones.every((m) => m.status === 'approved');
        return {
          ...c,
          milestones: updatedMilestones,
          status: allApproved ? 'completed' : c.status,
        };
      })
    );
  };

  const signContract = (contractId: string, signerRole: 'freelancer' | 'client', signature: string) => {
    setContracts((prev) =>
      prev.map((c) => {
        if (c.id !== contractId) return c;
        const updates: Partial<Contract> = {};
        if (signerRole === 'freelancer') {
          updates.signedByFreelancer = true;
          updates.freelancerSignature = signature;
        } else {
          updates.signedByClient = true;
          updates.clientSignature = signature;
        }
        if (
          (signerRole === 'freelancer' && c.signedByClient) ||
          (signerRole === 'client' && c.signedByFreelancer)
        ) {
          updates.status = 'active';
          updates.signedAt = new Date().toISOString();
        }
        return { ...c, ...updates };
      })
    );
  };

  // Tax Handlers
  const addTaxDeduction = (deduction: Omit<TaxDeduction, 'id'>) => {
    const newDed: TaxDeduction = {
      ...deduction,
      id: `ded-${new Date().getTime()}`,
    };
    setTaxDeductions((prev) => [newDed, ...prev]);
  };

  const removeTaxDeduction = (id: string) => {
    setTaxDeductions((prev) => prev.filter((d) => d.id !== id));
  };

  const setTaxCountry = (country: 'NG' | 'UK' | 'US') => {
    setTaxCountryState(country);
  };

  // Dispute Handlers
  const resolveDispute = (
    id: string,
    resolution: 'release_to_freelancer' | 'refund_to_client',
    notes: string
  ) => {
    setDisputes((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              status: resolution === 'release_to_freelancer' ? 'resolved' : 'refunded',
              resolutionDetails: notes,
            }
          : d
      )
    );
  };

  const resetAllData = () => {
    setInvoices(INITIAL_INVOICES);
    setClients(INITIAL_CLIENTS);
    setPayments(INITIAL_PAYMENTS);
    setJobs(INITIAL_JOBS);
    setApplications(INITIAL_APPLICATIONS);
    setContracts(INITIAL_CONTRACTS);
    setTaxCountryState('NG');
    setTaxDeductions(INITIAL_TAX_RECORD.deductions);
    setDisputes(INITIAL_DISPUTES);
    try {
      localStorage.clear();
    } catch {}
  };

  return (
    <FreelancePayContext.Provider
      value={{
        role,
        setRole,
        currency,
        setCurrency,
        formatCurrency,
        invoices,
        clients,
        payments,
        jobs,
        applications,
        contracts,
        taxRecord,
        disputes,
        currentUser: CURRENT_FREELANCER,
        currentClient: CURRENT_CLIENT,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        sendInvoice,
        sendReminder,
        payInvoice,
        addClient,
        postJob,
        applyToJob,
        updateApplicationStatus,
        createContract,
        submitMilestone,
        approveMilestone,
        signContract,
        addTaxDeduction,
        removeTaxDeduction,
        setTaxCountry,
        resolveDispute,
        resetAllData,
      }}
    >
      {children}
    </FreelancePayContext.Provider>
  );
}

export function useFreelancePay() {
  const context = useContext(FreelancePayContext);
  if (!context) {
    throw new Error('useFreelancePay must be used within a FreelancePayProvider');
  }
  return context;
}
