'use client';

import React, { useId } from 'react';
import {
  TADREEBAK_ARROW_HEAD_PATH,
  TADREEBAK_ARROW_SHAFT_PATH,
  TADREEBAK_SQUIRCLE_PATH,
} from './tadreebak-logo-paths';

export type TadreebakLogoVariant = 'horizontal' | 'badge' | 'mark' | 'symbol';
export type TadreebakLogoThemeMode = 'auto' | 'light' | 'dark';

export interface TadreebakLogoProps {
  variant?: TadreebakLogoVariant;
  themeMode?: TadreebakLogoThemeMode;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
  'aria-hidden'?: boolean;
}

const PRIMARY_TEXT_CLASSES: Record<TadreebakLogoThemeMode, string> = {
  light: 'text-[#0B1A44]',
  dark: 'text-white',
  auto: 'text-[#0B1A44] dark:text-white',
};

const SUBTITLE_TEXT_CLASSES: Record<TadreebakLogoThemeMode, string> = {
  light: 'text-[#5A6C94]',
  dark: 'text-[#C3D6FF]',
  auto: 'text-[#5A6C94] dark:text-[#C3D6FF]',
};

/**
 * Official SEFT Lab (seftlab.com) brand logo component.
 * Preserves the blue gradient squircle arrow mark (#4C88FF -> #1E55E4) with
 * horizontal SEFT Lab lockup and responsive light/dark theme support.
 */
export function TadreebakLogo({
  variant = 'horizontal',
  themeMode = 'auto',
  label = 'SEFT Lab - seftlab.com',
  className = '',
  style,
  'aria-hidden': ariaHidden,
}: TadreebakLogoProps) {
  const uid = useId().replace(/:/g, '');
  const blId = `sl-bl-${uid}`;
  const hlId = `sl-hl-${uid}`;
  const rmId = `sl-rm-${uid}`;

  const renderMarkSvg = (svgClassName: string) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      preserveAspectRatio="xMidYMid meet"
      role={ariaHidden ? undefined : 'img'}
      aria-label={ariaHidden ? undefined : label}
      aria-hidden={ariaHidden}
      className={svgClassName}
    >
      <defs>
        <linearGradient id={blId} x1="0.1" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#4C88FF" />
          <stop offset="1" stopColor="#1E55E4" />
        </linearGradient>
        <radialGradient id={hlId} cx="0.2" cy="0.05" r="0.8">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.22" />
          <stop offset="0.65" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={rmId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.45" />
          <stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={TADREEBAK_SQUIRCLE_PATH} fill={`url(#${blId})`} />
      <path d={TADREEBAK_SQUIRCLE_PATH} fill={`url(#${hlId})`} />
      <path
        d={TADREEBAK_SQUIRCLE_PATH}
        fill="none"
        stroke={`url(#${rmId})`}
        strokeWidth={2.5}
      />
      <g transform="translate(256 256) scale(1.12) translate(-285.9 -285.9)">
        <path d={TADREEBAK_ARROW_HEAD_PATH} fill="#FFFFFF" />
        <path d={TADREEBAK_ARROW_SHAFT_PATH} fill="#FFFFFF" />
      </g>
    </svg>
  );

  if (variant === 'mark') {
    return renderMarkSvg(`shrink-0 select-none ${className}`);
  }

  if (variant === 'symbol') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
        preserveAspectRatio="xMidYMid meet"
        role={ariaHidden ? undefined : 'img'}
        aria-label={ariaHidden ? undefined : label}
        aria-hidden={ariaHidden}
        className={`shrink-0 select-none ${className}`}
        style={style}
      >
        <g transform="translate(256 256) scale(1.3) translate(-285.9 -285.9)">
          <path
            d={TADREEBAK_ARROW_HEAD_PATH}
            className={
              themeMode === 'dark'
                ? 'fill-white'
                : themeMode === 'light'
                ? 'fill-[#2F6BFF]'
                : 'fill-[#2F6BFF] dark:fill-white'
            }
          />
          <path
            d={TADREEBAK_ARROW_SHAFT_PATH}
            className={
              themeMode === 'dark'
                ? 'fill-white'
                : themeMode === 'light'
                ? 'fill-[#2F6BFF]'
                : 'fill-[#2F6BFF] dark:fill-white'
            }
          />
        </g>
      </svg>
    );
  }

  // Horizontal lockup: squircle mark + SEFT Lab / seftlab.com
  return (
    <span
      dir="ltr"
      role={ariaHidden ? undefined : 'img'}
      aria-label={ariaHidden ? undefined : label}
      aria-hidden={ariaHidden}
      style={style}
      className={`inline-flex shrink-0 select-none items-center gap-2.5 ${className}`}
    >
      {renderMarkSvg('h-[86%] w-auto aspect-square shrink-0')}
      <span className="flex flex-col text-left leading-none">
        <span className="flex items-baseline gap-1 font-sans text-[15px] font-bold tracking-tight sm:text-[17px]">
          <span className={PRIMARY_TEXT_CLASSES[themeMode]}>SEFT</span>
          <span className="text-[#2F6BFF]">Lab</span>
        </span>
        <span
          className={`mt-0.5 font-tabular text-[9.5px] font-semibold tracking-wider lowercase ${SUBTITLE_TEXT_CLASSES[themeMode]}`}
        >
          seftlab.com
        </span>
      </span>
    </span>
  );
}
