import type { Metadata } from 'next';
import React from 'react';
import { Toaster } from 'react-hot-toast';
import Providers from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'MỘC — Cửa hàng Thời trang Hiện đại',
  description: 'Bộ sưu tập thời trang phong cách tối giản, hiện đại và tinh tế.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="min-h-full bg-slate-50 text-slate-800">
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                borderRadius: '12px',
                background: '#1e293b',
                color: '#f8fafc',
                fontSize: '14px',
                fontWeight: 500,
                boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.3)',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
