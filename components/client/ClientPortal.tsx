'use client';

import React, { useState } from 'react';
import { useFreelancePay } from '@/lib/store';
import { JobListing, JobApplication, Contract, Invoice } from '@/lib/types';
import {
  Briefcase,
  Plus,
  Users,
  ShieldCheck,
  CheckCircle,
  X,
  CreditCard,
  ExternalLink,
  Clock,
  Send,
  Building,
  DollarSign,
  AlertCircle,
} from 'lucide-react';

interface ClientPortalProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenPaymentModal: (invoice: Invoice) => void;
}

export function ClientPortal({ activeTab, setActiveTab, onOpenPaymentModal }: ClientPortalProps) {
  const {
    jobs,
    postJob,
    applications,
    updateApplicationStatus,
    contracts,
    approveMilestone,
    invoices,
    formatCurrency,
    currentClient,
  } = useFreelancePay();

  // Create Job Modal State
  const [isPostingJob, setIsPostingJob] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [jobCategory, setJobCategory] = useState<'Engineering' | 'Design' | 'Writing' | 'Marketing' | 'Product' | 'Consulting'>('Engineering');
  const [budgetMin, setBudgetMin] = useState<number | ''>(500000);
  const [budgetMax, setBudgetMax] = useState<number | ''>(1000000);
  const [timeline, setTimeline] = useState('2-3 weeks');
  const [experienceLevel, setExperienceLevel] = useState<'entry' | 'intermediate' | 'expert'>('intermediate');
  const [skillsString, setSkillsString] = useState('React, TypeScript, Paystack API');
  const [description, setDescription] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handlePostJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle || !budgetMin || !budgetMax || !description) return;

    postJob({
      clientId: currentClient.id,
      clientName: currentClient.name,
      clientCompany: currentClient.company,
      clientVerified: currentClient.verified,
      clientRating: currentClient.rating,
      clientPaymentHistory: 'early',
      title: jobTitle,
      category: jobCategory,
      budgetMin: Number(budgetMin),
      budgetMax: Number(budgetMax),
      currency: 'NGN',
      requiredSkills: skillsString.split(',').map((s) => s.trim()).filter(Boolean),
      experienceLevel,
      timeline,
      description,
    });

    setIsPostingJob(false);
    setJobTitle('');
    setDescription('');
    showToast('Job listing published to verified talent network!');
  };

  const handleApproveApplicant = (app: JobApplication) => {
    updateApplicationStatus(app.id, 'accepted');
    showToast(`Hired ${app.freelancerName}! Milestone contract generated with escrow holdback.`);
  };

  const handleApproveMilestone = (contractId: string, milestoneId: string, amount: number) => {
    approveMilestone(contractId, milestoneId);
    showToast(`Approved deliverable! Escrow deposit of ${formatCurrency(amount)} released to freelancer.`);
  };

  // Client metrics
  const clientJobs = jobs;
  const totalApplications = applications.length;
  const activeContracts = contracts.filter((c) => c.status === 'active');
  const incomingInvoices = invoices.filter((inv) => inv.clientEmail === currentClient.email || inv.clientName === currentClient.name);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-slate-900 text-teal-300 text-xs px-4 py-2.5 rounded-lg flex items-center justify-between shadow-md animate-fade-in">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Client Mode Header */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">{currentClient.company}</h2>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  <ShieldCheck className="w-3 h-3 text-teal-600" />
                  <span>Verified Employer</span>
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Logged in as {currentClient.name} ({currentClient.email})
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsPostingJob(true)}
          className="px-4 py-2 bg-teal-400 hover:bg-teal-300 text-slate-950 text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Job</span>
        </button>
      </div>

      {/* Client Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block mb-1">Active Job Listings</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {clientJobs.length}
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">Receiving qualified bids</span>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block mb-1">Applications Received</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {totalApplications}
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">Vetted talent proposals</span>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block mb-1">Active Escrow Contracts</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {activeContracts.length}
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">Funds secured in escrow</span>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block mb-1">Lifetime Volume Settled</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-teal-800">
            {formatCurrency(currentClient.totalSpent)}
          </div>
          <span className="text-[11px] text-teal-700 font-semibold mt-2 block">100% On-Time Payout Score</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit text-xs">
        <button
          onClick={() => setActiveTab('client-overview')}
          className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
            activeTab === 'client-overview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Overview & Hired Contracts
        </button>
        <button
          onClick={() => setActiveTab('client-jobs')}
          className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
            activeTab === 'client-jobs' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          My Posted Jobs ({clientJobs.length})
        </button>
        <button
          onClick={() => setActiveTab('client-applicants')}
          className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
            activeTab === 'client-applicants' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Review Proposals ({applications.length})
        </button>
        <button
          onClick={() => setActiveTab('client-escrow')}
          className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
            activeTab === 'client-escrow' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Escrow & Approvals
        </button>
      </div>

      {/* TAB CONTENT */}

      {/* Overview & Hired Contracts */}
      {activeTab === 'client-overview' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Active Talent Contracts in Progress</h3>
            <div className="space-y-3">
              {contracts.map((con) => (
                <div key={con.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{con.title}</h4>
                      <p className="text-slate-500 text-[11px]">Hired Freelancer: {con.freelancerName}</p>
                    </div>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {formatCurrency(con.totalAmount, con.currency)}
                    </span>
                  </div>

                  {/* Milestones list with approve button */}
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    {con.milestones.map((ms) => (
                      <div key={ms.id} className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
                        <div>
                          <span className="font-bold text-slate-800">{ms.title}</span>
                          <span className="text-slate-400 text-[11px] ml-2">({formatCurrency(ms.amount, con.currency)})</span>
                          {ms.deliverableLink && (
                            <p className="text-[11px] text-teal-700 underline mt-0.5">
                              <a href={ms.deliverableLink} target="_blank" rel="noreferrer">
                                Submitted Work: {ms.deliverableLink}
                              </a>
                            </p>
                          )}
                        </div>

                        {ms.status === 'approved' ? (
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Approved & Released
                          </span>
                        ) : ms.status === 'submitted' ? (
                          <button
                            onClick={() => handleApproveMilestone(con.id, ms.id, ms.amount)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-md shadow-xs transition-colors cursor-pointer text-[11px]"
                          >
                            Approve & Release Funds
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">In Progress by Freelancer</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Review Proposals Tab */}
      {activeTab === 'client-applicants' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 font-semibold text-xs text-slate-700">
            Candidate Proposals for Review
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            {applications.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No applications received yet.</div>
            ) : (
              applications.map((app) => (
                <div key={app.id} className="p-5 hover:bg-slate-50/60 transition-colors space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{app.freelancerName}</span>
                        <span className="text-slate-400">({app.freelancerEmail})</span>
                        <span className="text-amber-600 font-semibold">★ {app.freelancerRating}</span>
                      </div>
                      <p className="text-slate-500 text-[11px]">Applied for: <strong className="text-slate-700">{app.jobTitle}</strong></p>
                    </div>

                    <div className="sm:text-right shrink-0">
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {formatCurrency(app.proposedRate, app.currency)}
                      </span>
                      <div className="text-[11px] text-slate-400">Proposed Rate</div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-700 leading-relaxed font-sans text-xs whitespace-pre-line">
                    {app.proposalText}
                  </div>

                  {app.portfolioUrl && (
                    <div className="text-xs text-teal-700">
                      Portfolio / GitHub:{' '}
                      <a href={app.portfolioUrl} target="_blank" rel="noreferrer" className="underline font-mono">
                        {app.portfolioUrl}
                      </a>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    {app.status === 'accepted' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded border border-emerald-200">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Accepted · Contract Active</span>
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => updateApplicationStatus(app.id, 'shortlisted')}
                          className="px-3 py-1.5 border border-slate-300 hover:bg-slate-100 rounded-lg text-slate-700 font-semibold cursor-pointer"
                        >
                          Shortlist
                        </button>
                        <button
                          onClick={() => handleApproveApplicant(app)}
                          className="px-3.5 py-1.5 bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold rounded-lg shadow-xs cursor-pointer flex items-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Accept & Create Escrow Contract</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Escrow & Milestones Tab */}
      {activeTab === 'client-escrow' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3 text-xs">
            <h3 className="text-sm font-bold text-slate-900">Escrow Vault Security</h3>
            <p className="text-slate-600 leading-relaxed">
              When you hire on FreelancePay, your funds are securely held in trust. Freelancers only receive milestone payouts once you inspect the deliverables and click &quot;Approve Deliverable&quot;.
            </p>
          </div>

          <div className="space-y-3">
            {contracts.map((con) => (
              <div key={con.id} className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="font-bold text-slate-900">{con.title}</h4>
                    <span className="text-slate-500 text-[11px]">Assigned to {con.freelancerName}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">{formatCurrency(con.totalAmount, con.currency)}</span>
                </div>

                <div className="space-y-2">
                  {con.milestones.map((ms) => (
                    <div key={ms.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div>
                        <span className="font-semibold text-slate-800">{ms.title}</span>
                        <p className="text-slate-500 text-[11px]">{ms.description}</p>
                        {ms.deliverableLink && (
                          <div className="text-teal-700 underline text-[11px] mt-1">
                            <a href={ms.deliverableLink} target="_blank" rel="noreferrer">
                              Inspect Handover Link: {ms.deliverableLink}
                            </a>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-slate-900">{formatCurrency(ms.amount, con.currency)}</span>
                        {ms.status === 'submitted' ? (
                          <button
                            onClick={() => handleApproveMilestone(con.id, ms.id, ms.amount)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-xs transition-colors cursor-pointer text-xs"
                          >
                            Release Escrow ({formatCurrency(ms.amount, con.currency)})
                          </button>
                        ) : ms.status === 'approved' ? (
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                            Released
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">Awaiting Submission</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Post New Job Modal */}
      {isPostingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-fade-in text-xs">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Post New Freelance Job</h3>
              <button onClick={() => setIsPostingJob(false)} className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePostJob} className="p-6 space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Job Headline / Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Next.js 15 Architect for Escrow & Payment Engine"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={jobCategory}
                    onChange={(e) => setJobCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500 cursor-pointer"
                  >
                    <option value="Engineering">Engineering & Web Dev</option>
                    <option value="Design">Product & UI/UX Design</option>
                    <option value="Writing">Technical Writing & Content</option>
                    <option value="Marketing">Growth & Digital Marketing</option>
                    <option value="Product">Product Management</option>
                    <option value="Consulting">Strategy & Consulting</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expected Timeline</label>
                  <input
                    type="text"
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    placeholder="e.g. 2-3 weeks"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min Budget (₦)</label>
                  <input
                    type="number"
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900 focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Budget (₦)</label>
                  <input
                    type="number"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900 focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Required Skills (Comma separated)</label>
                <input
                  type="text"
                  value={skillsString}
                  onChange={(e) => setSkillsString(e.target.value)}
                  placeholder="React, Next.js, TypeScript, Tailwind"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Detailed Scope & Requirements *</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain deliverables, APIs to connect, and requirements..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500 resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPostingJob(false)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-lg font-medium text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold rounded-lg shadow-xs cursor-pointer"
                >
                  Publish Job to Vetted Freelancers
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
