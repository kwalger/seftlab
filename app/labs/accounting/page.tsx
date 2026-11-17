import type { Metadata } from 'next';
import { AccountingLabClient } from '@/components/labs/accounting/accounting-lab-client';

export const metadata: Metadata = {
  title: 'مختبر المحاسبة المالية',
  description:
    'مختبر تفاعلي تطبيقي لمبادئ المحاسبة المالية بالدينار الأردني: منشئ القيود اليومية، حسابات الأستاذ، ومعادلة الميزانية.',
};

export default function AccountingLabPage() {
  return <AccountingLabClient />;
}
