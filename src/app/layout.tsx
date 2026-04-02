import type { Metadata } from 'next';
import './globals.css';
import DashboardLayout from '@/components/DashboardLayout';

export const metadata: Metadata = {
  title: 'MAK Enterprises U.K.',
  description: 'Distributor Order Booking, Inventory, and Accounting System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <DashboardLayout>
          {children}
        </DashboardLayout>
      </body>
    </html>
  );
}
