export type Currency = 'NGN' | 'USD' | 'GBP' | 'EUR';

export type UserRole = 'freelancer' | 'client' | 'admin';

export type PaymentHistoryStatus = 'early' | 'on_time' | 'late' | 'never';

export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled';

export type PaymentMethod = 'paystack' | 'stripe' | 'bank_transfer' | 'card';

export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded';

export type MilestoneStatus = 'pending' | 'in_progress' | 'submitted' | 'approved' | 'paid';

export type ContractStatus = 'draft' | 'sent' | 'signed' | 'active' | 'completed' | 'disputed';

export type ApplicationStatus = 'applied' | 'reviewed' | 'shortlisted' | 'accepted' | 'rejected';

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface ClientProfile {
  id: string;
  freelancerId: string;
  name: string;
  email: string;
  phone?: string;
  companyName: string;
  website?: string;
  rating: number;
  reviewCount: number;
  paymentHistory: PaymentHistoryStatus;
  notes?: string;
  totalBilled: number;
  isVerified?: boolean;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  freelancerId: string;
  freelancerName: string;
  freelancerEmail: string;
  freelancerBank: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientCompany?: string;
  amount: number;
  currency: Currency;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  paidAt?: string;
  description: string;
  lineItems: LineItem[];
  notes?: string;
  paystackReference?: string;
  paymentUrl?: string;
  processingFee?: number;
  netAmount?: number;
  reminderSentCount: number;
  lastReminderDate?: string;
  createdAt: string;
}

export interface PaymentTransaction {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  freelancerId: string;
  amount: number;
  currency: Currency;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  processorReference: string;
  processingFee: number;
  netAmount: number;
  payoutStatus: 'pending' | 'processing' | 'paid' | 'failed';
  payoutDate?: string;
  paidBy: string;
  createdAt: string;
}

export interface JobListing {
  id: string;
  clientId: string;
  clientName: string;
  clientCompany: string;
  clientVerified: boolean;
  clientRating: number;
  clientPaymentHistory: PaymentHistoryStatus;
  title: string;
  description: string;
  category: 'Engineering' | 'Design' | 'Writing' | 'Marketing' | 'Product' | 'Consulting';
  budgetMin: number;
  budgetMax: number;
  currency: Currency;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  requiredSkills: string[];
  experienceLevel: 'entry' | 'intermediate' | 'expert';
  timeline: string;
  applicationsCount: number;
  createdAt: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  freelancerId: string;
  freelancerName: string;
  freelancerEmail: string;
  freelancerRating: number;
  proposalText: string;
  proposedRate: number;
  currency: Currency;
  portfolioUrl?: string;
  status: ApplicationStatus;
  createdAt: string;
}

export interface ContractMilestone {
  id: string;
  contractId: string;
  title: string;
  description: string;
  amount: number;
  percentage: number;
  dueDate: string;
  status: MilestoneStatus;
  deliverableLink?: string;
  deliverableNotes?: string;
  submittedAt?: string;
  approvedAt?: string;
}

export interface Contract {
  id: string;
  jobId?: string;
  title: string;
  freelancerId: string;
  freelancerName: string;
  clientId: string;
  clientName: string;
  templateType: 'development' | 'design' | 'writing' | 'marketing' | 'consulting';
  totalAmount: number;
  currency: Currency;
  startDate: string;
  endDate: string;
  milestones: ContractMilestone[];
  revisionLimit: number;
  revisionsUsed: number;
  status: ContractStatus;
  signedByFreelancer: boolean;
  signedByClient: boolean;
  freelancerSignature?: string;
  clientSignature?: string;
  signedAt?: string;
  scopeSummary: string;
  legalTerms?: string;
}

export interface TaxDeduction {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
}

export interface TaxRecord {
  year: number;
  country: 'NG' | 'UK' | 'US';
  currency: Currency;
  grossIncome: number;
  totalDeductions: number;
  taxableIncome: number;
  estimatedTax: number;
  effectiveRate: number;
  deductions: TaxDeduction[];
}

export interface Dispute {
  id: string;
  contractId: string;
  contractTitle: string;
  freelancerId: string;
  freelancerName: string;
  clientId: string;
  clientName: string;
  amount: number;
  currency: Currency;
  reason: string;
  freelancerStatement: string;
  clientStatement: string;
  status: 'open' | 'under_review' | 'resolved' | 'refunded';
  resolutionDetails?: string;
  createdAt: string;
}
