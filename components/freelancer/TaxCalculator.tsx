'use client';

import React, { useState } from 'react';
import { useFreelancePay } from '@/lib/store';
import { Calculator, Plus, Trash2, Printer, Download, HelpCircle, FileText, CheckCircle2 } from 'lucide-react';

export function TaxCalculator() {
  const { taxRecord, addTaxDeduction, removeTaxDeduction, setTaxCountry, formatCurrency, invoices } =
    useFreelancePay();

  // Deductions Form State
  const [category, setCategory] = useState('Utilities & Internet');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [showExportModal, setShowExportModal] = useState(false);

  const handleAddDeduction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || Number(amount) <= 0) return;

    addTaxDeduction({
      category,
      description,
      amount: Number(amount),
      date: new Date().toISOString().split('T')[0],
    });

    setDescription('');
    setAmount('');
  };

  const paidInvoicesCount = invoices.filter((i) => i.status === 'paid').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Freelancer Tax Calculator & Compliance Engine
              </h2>
              <p className="text-xs text-slate-500">
                Auto-tracks income from paid invoices, applies deductible business expenses, and estimates liability.
              </p>
            </div>
          </div>
        </div>

        {/* Country & Year Jurisdiction Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setTaxCountry('NG')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                taxRecord.country === 'NG'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Nigeria (NRS/CIT)
            </button>
            <button
              onClick={() => setTaxCountry('UK')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                taxRecord.country === 'UK'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              United Kingdom (HMRC)
            </button>
            <button
              onClick={() => setTaxCountry('US')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                taxRecord.country === 'US'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              United States (IRS)
            </button>
          </div>

          <button
            onClick={() => setShowExportModal(true)}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
          >
            <FileText className="w-3.5 h-3.5 text-teal-400" />
            <span>Export Tax Summary</span>
          </button>
        </div>
      </div>

      {/* Tax Liability Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block mb-1">Total Gross Earnings</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {formatCurrency(taxRecord.grossIncome)}
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            Compiled from {paidInvoicesCount} settled invoices
          </span>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block mb-1">Allowable Deductions</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600">
            - {formatCurrency(taxRecord.totalDeductions)}
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            {taxRecord.deductions.length} recorded expense receipts
          </span>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block mb-1">Adjusted Taxable Income</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {formatCurrency(taxRecord.taxableIncome)}
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            Net assessable freelance profit
          </span>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs bg-gradient-to-br from-white to-teal-50/40">
          <span className="text-xs font-medium text-slate-500 block mb-1">
            Estimated Tax Due ({taxRecord.country})
          </span>
          <div className="text-2xl font-black font-mono tabular-nums text-teal-800">
            {formatCurrency(taxRecord.estimatedTax)}
          </div>
          <span className="text-[11px] text-teal-700 font-medium mt-2 block">
            Effective Rate: {taxRecord.effectiveRate}%
          </span>
        </div>
      </div>

      {/* Main Grid: Deductions Manager & Rules Explanation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Deductions Manager */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Business Expense Deductions</h3>
              <p className="text-xs text-slate-500">
                Legitimate expenses incurred wholly and exclusively for your freelance business reduce taxable income.
              </p>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-700">
              Total: {formatCurrency(taxRecord.totalDeductions)}
            </span>
          </div>

          {/* Add Deduction Form */}
          <form onSubmit={handleAddDeduction} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3 text-xs">
            <span className="font-semibold text-slate-800 block">Record New Allowable Expense:</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-teal-500"
              >
                <option value="Utilities & Internet">Utilities & Internet (Starlink/MTN)</option>
                <option value="Power & Fuel">Power & Generator Fuel / Solar</option>
                <option value="Software & Tools">Software, SaaS & AI Tools</option>
                <option value="Hardware & Gear">Hardware, Laptop & Office Gear</option>
                <option value="Workspace & Rent">Coworking Space & Home Office</option>
                <option value="Training & Education">Books, Courses & Conferences</option>
              </select>

              <input
                type="text"
                placeholder="Description (e.g. Starlink bill)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-teal-500 sm:col-span-1"
                required
              />

              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Amount (₦)"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono text-slate-800 focus:outline-none focus:border-teal-500"
                  required
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold rounded-lg shadow-xs flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          </form>

          {/* Deductions List Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3 text-center w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {taxRecord.deductions.map((ded) => (
                  <tr key={ded.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-mono text-slate-500 whitespace-nowrap">{ded.date}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-700">{ded.category}</td>
                    <td className="py-2.5 px-3 text-slate-600">{ded.description}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums text-slate-900">
                      {formatCurrency(ded.amount)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => removeTaxDeduction(ded.id)}
                        className="text-slate-400 hover:text-rose-600 cursor-pointer"
                        title="Delete deduction"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Country Jurisdiction Tax Rules Card */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-semibold text-slate-900">
              Tax Rules: {taxRecord.country === 'NG' ? 'Nigeria (Federal & State IRS)' : taxRecord.country === 'UK' ? 'United Kingdom (HMRC)' : 'United States (IRS & SE)'}
            </h3>
          </div>

          {taxRecord.country === 'NG' && (
            <div className="space-y-3 leading-relaxed">
              <p>
                In Nigeria, independent contractors and freelancers are assessed under Personal Income Tax (PIT) and Company Income Tax regulations depending on incorporation status.
              </p>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5 font-mono text-[11px]">
                <p><strong>Allowable Deductions:</strong> Wholly and exclusively incurred business tools, starlink internet, generator fuel for office hours, laptop depreciation.</p>
                <p><strong>Baseline Assessment:</strong> 20% effective flat rate on net assessable freelance income.</p>
                <p><strong>Withholding Tax (WHT):</strong> 5%–10% credit notes deductible from end-of-year tax.</p>
              </div>
              <p className="text-[11px] text-slate-400">
                Note: FreelancePay tax records are designed to be submitted directly to state tax boards (e.g., LIRS in Lagos, FIRS).
              </p>
            </div>
          )}

          {taxRecord.country === 'UK' && (
            <div className="space-y-3 leading-relaxed">
              <p>
                Sole traders in the United Kingdom are subject to Income Tax and Class 2/4 National Insurance contributions through HMRC Self Assessment.
              </p>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5 font-mono text-[11px]">
                <p><strong>Personal Allowance:</strong> £12,570 tax-free allowance.</p>
                <p><strong>Basic Rate:</strong> 20% on taxable income between £12,571 and £50,270.</p>
                <p><strong>Higher Rate:</strong> 40% on taxable income above £50,270.</p>
              </div>
            </div>
          )}

          {taxRecord.country === 'US' && (
            <div className="space-y-3 leading-relaxed">
              <p>
                Independent contractors (1099 workers) in the United States must file quarterly estimated federal income tax and Self-Employment Tax.
              </p>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5 font-mono text-[11px]">
                <p><strong>Self-Employment (SE) Tax:</strong> 15.3% (12.4% Social Security + 2.9% Medicare).</p>
                <p><strong>Federal Brackets:</strong> Progressive 10%–37% on net freelance profit.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Export Tax Summary Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6 animate-fade-in text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Freelance Tax Compliance Statement</h3>
                <p className="text-slate-500">Prepared by FreelancePay for Accounting & Tax Filing</p>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-slate-800">
              <div className="flex justify-between">
                <span>Taxpayer Name:</span>
                <span className="font-bold">Chinedu Okafor</span>
              </div>
              <div className="flex justify-between">
                <span>Tax Identification Number:</span>
                <span className="font-bold">TIN-98421038-NG</span>
              </div>
              <div className="flex justify-between">
                <span>Tax Assessment Year:</span>
                <span className="font-bold">{taxRecord.year}</span>
              </div>
              <div className="flex justify-between">
                <span>Jurisdiction:</span>
                <span className="font-bold">{taxRecord.country === 'NG' ? 'Nigeria (LIRS/FIRS)' : taxRecord.country}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between">
                <span>Gross Freelance Revenue:</span>
                <span className="font-bold">{formatCurrency(taxRecord.grossIncome)}</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Allowable Business Expenses:</span>
                <span className="font-bold">- {formatCurrency(taxRecord.totalDeductions)}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-slate-200 pt-2">
                <span>Net Assessable Profit:</span>
                <span>{formatCurrency(taxRecord.taxableIncome)}</span>
              </div>
              <div className="flex justify-between font-bold text-teal-800 border-t border-slate-200 pt-2 text-sm">
                <span>Estimated Tax Liability:</span>
                <span>{formatCurrency(taxRecord.estimatedTax)}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-lg font-semibold text-slate-700 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-teal-400 hover:bg-teal-300 text-slate-950 rounded-lg font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
