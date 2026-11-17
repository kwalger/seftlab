import type { Metadata } from 'next';
import { StudentShell } from '@/components/dashboard/student-shell';

export const metadata: Metadata = {
  title: 'مختبر المحاسبة المالية',
  description:
    'مختبر تفاعلي تطبيقي لمبادئ المحاسبة المالية: المعادلة المحاسبية، القيود اليومية، حسابات الأستاذ، والقوائم المالية بالدينار الأردني.',
};

export default function StudentAccountingLabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StudentShell>{children}</StudentShell>;
}
