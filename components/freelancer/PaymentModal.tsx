'use client';

import React, { useState } from 'react';
import { Invoice } from '@/lib/types';
import { useFreelancePay } from '@/lib/store';
import { X, CreditCard, Building, Smartphone, CheckCircle, ShieldCheck, Loader2 } from 'lucide-react';

interface PaymentModalProps {
  invoice: Invoice | null;
  onClose: () => void;
  onPaymentSuccess?: () => void;
}

export function PaymentModal({ invoice, onClose, onPaymentSuccess }: PaymentModalProps) {
  const { payInvoice, formatCurrency } = useFreelancePay();

  const [paymentChannel, setPaymentChannel] = useState<'card' | 'bank_transfer' | 'ussd'>('card');
  const [cardNumber, setCardNumber] = useState('5399 4100 8821 9024');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('781');
  const [payerName, setPayerName] = useState(invoice?.clientName || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [txReference, setTxReference] = useState('');

  if (!invoice) return null;

  const handleProcessPayment = () => {
    setIsProcessing(true);

    setTimeout(() => {
      const result = payInvoice(
        invoice.id,
        paymentChannel === 'card' ? 'card' : paymentChannel === 'bank_transfer' ? 'bank_transfer' : 'paystack',
        payerName || invoice.clientName
      );

      setIsProcessing(false);
      if (result.success) {
        setIsSuccess(true);
        setTxReference(result.reference);
        if (onPaymentSuccess) onPaymentSuccess();
      }
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-fade-in">
        {/* Paystack Branded Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-teal-400 text-slate-950 font-bold flex items-center justify-center text-xs">
              PS
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-teal-400 block font-semibold">
                Secured by Paystack
              </span>
              <p className="text-sm font-semibold text-slate-100">{invoice.freelancerName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {!isSuccess ? (
          <div className="p-6 space-y-5 text-xs text-slate-700">
            {/* Amount Banner */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-center">
              <span className="text-slate-500 font-medium block mb-1">Total Payment Due</span>
              <div className="text-2xl font-black font-mono tabular-nums text-slate-900">
                {formatCurrency(invoice.amount, invoice.currency)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Invoice {invoice.invoiceNumber} · {invoice.clientCompany || invoice.clientName}
              </p>
            </div>

            {/* Payment Channel Tabs */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentChannel('card')}
                className={`py-2 px-3 rounded-lg border text-center font-medium transition-colors flex flex-col items-center gap-1 cursor-pointer ${
                  paymentChannel === 'card'
                    ? 'border-teal-500 bg-teal-50 text-teal-900 font-bold shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Card</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentChannel('bank_transfer')}
                className={`py-2 px-3 rounded-lg border text-center font-medium transition-colors flex flex-col items-center gap-1 cursor-pointer ${
                  paymentChannel === 'bank_transfer'
                    ? 'border-teal-500 bg-teal-50 text-teal-900 font-bold shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Building className="w-4 h-4" />
                <span>Transfer</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentChannel('ussd')}
                className={`py-2 px-3 rounded-lg border text-center font-medium transition-colors flex flex-col items-center gap-1 cursor-pointer ${
                  paymentChannel === 'ussd'
                    ? 'border-teal-500 bg-teal-50 text-teal-900 font-bold shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>USSD</span>
              </button>
            </div>

            {/* Channel-Specific Form Inputs */}
            {paymentChannel === 'card' && (
              <div className="space-y-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cardholder Name</label>
                  <input
                    type="text"
                    value={payerName}
                    onChange={(e) => setPayerName(e.target.value)}
                    placeholder="Full Name on Card"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white text-center"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">CVV</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white text-center"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentChannel === 'bank_transfer' && (
              <div className="p-4 bg-teal-50/60 rounded-xl border border-teal-200 space-y-2">
                <span className="font-semibold text-teal-950 block">Pay via Dedicated Virtual Account:</span>
                <p className="text-slate-600">Transfer exact invoice amount to this single-use Paystack checkout account:</p>
                <div className="bg-white p-3 rounded-lg border border-teal-200 font-mono space-y-1">
                  <p>Bank: <strong className="text-slate-900">Wema Bank / Paystack</strong></p>
                  <p>Account Number: <strong className="text-teal-700 text-sm">9928174019</strong></p>
                  <p>Beneficiary: <strong className="text-slate-900">FreelancePay - {invoice.freelancerName}</strong></p>
                </div>
                <p className="text-[11px] text-slate-400">Funds verify automatically within 60 seconds.</p>
              </div>
            )}

            {paymentChannel === 'ussd' && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-semibold text-slate-900 block">Dial USSD Code on your mobile phone:</span>
                <div className="bg-white p-3 rounded-lg border border-slate-200 font-mono text-center">
                  <span className="text-sm font-bold text-teal-700">*737*50*850000*9901#</span>
                </div>
                <p className="text-[11px] text-slate-500 text-center">Supported: GTBank, Zenith, Access, UBA, FirstBank</p>
              </div>
            )}

            {/* Security note */}
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span>PCI-DSS Level 1 Certified. Your financial information is encrypted.</span>
            </div>

            {/* Pay Button */}
            <button
              onClick={handleProcessPayment}
              disabled={isProcessing}
              className="w-full py-3 px-4 bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Contacting Paystack Gateway...</span>
                </>
              ) : (
                <span>Pay {formatCurrency(invoice.amount, invoice.currency)}</span>
              )}
            </button>
          </div>
        ) : (
          /* Payment Success State */
          <div className="p-8 text-center space-y-4 animate-fade-in text-xs">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Payment Confirmed!</h3>
              <p className="text-slate-500 mt-1">
                Transaction processed successfully. Invoice status has been updated to <strong>Paid</strong>.
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-left font-mono text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Paid:</span>
                <span className="font-bold text-slate-900">{formatCurrency(invoice.amount, invoice.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Processor Reference:</span>
                <span className="text-teal-700 font-semibold">{txReference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Settlement Account:</span>
                <span className="text-slate-700">Access Bank (0129482019)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Net Freelancer Payout:</span>
                <span className="font-bold text-emerald-700">{formatCurrency(invoice.netAmount || invoice.amount * 0.985, invoice.currency)}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Done & Return to Invoices
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
