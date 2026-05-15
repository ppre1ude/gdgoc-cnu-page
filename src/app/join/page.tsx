import { redirect } from 'next/navigation';

import { getLegacyJoinRedirectHref } from '@/domain/auth-flow';

export default function JoinPage() {
  redirect(getLegacyJoinRedirectHref());
}
