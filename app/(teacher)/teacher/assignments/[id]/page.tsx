import React from 'react';
import TeacherAssignmentDetailClient from './assignment-detail-client';

export function generateStaticParams() {
  return [];
}

export const dynamicParams = true;

export default async function TeacherAssignmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TeacherAssignmentDetailClient id={id} />;
}
