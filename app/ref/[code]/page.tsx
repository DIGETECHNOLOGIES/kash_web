import { redirect } from 'next/navigation';

export default async function ReferralRedirectPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  redirect(`/register?referral_code=${encodeURIComponent(code)}`);
}
