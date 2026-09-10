import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { auth } from '@/app/lib/auth/server';

export default async function LoginLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.getSession();

  if (session?.data) {
    redirect('/overview');
  }

  return <>{children}</>;
}
