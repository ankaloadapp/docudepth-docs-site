import type { Metadata } from 'next';
import { RootProvider } from 'fumadocs-ui/provider';
import './globals.css';

export const metadata: Metadata = {
  title: {
    template: '%s | DocuDepth Docs',
    default: 'DocuDepth Documentation',
  },
  description: 'AI-generated documentation powered by DocuDepth',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
