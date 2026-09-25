import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'FreelancePay - All-in-One Freelancer FinTech Platform',
  description:
    'All-in-one financial platform for freelancers: auto-invoicing, Paystack payment processing, verified client job board, multi-jurisdiction tax calculator, and AI contract management.',
  openGraph: {
    title: 'FreelancePay - All-in-One Freelancer FinTech Platform',
    description:
      'All-in-one financial platform for freelancers: auto-invoicing, Paystack payment processing, verified client job board, multi-jurisdiction tax calculator, and AI contract management.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FreelancePay - All-in-One Freelancer FinTech Platform',
    description:
      'All-in-one financial platform for freelancers: auto-invoicing, Paystack payment processing, verified client job board, multi-jurisdiction tax calculator, and AI contract management.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
