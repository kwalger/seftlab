'use client';
/* eslint-disable @next/next/no-img-element */

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

export const FOUNDER_NAME = 'حسن عبدالرحمن العرجان';
export const FOUNDER_TITLE = 'المؤسس والرئيس التنفيذي لمنصة SEFT Lab (seftlab.com)';
export const FOUNDER_ENGLISH_TITLE = 'Founder & CEO — SEFT Lab (seftlab.com)';
export const FOUNDER_LOCAL_IMAGE = '/founder-hasan-alarjan.jpg';
export const FOUNDER_REMOTE_IMAGE =
  'https://i.ibb.co/N2pBntzv/722975271-122170246562717412-6612209852802560187-n-4.jpg';

interface FounderPortraitProps {
  className?: string;
  sizes?: string;
  priority?: boolean;
}

export function FounderPortrait({
  className,
  priority = false,
}: FounderPortraitProps) {
  const [src, setSrc] = useState<string>(FOUNDER_LOCAL_IMAGE);

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-[#0A1630]',
        className
      )}
    >
      <img
        src={src}
        alt={`${FOUNDER_NAME} — ${FOUNDER_TITLE}`}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className="h-full w-full object-cover object-top"
        onError={() => {
          if (src !== FOUNDER_REMOTE_IMAGE) {
            setSrc(FOUNDER_REMOTE_IMAGE);
          }
        }}
      />
    </div>
  );
}
