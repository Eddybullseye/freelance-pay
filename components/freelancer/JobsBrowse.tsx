'use client';

import React, { useState } from 'react';
import { useFreelancePay } from '@/lib/store';
import { JobListing } from '@/lib/types';
import {
  Briefcase,
  Search,
  ShieldCheck,
  Star,
  CheckCircle,
  Clock,
  ArrowRight,
  Send,
  X,
  FileCheck,
  ExternalLink,
} from 'lucide-react';

export function JobsBrowse() {
  const { jobs, applications, applyToJob, formatCurrency } = useFreelancePay();

  const [activeTab, setActiveTab] = useState<'browse' | 'my-applications'>('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);

  // Proposal modal state
  const [isApplying, setIsApplying] = useState(false);
  const [proposalJob, setProposalJob] = useState<JobListing | null>(null);
  const [proposedRate, setProposedRate] = useState<number | ''>('');
  const [proposalPitch, setProposalPitch] = useState('');
  const [portfolioLink, setPortfolioLink] = useState('https://github.com/chinedu-dev');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.requiredSkills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || job.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenProposal = (job: JobListing) => {
    setProposalJob(job);
    setProposedRate(job.budgetMax || job.budgetMin);
    setProposalPitch(
      `Hello ${job.clientName},\n\nI reviewed your project specifications for "${job.title}". As a verified senior engineer on FreelancePay with 38+ completed projects and 4.95 rating, I can deliver this cleanly with tests within ${job.timeline}. Let's collaborate through FreelancePay Escrow.`
    );
    setIsApplying(true);
  };

  const handleSubmitProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposalJob || !proposedRate || !proposalPitch) return;

    applyToJob(proposalJob.id, proposalPitch, Number(proposedRate), portfolioLink);
    setIsApplying(false);
    showToast(`Proposal submitted successfully to ${proposalJob.clientCompany || proposalJob.clientName}!`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="bg-slate-900 text-teal-300 text-xs px-4 py-2.5 rounded-lg flex items-center justify-between animate-fade-in shadow-md">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Vetted Client Job Board & Marketplace
              </h2>
              <p className="text-xs text-slate-500">
                High-paying gigs with guaranteed escrow fund deposits and two-way verified client ratings.
              </p>
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
              activeTab === 'browse'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Explore Jobs ({jobs.length})
          </button>
          <button
            onClick={() => setActiveTab('my-applications')}
            className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
              activeTab === 'my-applications'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Submitted Proposals ({applications.length})
          </button>
        </div>
      </div>

      {activeTab === 'browse' ? (
        <div className="space-y-4">
          {/* Search & Category Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search jobs by title, skills (e.g. Next.js, Figma, Technical Writing)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto text-xs font-medium text-slate-600">
              {['all', 'Engineering', 'Design', 'Writing'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'border-teal-500 bg-teal-50 text-teal-900 font-bold'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {cat === 'all' ? 'All Roles' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Job Listings Grid */}
          <div className="grid grid-cols-1 gap-4">
            {filteredJobs.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center border border-slate-200 text-slate-500 text-xs">
                No jobs match your search parameters. Try broadening your keywords.
              </div>
            ) : (
              filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-teal-400 transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        <span className="font-semibold text-slate-900 text-sm hover:text-teal-700 transition-colors">
                          {job.title}
                        </span>
                        {/* Safe Client Badge */}
                        {job.clientVerified && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                            <ShieldCheck className="w-3 h-3 text-teal-600" />
                            <span>Safe Client</span>
                          </span>
                        )}
                      </div>

                      {/* Client Meta (Unboxed text with middot separators) */}
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="font-medium text-slate-700">{job.clientCompany || job.clientName}</span>
                        <span>·</span>
                        <span className="flex items-center gap-0.5 text-amber-600 font-semibold">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          <span>{job.clientRating}</span>
                        </span>
                        <span>·</span>
                        <span>History: {job.clientPaymentHistory === 'early' ? 'Always pays early' : 'On-time payer'}</span>
                        <span>·</span>
                        <span>Posted {job.createdAt.split('T')[0]}</span>
                      </div>
                    </div>

                    {/* Budget & Timeline */}
                    <div className="sm:text-right shrink-0">
                      <div className="text-base font-bold font-mono tabular-nums text-slate-900">
                        {formatCurrency(job.budgetMin, job.currency)} - {formatCurrency(job.budgetMax, job.currency)}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 sm:justify-end mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Timeline: {job.timeline}</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {job.description}
                  </p>

                  {/* Required Skills & Apply Button */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] text-slate-400 font-medium">Skills:</span>
                      {job.requiredSkills.map((skill) => (
                        <span
                          key={skill}
                          className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => handleOpenProposal(job)}
                      className="px-4 py-2 bg-teal-400 hover:bg-teal-300 text-slate-950 text-xs font-bold rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <span>Submit Proposal</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* My Applications Tab */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700">
            Tracked Proposals & Pitch Status
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            {applications.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                You have not submitted any proposals yet.
              </div>
            ) : (
              applications.map((app) => (
                <div key={app.id} className="p-5 hover:bg-slate-50/60 transition-colors space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{app.jobTitle}</h4>
                      <p className="text-slate-500 text-[11px]">Submitted {app.createdAt.split('T')[0]}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-slate-900">
                        {formatCurrency(app.proposedRate, app.currency)}
                      </span>
                      <div className="mt-1">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                          app.status === 'accepted'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : app.status === 'shortlisted'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg text-slate-700 whitespace-pre-line leading-relaxed font-sans text-xs">
                    {app.proposalText}
                  </div>
                  {app.status === 'accepted' && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold pt-1">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span>Client approved your proposal! Active Escrow Contract created in Contracts & Escrow view.</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Submit Proposal Modal */}
      {isApplying && proposalJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-fade-in text-xs">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Submit Proposal</h3>
                <p className="text-[11px] text-slate-500">{proposalJob.title}</p>
              </div>
              <button
                onClick={() => setIsApplying(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitProposal} className="p-6 space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Proposed Total Rate ({proposalJob.currency})
                </label>
                <input
                  type="number"
                  value={proposedRate}
                  onChange={(e) => setProposedRate(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white"
                  required
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Client posted budget range: {formatCurrency(proposalJob.budgetMin, proposalJob.currency)} – {formatCurrency(proposalJob.budgetMax, proposalJob.currency)}
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Portfolio / GitHub / Case Study URL
                </label>
                <input
                  type="url"
                  value={portfolioLink}
                  onChange={(e) => setPortfolioLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Proposal Pitch & Deliverable Plan
                </label>
                <textarea
                  rows={6}
                  value={proposalPitch}
                  onChange={(e) => setProposalPitch(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white resize-none leading-relaxed font-sans"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsApplying(false)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-lg font-medium text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Proposal</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
