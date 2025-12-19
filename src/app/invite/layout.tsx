import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Venturo - 好友邀請',
  description: '來 Venturo 一起探索世界吧！',
  openGraph: {
    title: 'Venturo - 好友邀請',
    description: '來 Venturo 一起探索世界吧！',
    siteName: 'Venturo',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Venturo - 好友邀請',
    description: '來 Venturo 一起探索世界吧！',
  },
};

export default function InviteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
