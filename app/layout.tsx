import type { Metadata } from 'next';
import { Banner, Head } from 'nextra/components';
import { getPageMap } from 'nextra/page-map';
import 'nextra-theme-docs/style.css';
import './globals.css';

export const metadata: Metadata = {
  title: {
    template: '%s | DocuDepth Docs',
    default: 'DocuDepth Documentation',
  },
  description: 'AI-generated documentation powered by DocuDepth',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head />
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
