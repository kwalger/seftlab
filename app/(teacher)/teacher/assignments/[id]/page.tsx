import React from 'react';
import TeacherAssignmentDetailClient from './assignment-detail-client';

export const runtime = 'edge';

export default async function TeacherAssignmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TeacherAssignmentDetailClient id={id} />;
}
