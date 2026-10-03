import type { Metadata } from 'next';
import React from 'react';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import Providers from './providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'MỘC Studio — Cửa hàng Thời trang & Phong cách sống',
  description: 'Khám phá bộ sưu tập thời trang tối giản, tinh tế và cao cấp thiết kế cho cuộc sống hiện đại.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`h-full antialiased ${inter.variable}`}>
      <body className="min-h-full bg-[#F8F8F6] text-[#171717] font-sans antialiased">
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                borderRadius: '12px',
                background: '#171717',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 500,
                border: '1px solid #2B2B2B',
                boxShadow: '0 12px 30px -6px rgba(0, 0, 0, 0.25)',
                padding: '12px 18px',
              },
              success: {
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#FFFFFF',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#FFFFFF',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
