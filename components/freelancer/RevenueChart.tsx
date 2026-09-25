'use client';

import React, { useState } from 'react';
import { useFreelancePay } from '@/lib/store';
import { BarChart3, PieChart, ShieldCheck, Zap } from 'lucide-react';

export function RevenueChart() {
  const { invoices, formatCurrency } = useFreelancePay();
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  // 12 months revenue data (in NGN)
  const monthlyData = [
    { month: 'Oct', amount: 450000 },
    { month: 'Nov', amount: 620000 },
    { month: 'Dec', amount: 890000 },
    { month: 'Jan', amount: 720000 },
    { month: 'Feb', amount: 950000 },
    { month: 'Mar', amount: 1100000 },
    { month: 'Apr', amount: 850000 },
    { month: 'May', amount: 1300000 },
    { month: 'Jun', amount: 1450000 },
    { month: 'Jul', amount: 1600000 },
    { month: 'Aug', amount: 1750000 },
    { month: 'Sep', amount: 1800000 },
  ];

  const maxVal = Math.max(...monthlyData.map((d) => d.amount));
  const svgHeight = 160;
  const svgWidth = 560;

  // Build SVG path coordinates
  const points = monthlyData.map((d, index) => {
    const x = (index / (monthlyData.length - 1)) * (svgWidth - 40) + 20;
    const y = svgHeight - (d.amount / maxVal) * (svgHeight - 40) - 20;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight} L ${points[0].x} ${svgHeight} Z`;

  // Status breakdown calculations
  const totalInvoices = invoices.length;
  const paidCount = invoices.filter((i) => i.status === 'paid').length;
  const sentCount = invoices.filter((i) => i.status === 'sent' || i.status === 'viewed').length;
  const overdueCount = invoices.filter((i) => i.status === 'overdue').length;
  const draftCount = invoices.filter((i) => i.status === 'draft').length;

  const paidPercent = totalInvoices > 0 ? Math.round((paidCount / totalInvoices) * 100) : 0;
  const sentPercent = totalInvoices > 0 ? Math.round((sentCount / totalInvoices) * 100) : 0;
  const overduePercent = totalInvoices > 0 ? Math.round((overdueCount / totalInvoices) * 100) : 0;
  const draftPercent = totalInvoices > 0 ? 100 - (paidPercent + sentPercent + overduePercent) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chart: Earnings Over Time */}
      <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-teal-600" />
              <span>Earnings History (Last 12 Months)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified incoming payouts settled to Nigerian bank account via Paystack
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono tabular-nums text-slate-500">Peak Month:</span>
            <div className="text-sm font-bold font-mono tabular-nums text-slate-900">
              {formatCurrency(maxVal)}
            </div>
          </div>
        </div>

        {/* Responsive SVG Chart */}
        <div className="w-full overflow-hidden relative pt-2">
          {hoveredMonth !== null && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[11px] font-mono px-2.5 py-1 rounded shadow-md z-10">
              {monthlyData[hoveredMonth].month} 2026: {formatCurrency(monthlyData[hoveredMonth].amount)}
            </div>
          )}

          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-44 overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="tealGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00E5DF" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#00E5DF" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal guideline hairlines */}
            <line x1="20" y1={svgHeight - 20} x2={svgWidth - 20} y2={svgHeight - 20} stroke="#E2E8F0" strokeWidth="1" />
            <line x1="20" y1={svgHeight / 2} x2={svgWidth - 20} y2={svgHeight / 2} stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />

            {/* Area Fill */}
            <path d={areaD} fill="url(#tealGradient)" />

            {/* Line Stroke */}
            <path d={pathD} fill="none" stroke="#00B8B1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

            {/* Interactive Data Points */}
            {points.map((pt, i) => (
              <g
                key={i}
                onMouseEnter={() => setHoveredMonth(i)}
                onMouseLeave={() => setHoveredMonth(null)}
                className="cursor-pointer group"
              >
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={hoveredMonth === i ? 6 : 4}
                  fill={hoveredMonth === i ? '#0F172A' : '#008B84'}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  className="transition-all duration-150"
                />
              </g>
            ))}
          </svg>

          {/* Month Labels */}
          <div className="flex justify-between px-2 pt-2 text-[11px] text-slate-500 font-mono">
            {monthlyData.map((d, i) => (
              <span
                key={i}
                className={`${hoveredMonth === i ? 'text-slate-900 font-bold' : ''} transition-colors`}
              >
                {d.month}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Average Payout Velocity: <strong className="text-slate-700 font-mono">T+1 (24 hours)</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>On-Time Payment Rate: <strong className="text-slate-700 font-mono">92.4%</strong></span>
          </div>
        </div>
      </div>

      {/* Invoice Status Distribution */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-1">
            <PieChart className="w-4 h-4 text-slate-700" />
            <span>Invoice Health Breakdown</span>
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Distribution across {totalInvoices} active invoices
          </p>

          {/* Progress Segment Bar */}
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex mb-5">
            <div style={{ width: `${paidPercent}%` }} className="bg-emerald-500 transition-all duration-300" title={`Paid: ${paidPercent}%`} />
            <div style={{ width: `${sentPercent}%` }} className="bg-orange-400 transition-all duration-300" title={`Awaiting: ${sentPercent}%`} />
            <div style={{ width: `${overduePercent}%` }} className="bg-rose-500 transition-all duration-300" title={`Overdue: ${overduePercent}%`} />
            <div style={{ width: `${draftPercent}%` }} className="bg-slate-300 transition-all duration-300" title={`Draft: ${draftPercent}%`} />
          </div>

          {/* Breakdown Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-700 font-medium">Settled & Paid</span>
              </div>
              <span className="font-mono tabular-nums text-slate-900 font-semibold">
                {paidCount} ({paidPercent}%)
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                <span className="text-slate-700 font-medium">Awaiting Payment</span>
              </div>
              <span className="font-mono tabular-nums text-slate-900 font-semibold">
                {sentCount} ({sentPercent}%)
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="text-slate-700 font-medium">Past Due / Overdue</span>
              </div>
              <span className="font-mono tabular-nums text-rose-600 font-semibold">
                {overdueCount} ({overduePercent}%)
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                <span className="text-slate-700 font-medium">Draft Staged</span>
              </div>
              <span className="font-mono tabular-nums text-slate-500 font-semibold">
                {draftCount} ({draftPercent}%)
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 leading-relaxed">
          Invoices sent with FreelancePay are paid on average <strong className="text-slate-800">12 days faster</strong> than traditional PDF email attachments due to direct Paystack debit card and USSD checkout links.
        </div>
      </div>
    </div>
  );
}
