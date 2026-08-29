import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Delete your Shettar account',
  description:
    'How to request deletion of your Shettar guest account, what data is removed, what may be retained, and how long we keep it.',
};

export default function DeleteAccountLayout({ children }: { children: React.ReactNode }) {
  return children;
}
