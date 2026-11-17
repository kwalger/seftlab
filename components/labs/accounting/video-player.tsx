'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Captions,
  Check,
  ExternalLink,
  FastForward,
  ListVideo,
  Loader2,
  Maximize,
  Minimize,
  Pause,
  Play,
  PlayCircle,
  Rewind,
  RotateCcw,
  Settings,
  SkipBack,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  getResolvedLessonVideo,
  LESSON_VIDEOS,
  type LessonVideoConfig,
  type VideoChapter,
} from '@/data/lessonVideos';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const VIDEO_PROGRESS_KEY = 'seftlab-video-progress-v1';
const VIDEO_RATE_KEY = 'seftlab-video-rate-v1';
const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;

const YT_QUALITY_LABELS: Record<string, string> = {
  auto: 'تلقائي',
  highres: '1080p+',
  hd1080: '1080p',
  hd720: '720p',
  large: '480p',
  medium: '360p',
  small: '240p',
};

interface StoredVideoProgress {
  currentTime: number;
  duration: number;
  watched: boolean;
}

interface QualityOption {
  value: string;
  label: string;
  url?: string;
}

interface HlsConstructorLike {
  isSupported(): boolean;
  new (): {
    loadSource(url: string): void;
    attachMedia(media: HTMLMediaElement): void;
    destroy(): void;
  };
}

interface YouTubePlayerLike {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead?: boolean): void;
  setPlaybackRate(rate: number): void;
  setVolume(vol: number): void;
  mute(): void;
  unMute(): void;
  isMuted(): boolean;
  getCurrentTime(): number;
  getDuration(): number;
  getVideoLoadedFraction?: () => number;
  getAvailableQualityLevels?: () => string[];
  setPlaybackQuality?: (quality: string) => void;
  getPlaybackQuality?: () => string;
  loadModule?: (mod: string) => void;
  unloadModule?: (mod: string) => void;
  getOption?: (mod: string, opt: string) => unknown;
  setOption?: (mod: string, opt: string, val: unknown) => void;
  destroy(): void;
}

interface YouTubeNamespaceLike {
  Player: new (
    el: HTMLElement | string,
    options: {
      host?: string;
      videoId: string;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: (ev: { target: YouTubePlayerLike }) => void;
        onStateChange?: (ev: { data: number; target: YouTubePlayerLike }) => void;
        onPlaybackQualityChange?: (ev: {
          data: string;
          target: YouTubePlayerLike;
        }) => void;
        onError?: (ev: { data: number }) => void;
      };
    }
  ) => YouTubePlayerLike;
}

interface HTMLVideoElementWithWebkit extends HTMLVideoElement {
  webkitEnterFullscreen?: () => void;
  webkitExitFullscreen?: () => void;
}

interface HTMLDivElementWithWebkit extends HTMLDivElement {
  webkitRequestFullscreen?: () => Promise<void> | void;
}

declare global {
  interface Window {
    Hls?: HlsConstructorLike;
    YT?: YouTubeNamespaceLike;
    onYouTubeIframeAPIReady?: () => void;
  }
}

export interface VideoPlayerProps {
  lessonId: string;
  title?: string;
  videoConfig?: LessonVideoConfig;
  onWatchedComplete?: (lessonId: string) => void;
  onSkip?: () => void;
  className?: string;
}

// تجميع استدعاءات جاهزية يوتيوب على مستوى الوحدة لمنع فقدانها مع React StrictMode
const ytApiReadyCallbacks = new Set<() => void>();
let ytApiHookInstalled = false;

function subscribeYouTubeIframeApi(
  onReady: () => void,
  onError: () => void
): () => void {
  if (typeof window === 'undefined') return () => undefined;
  if (window.YT?.Player) {
    onReady();
    return () => undefined;
  }

  ytApiReadyCallbacks.add(onReady);
  if (!ytApiHookInstalled) {
    ytApiHookInstalled = true;
    const prevReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prevReady?.();
      ytApiReadyCallbacks.forEach((cb) => {
        try {
          cb();
        } catch {
          // تجاهل أخطاء الاستدعاءات المنتهية
        }
      });
      ytApiReadyCallbacks.clear();
    };
  }

  const scriptSrc = 'https://www.youtube.com/iframe_api';
  const existingScript = document.querySelector(
    `script[src="${scriptSrc}"]`
  ) as HTMLScriptElement | null;

  if (existingScript) {
    existingScript.addEventListener('error', onError);
    return () => {
      ytApiReadyCallbacks.delete(onReady);
      existingScript.removeEventListener('error', onError);
    };
  }

  const tag = document.createElement('script');
  tag.src = scriptSrc;
  tag.async = true;
  tag.addEventListener('error', onError);
  document.head.appendChild(tag);

  return () => {
    ytApiReadyCallbacks.delete(onReady);
    tag.removeEventListener('error', onError);
  };
}

function readProgressMap(): Record<string, StoredVideoProgress> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(VIDEO_PROGRESS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, StoredVideoProgress>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeLessonProgress(
  lessonId: string,
  progress: StoredVideoProgress
): void {
  if (typeof window === 'undefined') return;
  try {
    const map = readProgressMap();
    map[lessonId] = progress;
    window.localStorage.setItem(VIDEO_PROGRESS_KEY, JSON.stringify(map));
  } catch {
    // تجاهل أخطاء التخزين في التصفح الخاص
  }
}

export function isLessonVideoWatched(lessonId: string): boolean {
  const map = readProgressMap();
  return Boolean(map[lessonId]?.watched);
}

function readPreferredRate(): number {
  if (typeof window === 'undefined') return 1;
  try {
    const raw = Number(window.localStorage.getItem(VIDEO_RATE_KEY));
    return PLAYBACK_RATES.includes(raw as (typeof PLAYBACK_RATES)[number])
      ? raw
      : 1;
  } catch {
    return 1;
  }
}

function savePreferredRate(rate: number): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(VIDEO_RATE_KEY, String(rate));
  } catch {
    // تجاهل أخطاء التخزين
  }
}

function resolveStaticLessonVideo(lessonId: string): LessonVideoConfig {
  const base: LessonVideoConfig = LESSON_VIDEOS[lessonId] || {
    lessonId,
    title: 'فيديو الدرس',
    url: '',
  };

  const validFileSources = (base.file?.sources || []).filter((s) =>
    Boolean(s.src && s.src.trim())
  );
  const fileHlsUrl = base.file?.hlsUrl?.trim();
  if (validFileSources.length > 0 || fileHlsUrl) {
    return {
      ...base,
      provider: 'file',
      url: validFileSources[0]?.src.trim() || '',
      hlsUrl: fileHlsUrl || base.hlsUrl,
      poster: base.file?.poster?.trim() || base.poster,
      subtitlesUrl: base.file?.subtitlesUrl?.trim() || base.subtitlesUrl,
      subtitlesLabel: base.file?.subtitlesLabel || base.subtitlesLabel,
      youtubeId: undefined,
    };
  }

  if (base.url || base.hlsUrl || (base.sources && base.sources.length > 0)) {
    return {
      ...base,
      provider: base.provider || 'file',
      youtubeId: undefined,
    };
  }

  if (base.video?.provider === 'youtube' && base.video.id) {
    const hasClipTimes =
      base.video.start !== null || base.video.end !== null;
    if (base.showBeforeTimestamps || hasClipTimes) {
      return {
        ...base,
        provider: 'youtube',
        youtubeId: base.video.id,
        poster:
          base.poster ||
          `https://i.ytimg.com/vi/${base.video.id}/hqdefault.jpg`,
      };
    }
  }

  return base;
}

function formatDisplayTime(
  totalSeconds: number,
  options?: { ready?: boolean; isTotal?: boolean }
): string {
  const ready = options?.ready ?? true;
  const isTotal = options?.isTotal ?? false;
  if (
    !ready ||
    !Number.isFinite(totalSeconds) ||
    totalSeconds < 0 ||
    (isTotal && totalSeconds <= 0)
  ) {
    return '--:--';
  }
  const secs = Math.floor(totalSeconds);
  const hours = Math.floor(secs / 3600);
  const mins = Math.floor((secs % 3600) / 60);
  const rem = secs % 60;
  const paddedRem = rem < 10 ? `0${rem}` : `${rem}`;
  if (hours > 0) {
    const paddedMins = mins < 10 ? `0${mins}` : `${mins}`;
    return `${hours}:${paddedMins}:${paddedRem}`;
  }
  return `${mins}:${paddedRem}`;
}

export function VideoPlayer({
  lessonId,
  title,
  videoConfig,
  onWatchedComplete,
  onSkip,
  className,
}: VideoPlayerProps) {
  const isMobile = useIsMobile();

  const [hydrated, setHydrated] = useState(false);

  const resolved = useMemo(() => {
    if (videoConfig) return videoConfig;
    if (!hydrated) return resolveStaticLessonVideo(lessonId);
    return getResolvedLessonVideo(lessonId);
  }, [videoConfig, hydrated, lessonId]);

  // تحديد مزوّد التشغيل: الأولوية للملف المباشر (MP4 أو HLS)، ويُستخدم يوتيوب احتياطياً فقط.
  const fileSources = useMemo(() => {
    const fromSpec = (resolved.file?.sources || [])
      .filter((s) => Boolean(s.src && s.src.trim()))
      .map((s) => ({
        value: s.label,
        label: s.label,
        url: s.src.trim(),
      }));
    if (fromSpec.length > 0) return fromSpec;

    const legacyList: QualityOption[] = [];
    if (resolved.url) {
      legacyList.push({ value: 'auto', label: 'تلقائي', url: resolved.url });
    }
    if (resolved.sources) {
      for (const s of resolved.sources) {
        if (s.url) {
          legacyList.push({ value: s.quality, label: s.quality, url: s.url });
        }
      }
    }
    return legacyList;
  }, [resolved.file?.sources, resolved.url, resolved.sources]);

  const hasMp4 = fileSources.length > 0;
  const hasHls = Boolean(resolved.file?.hlsUrl || resolved.hlsUrl);
  const useFileProvider = hasMp4 || hasHls;
  const useYoutubeFallback = !useFileProvider && Boolean(resolved.youtubeId);
  const hasAnyVideo = useFileProvider || useYoutubeFallback;

  const activeHlsUrl = (resolved.file?.hlsUrl || resolved.hlsUrl || '').trim();
  const activeSubtitlesUrl = (
    resolved.file?.subtitlesUrl ||
    resolved.subtitlesUrl ||
    ''
  ).trim();
  const activeSubtitlesLabel =
    resolved.file?.subtitlesLabel || resolved.subtitlesLabel || 'العربية';

  const clipStart =
    typeof resolved.video?.start === 'number' &&
    Number.isFinite(resolved.video.start)
      ? Math.max(0, resolved.video.start)
      : 0;
  const clipEndFixed =
    typeof resolved.video?.end === 'number' &&
    Number.isFinite(resolved.video.end)
      ? Math.max(clipStart + 1, resolved.video.end)
      : null;

  const containerRef = useRef<HTMLDivElementWithWebkit>(null);
  const videoRef = useRef<HTMLVideoElementWithWebkit>(null);
  const ytHostRef = useRef<HTMLDivElement>(null);
  const ytPlayerRef = useRef<YouTubePlayerLike | null>(null);
  const ytReadyRef = useRef(false);
  const pendingPlayRef = useRef(false);
  const timelineRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<number | null>(null);
  const tapTimerRef = useRef<number | null>(null);
  const seekBadgeTimerRef = useRef<number | null>(null);
  const lastTapInfoRef = useRef<{
    zone: 'left' | 'center' | 'right';
    at: number;
  } | null>(null);
  const pendingRestoreRef = useRef<{ time: number; shouldPlay: boolean } | null>(
    null
  );

  const [isInView, setIsInView] = useState(false);
  const [retryNonce, setRetryNonce] = useState(0);
  const [isLoadingMeta, setIsLoadingMeta] = useState(hasAnyVideo);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStartedOnce, setHasStartedOnce] = useState(false);
  const [clipEnded, setClipEnded] = useState(false);
  const [currentTime, setCurrentTime] = useState(clipStart);
  const [duration, setDuration] = useState(0);
  const [bufferedPct, setBufferedPct] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [selectedQuality, setSelectedQuality] = useState<string>('auto');
  const [ytQualities, setYtQualities] = useState<QualityOption[]>([]);
  const [ytHasCaptions, setYtHasCaptions] = useState(false);
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPseudoFullscreen, setIsPseudoFullscreen] = useState(false);
  const isEffectiveFullscreen = isFullscreen || isPseudoFullscreen;
  const [controlsVisible, setControlsVisible] = useState(true);
  const [openMenu, setOpenMenu] = useState<
    'none' | 'speed' | 'settings' | 'chapters'
  >('none');
  const [mobileSettingsOpen, setMobileSettingsOpen] = useState(false);
  const [scrubPct, setScrubPct] = useState<number | null>(null);
  const [hoverTimePct, setHoverTimePct] = useState<number | null>(null);
  const [seekBadge, setSeekBadge] = useState<{
    side: 'forward' | 'backward';
    label: string;
  } | null>(null);
  const [watchedRecorded, setWatchedRecorded] = useState(false);
  const [trackedLessonId, setTrackedLessonId] = useState(lessonId);

  if (trackedLessonId !== lessonId) {
    setTrackedLessonId(lessonId);
    setWatchedRecorded(false);
    setHasError(false);
    setIsLoadingMeta(hasAnyVideo);
    setIsBuffering(false);
    setClipEnded(false);
    setIsPlaying(false);
    setHasStartedOnce(false);
    setDuration(0);
    setCurrentTime(clipStart);
    setBufferedPct(0);
    setOpenMenu('none');
    setMobileSettingsOpen(false);
    setIsPseudoFullscreen(false);
    setYtQualities([]);
    setYtHasCaptions(false);
  }

  // مزامنة القيم المخزّنة في localStorage بعد اكتمال Hydration لمنع تضارب SSR
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setHydrated(true);
      setPlaybackRate(readPreferredRate());
      setWatchedRecorded(isLessonVideoWatched(lessonId));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [lessonId]);

  const playbackRateRef = useRef(playbackRate);
  useEffect(() => {
    playbackRateRef.current = playbackRate;
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
    if (ytReadyRef.current && ytPlayerRef.current) {
      try {
        ytPlayerRef.current.setPlaybackRate?.(playbackRate);
      } catch {
        // المشغل لم يكتمل تهيئته بعد
      }
    }
  }, [playbackRate]);

  const onWatchedCompleteRef = useRef(onWatchedComplete);
  useEffect(() => {
    onWatchedCompleteRef.current = onWatchedComplete;
  }, [onWatchedComplete]);

  const effectiveEnd = useMemo(() => {
    if (clipEndFixed !== null) {
      return duration > 0 ? Math.min(clipEndFixed, duration) : clipEndFixed;
    }
    return duration > 0 ? duration : 0;
  }, [clipEndFixed, duration]);

  const effectiveSpan = Math.max(0, effectiveEnd - clipStart);
  const isMetadataReady = !isLoadingMeta && effectiveSpan > 0;

  // الفصول الصالحة فقط (تُخفى إن لم تتوفر توقيتات بعد)
  const timedChapters = useMemo(() => {
    const raw = resolved.video?.chapters || [];
    return raw.filter(
      (ch): ch is VideoChapter & { start: number } =>
        typeof ch.start === 'number' &&
        Number.isFinite(ch.start) &&
        ch.start >= clipStart &&
        (clipEndFixed === null || ch.start < clipEndFixed)
    );
  }, [resolved.video?.chapters, clipStart, clipEndFixed]);

  const qualityOptions: QualityOption[] = useMemo(() => {
    if (useYoutubeFallback) return ytQualities;
    if (fileSources.length <= 1) return fileSources;
    return [
      { value: 'auto', label: 'تلقائي', url: fileSources[0]?.url },
      ...fileSources.filter((s) => s.value !== 'auto'),
    ];
  }, [useYoutubeFallback, ytQualities, fileSources]);

  const activeMp4Url = useMemo(() => {
    if (useYoutubeFallback) return '';
    const chosen = qualityOptions.find((q) => q.value === selectedQuality);
    if (chosen?.url) return chosen.url;
    return fileSources[0]?.url || '';
  }, [useYoutubeFallback, qualityOptions, selectedQuality, fileSources]);

  const clearAutoHide = useCallback(() => {
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const scheduleAutoHide = useCallback(() => {
    clearAutoHide();
    setControlsVisible(true);
    if (
      isPlaying &&
      openMenu === 'none' &&
      !mobileSettingsOpen &&
      scrubPct === null
    ) {
      hideTimerRef.current = window.setTimeout(() => {
        setControlsVisible(false);
      }, 2500);
    }
  }, [clearAutoHide, isPlaying, openMenu, mobileSettingsOpen, scrubPct]);

  useEffect(() => {
    return () => {
      clearAutoHide();
      if (tapTimerRef.current) window.clearTimeout(tapTimerRef.current);
      if (seekBadgeTimerRef.current) window.clearTimeout(seekBadgeTimerRef.current);
    };
  }, [clearAutoHide]);

  // التحميل الكسول عند ظهور المشغل في الشاشة
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !hasAnyVideo) return;
    if (typeof IntersectionObserver === 'undefined') {
      const id = window.setTimeout(() => setIsInView(true), 0);
      return () => window.clearTimeout(id);
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasAnyVideo]);

  const markProgressAndCheckWatched = useCallback(
    (rawTimeSec: number, rawDurSec: number) => {
      const spanEnd =
        clipEndFixed !== null
          ? rawDurSec > 0
            ? Math.min(clipEndFixed, rawDurSec)
            : clipEndFixed
          : rawDurSec > 0
          ? rawDurSec
          : 0;
      const span = spanEnd - clipStart;
      if (!Number.isFinite(span) || span <= 0) return;

      const clampedRaw = Math.max(clipStart, Math.min(spanEnd, rawTimeSec));
      const relativeTime = clampedRaw - clipStart;
      const pct = relativeTime / span;
      const reachedComplete = watchedRecorded || pct >= 0.9;
      writeLessonProgress(lessonId, {
        currentTime: clampedRaw,
        duration: spanEnd,
        watched: reachedComplete,
      });
      if (reachedComplete && !watchedRecorded) {
        setWatchedRecorded(true);
        onWatchedCompleteRef.current?.(lessonId);
      }
    },
    [lessonId, clipStart, clipEndFixed, watchedRecorded]
  );

  const markProgressRef = useRef(markProgressAndCheckWatched);
  useEffect(() => {
    markProgressRef.current = markProgressAndCheckWatched;
  }, [markProgressAndCheckWatched]);

  // دعم HLS عند وجود رابط .m3u8
  useEffect(() => {
    if (!isInView || useYoutubeFallback || !hasHls || !activeHlsUrl) return;
    const video = videoRef.current;
    if (!video) return;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = activeHlsUrl;
      return;
    }

    let destroyed = false;
    let instance: { destroy(): void } | null = null;

    const attachHls = () => {
      if (
        destroyed ||
        !window.Hls ||
        !window.Hls.isSupported() ||
        !videoRef.current
      ) {
        return;
      }
      const hls = new window.Hls();
      hls.loadSource(activeHlsUrl);
      hls.attachMedia(videoRef.current);
      instance = hls;
    };

    if (window.Hls) {
      attachHls();
    } else {
      const scriptUrl =
        'https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js';
      const existing = document.querySelector(`script[src="${scriptUrl}"]`);
      if (existing) {
        existing.addEventListener('load', attachHls);
      } else {
        const script = document.createElement('script');
        script.src = scriptUrl;
        script.async = true;
        script.onload = attachHls;
        script.onerror = () => {
          if (videoRef.current) videoRef.current.src = activeHlsUrl;
        };
        document.head.appendChild(script);
      }
    }

    return () => {
      destroyed = true;
      instance?.destroy();
    };
  }, [isInView, useYoutubeFallback, hasHls, activeHlsUrl, retryNonce]);

  const refreshYtMetadata = useCallback((player: YouTubePlayerLike) => {
    try {
      const levels = player.getAvailableQualityLevels?.() || [];
      if (levels.length > 0) {
        const mapped: QualityOption[] = [{ value: 'auto', label: 'تلقائي' }];
        for (const lvl of levels) {
          if (lvl === 'auto') continue;
          mapped.push({
            value: lvl,
            label: YT_QUALITY_LABELS[lvl] || lvl,
          });
        }
        setYtQualities(mapped);
      }
      const trackList = player.getOption?.('captions', 'tracklist');
      setYtHasCaptions(Array.isArray(trackList) && trackList.length > 0);
    } catch {
      // غير متوفر بعد
    }
  }, []);

  // تهيئة مشغل يوتيوب الاحتياطي عبر حاوية فرعية دائمة لضمان سلامة الـ DOM مع StrictMode
  useEffect(() => {
    const ytId = resolved.youtubeId;
    const hostEl = ytHostRef.current;
    if (!isInView || !useYoutubeFallback || !ytId || !hostEl) {
      return;
    }

    let cancelled = false;
    let timerId: number | null = null;
    let localPlayer: YouTubePlayerLike | null = null;
    ytReadyRef.current = false;
    ytPlayerRef.current = null;

    const initPlayer = () => {
      if (cancelled || !window.YT?.Player || !hostEl) return;

      hostEl.innerHTML = '';
      const mountEl = document.createElement('div');
      mountEl.style.width = '100%';
      mountEl.style.height = '100%';
      hostEl.appendChild(mountEl);

      const vars: Record<string, string | number> = {
        controls: 0,
        modestbranding: 1,
        rel: 0,
        playsinline: 1,
        iv_load_policy: 3,
        disablekb: 1,
        fs: 0,
        enablejsapi: 1,
        hl: 'ar',
      };
      if (window.location?.origin) {
        vars.origin = window.location.origin;
      }
      if (clipStart > 0) {
        vars.start = Math.floor(clipStart);
      }
      if (clipEndFixed !== null) {
        vars.end = Math.floor(clipEndFixed);
      }

      localPlayer = new window.YT.Player(mountEl, {
        host: 'https://www.youtube-nocookie.com',
        videoId: ytId,
        playerVars: vars,
        events: {
          onReady: (ev) => {
            if (cancelled) return;
            const target = ev.target;
            if (!target || typeof target.playVideo !== 'function') {
              return;
            }
            ytPlayerRef.current = target;
            ytReadyRef.current = true;
            setIsLoadingMeta(false);
            setIsBuffering(false);

            const rawDur = target.getDuration?.() || 0;
            setDuration(rawDur);
            try {
              target.setPlaybackRate?.(playbackRateRef.current);
            } catch {
              // تجاهل إن لم تتوفر بعد
            }
            refreshYtMetadata(target);

            const saved = readProgressMap()[lessonId];
            const boundEnd =
              clipEndFixed !== null
                ? Math.min(clipEndFixed, rawDur || clipEndFixed)
                : Math.max(0, rawDur - 4);
            if (
              saved &&
              saved.currentTime > clipStart + 2 &&
              saved.currentTime < boundEnd
            ) {
              const clampedSaved = Math.min(boundEnd, saved.currentTime);
              try {
                target.seekTo?.(clampedSaved, true);
              } catch {
                // تجاهل
              }
              setCurrentTime(clampedSaved);
            } else if (clipStart > 0) {
              try {
                target.seekTo?.(clipStart, true);
              } catch {
                // تجاهل
              }
              setCurrentTime(clipStart);
            }

            if (pendingPlayRef.current) {
              pendingPlayRef.current = false;
              try {
                target.playVideo();
              } catch {
                // قد يمنع المتصفح التشغيل التلقائي إن تغير السياق
              }
            }
          },
          onStateChange: (ev) => {
            if (cancelled) return;
            const playing = ev.data === 1;
            const buffering = ev.data === 3;
            setIsBuffering(buffering);
            setIsPlaying(playing);
            if (playing) {
              setIsLoadingMeta(false);
              setHasStartedOnce(true);
              setClipEnded(false);
              refreshYtMetadata(ev.target);
            }
            if (ev.data === 2 || ev.data === 5) {
              setControlsVisible(true);
            }
            if (ev.data === 0) {
              const rawDur = ev.target?.getDuration?.() || 0;
              const stopPoint =
                clipEndFixed !== null
                  ? rawDur > 0
                    ? Math.min(clipEndFixed, rawDur)
                    : clipEndFixed
                  : rawDur;
              setIsBuffering(false);
              setControlsVisible(true);
              setCurrentTime(stopPoint);
              if (clipEndFixed !== null) {
                setClipEnded(true);
              }
              markProgressRef.current(stopPoint, rawDur);
            }
          },
          onPlaybackQualityChange: (ev) => {
            if (!cancelled && ev.data) {
              setSelectedQuality(ev.data);
            }
          },
          onError: () => {
            if (!cancelled) {
              ytReadyRef.current = false;
              pendingPlayRef.current = false;
              setIsLoadingMeta(false);
              setIsBuffering(false);
              setHasError(true);
            }
          },
        },
      });

      timerId = window.setInterval(() => {
        const p = ytPlayerRef.current;
        if (!ytReadyRef.current || !p) return;
        let cur = 0;
        let rawDur = 0;
        let loaded: number | undefined;
        try {
          cur = p.getCurrentTime?.() || 0;
          rawDur = p.getDuration?.() || 0;
          loaded = p.getVideoLoadedFraction?.();
        } catch {
          return;
        }
        if (typeof loaded === 'number' && Number.isFinite(loaded)) {
          setBufferedPct(Math.max(0, Math.min(100, loaded * 100)));
        }
        if (rawDur > 0) {
          setDuration(rawDur);
          const spanEnd =
            clipEndFixed !== null ? Math.min(clipEndFixed, rawDur) : rawDur;
          const clampedCur = Math.max(clipStart, Math.min(spanEnd, cur));
          setCurrentTime(clampedCur);
          if (clipEndFixed !== null && cur >= spanEnd - 0.35) {
            try {
              p.pauseVideo?.();
            } catch {
              // تجاهل
            }
            setIsPlaying(false);
            setIsBuffering(false);
            setControlsVisible(true);
            setClipEnded(true);
            markProgressRef.current(spanEnd, rawDur);
          } else {
            markProgressRef.current(clampedCur, rawDur);
          }
        }
      }, 450);
    };

    const unsubscribe = subscribeYouTubeIframeApi(initPlayer, () => {
      if (!cancelled) {
        ytReadyRef.current = false;
        pendingPlayRef.current = false;
        setIsLoadingMeta(false);
        setIsBuffering(false);
        setHasError(true);
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
      if (timerId) window.clearInterval(timerId);
      ytReadyRef.current = false;
      pendingPlayRef.current = false;
      const toDestroy = localPlayer || ytPlayerRef.current;
      ytPlayerRef.current = null;
      if (toDestroy && typeof toDestroy.destroy === 'function') {
        try {
          toDestroy.destroy();
        } catch {
          // تجاهل إذا دُمّر الإطار مسبقاً
        }
      }
      hostEl.innerHTML = '';
    };
  }, [
    isInView,
    useYoutubeFallback,
    resolved.youtubeId,
    lessonId,
    clipStart,
    clipEndFixed,
    retryNonce,
    refreshYtMetadata,
  ]);

  // مزامنة ملء الشاشة وفك قفل الاتجاه عند الخروج
  useEffect(() => {
    const onFsChange = () => {
      const active = document.fullscreenElement === containerRef.current;
      setIsFullscreen(active);
      if (active) {
        setIsPseudoFullscreen(false);
      }
      const orient = screen.orientation as ScreenOrientation & {
        unlock?: () => void;
      };
      if (!active) {
        try {
          orient?.unlock?.();
        } catch {
          // غير مدعوم في هذا المتصفح
        }
      }
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // قفل تمرير الصفحة وإغلاق ملء الشاشة البديل بزر Escape على الهاتف
  useEffect(() => {
    if (!isPseudoFullscreen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsPseudoFullscreen(false);
      }
    };
    window.addEventListener('keydown', onEsc);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onEsc);
    };
  }, [isPseudoFullscreen]);

  const replayClipOrRestart = useCallback(() => {
    setClipEnded(false);
    setCurrentTime(clipStart);
    setHasStartedOnce(true);
    if (useYoutubeFallback) {
      const p = ytPlayerRef.current;
      if (!ytReadyRef.current || !p || typeof p.playVideo !== 'function') {
        pendingPlayRef.current = true;
        setIsBuffering(true);
        scheduleAutoHide();
        return;
      }
      try {
        p.seekTo?.(clipStart, true);
        p.playVideo();
      } catch {
        setHasError(true);
      }
    } else if (videoRef.current) {
      videoRef.current.currentTime = clipStart;
      void videoRef.current.play().catch(() => undefined);
    }
    scheduleAutoHide();
  }, [clipStart, useYoutubeFallback, scheduleAutoHide]);

  const togglePlay = useCallback(() => {
    if (clipEnded) {
      replayClipOrRestart();
      return;
    }
    if (useYoutubeFallback) {
      const p = ytPlayerRef.current;
      if (!ytReadyRef.current || !p || typeof p.playVideo !== 'function') {
        pendingPlayRef.current = true;
        setHasStartedOnce(true);
        setIsBuffering(true);
        return;
      }
      try {
        if (isPlaying) {
          pendingPlayRef.current = false;
          p.pauseVideo?.();
          setControlsVisible(true);
        } else {
          setHasStartedOnce(true);
          p.playVideo();
          scheduleAutoHide();
        }
      } catch {
        setHasError(true);
      }
      return;
    }
    const video = videoRef.current;
    if (!video) return;
    if (video.paused || video.ended) {
      setHasStartedOnce(true);
      void video.play().catch(() => undefined);
      scheduleAutoHide();
    } else {
      video.pause();
      setControlsVisible(true);
    }
  }, [
    clipEnded,
    replayClipOrRestart,
    useYoutubeFallback,
    isPlaying,
    scheduleAutoHide,
  ]);

  const seekToAbsolute = useCallback(
    (targetSeconds: number) => {
      const boundMax =
        effectiveEnd > clipStart ? effectiveEnd : clipStart + 36000;
      const clamped = Math.max(clipStart, Math.min(boundMax, targetSeconds));
      setClipEnded(false);
      if (useYoutubeFallback) {
        const p = ytPlayerRef.current;
        if (ytReadyRef.current && p && typeof p.seekTo === 'function') {
          try {
            p.seekTo(clamped, true);
          } catch {
            // تجاهل
          }
        }
      } else if (videoRef.current) {
        videoRef.current.currentTime = clamped;
      }
      setCurrentTime(clamped);
      scheduleAutoHide();
    },
    [clipStart, effectiveEnd, useYoutubeFallback, scheduleAutoHide]
  );

  const showSeekFeedback = useCallback(
    (side: 'forward' | 'backward', label: string) => {
      setSeekBadge({ side, label });
      if (seekBadgeTimerRef.current) {
        window.clearTimeout(seekBadgeTimerRef.current);
      }
      seekBadgeTimerRef.current = window.setTimeout(() => {
        setSeekBadge(null);
      }, 650);
    },
    []
  );

  const seekBySeconds = useCallback(
    (delta: number) => {
      let cur = currentTime;
      if (useYoutubeFallback) {
        if (ytReadyRef.current && ytPlayerRef.current) {
          try {
            cur = ytPlayerRef.current.getCurrentTime?.() ?? currentTime;
          } catch {
            cur = currentTime;
          }
        }
      } else {
        cur = videoRef.current?.currentTime ?? currentTime;
      }
      seekToAbsolute(cur + delta);
      showSeekFeedback(
        delta >= 0 ? 'forward' : 'backward',
        delta >= 0 ? '+10 ث' : '-10 ث'
      );
    },
    [useYoutubeFallback, currentTime, seekToAbsolute, showSeekFeedback]
  );

  const seekToPercent = useCallback(
    (pct: number) => {
      if (effectiveSpan <= 0) return;
      const clamped = Math.max(0, Math.min(1, pct));
      const target = clipStart + clamped * effectiveSpan;
      seekToAbsolute(target);
    },
    [clipStart, effectiveSpan, seekToAbsolute]
  );

  const toggleMute = useCallback(() => {
    if (useYoutubeFallback) {
      const p = ytPlayerRef.current;
      if (!ytReadyRef.current || !p) return;
      try {
        if (p.isMuted?.()) {
          p.unMute?.();
          setIsMuted(false);
        } else {
          p.mute?.();
          setIsMuted(true);
        }
      } catch {
        // تجاهل
      }
      scheduleAutoHide();
      return;
    }
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
    scheduleAutoHide();
  }, [useYoutubeFallback, scheduleAutoHide]);

  const handleVolumeChange = (nextVol: number) => {
    setVolume(nextVol);
    setIsMuted(nextVol === 0);
    if (useYoutubeFallback && ytReadyRef.current && ytPlayerRef.current) {
      try {
        ytPlayerRef.current.setVolume?.(Math.round(nextVol * 100));
        if (nextVol === 0) ytPlayerRef.current.mute?.();
        else ytPlayerRef.current.unMute?.();
      } catch {
        // تجاهل
      }
    }
    if (videoRef.current) {
      videoRef.current.volume = nextVol;
      videoRef.current.muted = nextVol === 0;
    }
  };

  const handleRateSelect = (rate: number) => {
    setPlaybackRate(rate);
    savePreferredRate(rate);
    setOpenMenu('none');
    setMobileSettingsOpen(false);
    scheduleAutoHide();
  };

  const handleQualitySelect = (quality: string) => {
    if (useYoutubeFallback) {
      const p = ytPlayerRef.current;
      setSelectedQuality(quality);
      if (ytReadyRef.current && p) {
        try {
          const preserved = p.getCurrentTime?.() ?? currentTime;
          p.setPlaybackQuality?.(quality);
          p.seekTo?.(preserved, true);
        } catch {
          // تجاهل
        }
      }
      setOpenMenu('none');
      setMobileSettingsOpen(false);
      scheduleAutoHide();
      return;
    }
    const video = videoRef.current;
    if (video && quality !== selectedQuality) {
      pendingRestoreRef.current = {
        time: video.currentTime || currentTime,
        shouldPlay: !video.paused && !video.ended,
      };
    }
    setSelectedQuality(quality);
    setOpenMenu('none');
    setMobileSettingsOpen(false);
    scheduleAutoHide();
  };

  const toggleFullscreen = useCallback(async () => {
    const el = containerRef.current;
    const orient = screen.orientation as ScreenOrientation & {
      lock?: (mode: string) => Promise<void>;
      unlock?: () => void;
    };

    if (isPseudoFullscreen) {
      setIsPseudoFullscreen(false);
      try {
        orient?.unlock?.();
      } catch {
        // غير مدعوم
      }
      scheduleAutoHide();
      return;
    }

    try {
      if (el && document.fullscreenElement === el) {
        await document.exitFullscreen();
        scheduleAutoHide();
        return;
      }
      if (el?.requestFullscreen) {
        await el.requestFullscreen();
      } else if (el?.webkitRequestFullscreen) {
        await el.webkitRequestFullscreen();
      } else {
        setIsPseudoFullscreen(true);
      }
    } catch {
      setIsPseudoFullscreen(true);
    }

    try {
      if (window.innerWidth < 768) {
        await orient?.lock?.('landscape');
      }
    } catch {
      // قفل الاتجاه غير مدعوم في هذا المتصفح
    }
    scheduleAutoHide();
  }, [isPseudoFullscreen, scheduleAutoHide]);

  const toggleCaptions = () => {
    const next = !captionsEnabled;
    if (useYoutubeFallback) {
      const p = ytPlayerRef.current;
      if (!ytReadyRef.current || !p) return;
      try {
        if (next) {
          p.loadModule?.('captions');
          const list = p.getOption?.('captions', 'tracklist');
          if (Array.isArray(list) && list.length > 0) {
            p.setOption?.('captions', 'track', list[0]);
          }
        } else {
          p.unloadModule?.('captions');
        }
        setCaptionsEnabled(next);
      } catch {
        // تجاهل إذا لم تتوفر ترجمة
      }
      scheduleAutoHide();
      return;
    }
    const video = videoRef.current;
    if (!video || video.textTracks.length === 0) return;
    video.textTracks[0].mode = next ? 'showing' : 'hidden';
    setCaptionsEnabled(next);
    scheduleAutoHide();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!hasAnyVideo || hasError) return;
    const key = e.key.toLowerCase();
    if (key === ' ' || key === 'k') {
      e.preventDefault();
      togglePlay();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      seekBySeconds(10);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      seekBySeconds(-10);
    } else if (key === 'f') {
      e.preventDefault();
      void toggleFullscreen();
    } else if (key === 'm') {
      e.preventDefault();
      toggleMute();
    } else if (/^[0-9]$/.test(e.key) && effectiveSpan > 0) {
      e.preventDefault();
      seekToPercent(Number(e.key) / 10);
    }
  };

  const handleShieldPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = rect.width > 0 ? (e.clientX - rect.left) / rect.width : 0.5;
    const zone: 'left' | 'center' | 'right' =
      ratio < 0.35 ? 'left' : ratio > 0.65 ? 'right' : 'center';

    // التشغيل الأولي أو إعادة المقطع يتم فوراً وبشكل متزامن للحفاظ على إذن التفاعل في الهاتف
    if ((!hasStartedOnce && !isPlaying) || clipEnded) {
      if (tapTimerRef.current) {
        window.clearTimeout(tapTimerRef.current);
        tapTimerRef.current = null;
      }
      lastTapInfoRef.current = null;
      togglePlay();
      return;
    }

    const now = Date.now();
    const prev = lastTapInfoRef.current;
    const isDouble = Boolean(prev && prev.zone === zone && now - prev.at < 280);
    lastTapInfoRef.current = { zone, at: now };

    if (isDouble) {
      if (tapTimerRef.current) {
        window.clearTimeout(tapTimerRef.current);
        tapTimerRef.current = null;
      }
      lastTapInfoRef.current = null;
      if (zone === 'left') {
        seekBySeconds(-10);
      } else if (zone === 'right') {
        seekBySeconds(10);
      } else {
        void toggleFullscreen();
      }
      return;
    }

    if (tapTimerRef.current) window.clearTimeout(tapTimerRef.current);
    tapTimerRef.current = window.setTimeout(() => {
      if (openMenu !== 'none') {
        setOpenMenu('none');
        scheduleAutoHide();
        return;
      }
      if (controlsVisible && isPlaying) {
        clearAutoHide();
        setControlsVisible(false);
      } else {
        scheduleAutoHide();
      }
    }, 230);
  };

  const getTimelinePctFromClientX = (clientX: number) => {
    const el = timelineRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return 0;
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  };

  const handleTimelinePointerDown = (
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    if (effectiveSpan <= 0) return;
    e.stopPropagation();
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    clearAutoHide();
    setControlsVisible(true);
    setScrubPct(getTimelinePctFromClientX(e.clientX));
  };

  const handleTimelinePointerMove = (
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    const pct = getTimelinePctFromClientX(e.clientX);
    if (scrubPct !== null) {
      e.preventDefault();
      setScrubPct(pct);
    } else {
      setHoverTimePct(pct);
    }
  };

  const handleTimelinePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (scrubPct === null) return;
    e.stopPropagation();
    const pct = getTimelinePctFromClientX(e.clientX);
    setScrubPct(null);
    seekToPercent(pct);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const handleRetry = () => {
    ytReadyRef.current = false;
    pendingPlayRef.current = false;
    setHasError(false);
    setIsLoadingMeta(true);
    setIsBuffering(false);
    setIsPlaying(false);
    setRetryNonce((n) => n + 1);
  };

  // حالة عدم توفر رابط فيديو: بطاقة هادئة
  if (!hasAnyVideo) {
    return (
      <div
        className={cn(
          'rounded-[20px] border border-[#E2E8F0] bg-[#F8FAFC] p-7 text-center dark:border-[#1E325C] dark:bg-[#070D1F]',
          className
        )}
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#2F6BFF]/10 text-[#2F6BFF]">
          <PlayCircle className="h-7 w-7 stroke-[1.5]" />
        </div>
        <h3 className="mt-4 text-xl font-bold text-[#0A1630] dark:text-white">
          فيديو الشرح قريباً
        </h3>
        <p className="mx-auto mt-2 max-w-md text-base leading-relaxed text-[#526077] dark:text-[#94A3B8]">
          فيديو {title || resolved.title} قيد التحضير، ويمكنك إكمال الدرس كاملاً بالشرح والرسوم الآن.
        </p>
        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="mt-5 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-5 text-sm font-semibold text-[#0A1630] transition-colors hover:border-[#2F6BFF] hover:text-[#2F6BFF] dark:border-[#1E325C] dark:bg-[#0A1630] dark:text-white"
          >
            <SkipBack className="h-4 w-4 stroke-[1.75]" />
            <span>تخطَّ الفيديو وتابع الدرس</span>
          </button>
        )}
      </div>
    );
  }

  // حالة خطأ التحميل: بطاقة أنيقة مع زر إعادة المحاولة
  if (hasError) {
    return (
      <div
        className={cn(
          'rounded-[20px] border border-[#E2E8F0] bg-[#F8FAFC] p-7 text-center dark:border-[#1E325C] dark:bg-[#070D1F]',
          className
        )}
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#2F6BFF]/10 text-[#2F6BFF]">
          <RotateCcw className="h-6 w-6 stroke-[1.5]" />
        </div>
        <h3 className="mt-4 text-xl font-bold text-[#0A1630] dark:text-white">
          تعذر تشغيل الفيديو
        </h3>
        <p className="mx-auto mt-2 max-w-md text-base leading-relaxed text-[#526077] dark:text-[#94A3B8]">
          تأكد من اتصال الشبكة ثم أعد المحاولة، أو تابع خطوات الدرس مباشرة.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleRetry}
            className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-full bg-[#2F6BFF] px-6 text-sm font-bold text-white transition-colors hover:bg-[#1E56E8]"
          >
            <RotateCcw className="h-4 w-4 stroke-[1.75]" />
            <span>حاول مرة أخرى</span>
          </button>
          {resolved.youtubeId && (
            <a
              href={`https://www.youtube.com/watch?v=${resolved.youtubeId}${
                clipStart > 0 ? `&t=${Math.floor(clipStart)}s` : ''
              }`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-5 text-sm font-semibold text-[#0A1630] dark:border-[#1E325C] dark:bg-[#0A1630] dark:text-white"
            >
              <span>افتح على يوتيوب</span>
              <ExternalLink className="h-4 w-4 stroke-[1.75]" />
            </a>
          )}
          {onSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-5 text-sm font-semibold text-[#526077] dark:border-[#1E325C] dark:bg-[#0A1630] dark:text-[#CBD5E1]"
            >
              <span>تخطَّ الفيديو</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // حصر الوقت الحالي بين 0 وإجمالي المقطع دائماً
  const rawRelative = Math.max(0, currentTime - clipStart);
  const clampedRelative =
    effectiveSpan > 0 ? Math.min(effectiveSpan, rawRelative) : 0;

  const displayedPct =
    scrubPct !== null
      ? Math.max(0, Math.min(1, scrubPct))
      : effectiveSpan > 0
      ? Math.max(0, Math.min(1, clampedRelative / effectiveSpan))
      : 0;

  const displayedCurrentSeconds =
    scrubPct !== null && effectiveSpan > 0
      ? displayedPct * effectiveSpan
      : clampedRelative;

  const thumbnailUrl =
    resolved.poster ||
    resolved.file?.poster ||
    (resolved.youtubeId
      ? `https://i.ytimg.com/vi/${resolved.youtubeId}/hqdefault.jpg`
      : '');
  const showCaptionsBtn = useYoutubeFallback
    ? ytHasCaptions
    : Boolean(activeSubtitlesUrl);
  const barVisible =
    controlsVisible ||
    !isPlaying ||
    scrubPct !== null ||
    openMenu !== 'none' ||
    mobileSettingsOpen;
  const isSliderActive = scrubPct !== null || hoverTimePct !== null;
  const previewPct = scrubPct !== null ? scrubPct : hoverTimePct;

  const showPosterCover = !hasStartedOnce || isLoadingMeta || clipEnded;
  const showPausedBackdrop =
    hasStartedOnce && !isPlaying && !isLoadingMeta && !clipEnded;

  const renderSettingsContent = (surface: 'popover' | 'sheet') => {
    const itemIdleClass =
      surface === 'popover'
        ? 'bg-white/10 text-white hover:bg-white/20'
        : 'bg-[#F1F5F9] text-[#0A1630] hover:bg-[#E2E8F0] dark:bg-white/10 dark:text-white dark:hover:bg-white/15';

    return (
      <div dir="rtl" className="space-y-4 text-right">
        {/* سرعة التشغيل */}
        <div>
          <p className="mb-2 text-xs font-bold text-[#94A3B8]">سرعة التشغيل</p>
          <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
            {PLAYBACK_RATES.map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => handleRateSelect(rate)}
                className={cn(
                  'flex min-h-[40px] items-center justify-center rounded-xl font-tabular text-xs font-bold transition-colors',
                  playbackRate === rate
                    ? 'bg-[#2F6BFF] text-white'
                    : itemIdleClass
                )}
              >
                {rate}x
              </button>
            ))}
          </div>
        </div>

        {/* الجودة (تظهر فقط إن توفر أكثر من خيار) */}
        {qualityOptions.length > 1 && (
          <div>
            <p className="mb-2 text-xs font-bold text-[#94A3B8]">الجودة</p>
            <div className="grid grid-cols-2 gap-1.5">
              {qualityOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleQualitySelect(opt.value)}
                  className={cn(
                    'flex min-h-[40px] items-center justify-between rounded-xl px-3 text-xs font-bold transition-colors',
                    selectedQuality === opt.value
                      ? 'bg-[#2F6BFF] text-white'
                      : itemIdleClass
                  )}
                >
                  <span>{opt.label}</span>
                  {selectedQuality === opt.value && (
                    <Check className="h-3.5 w-3.5" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* الترجمة النصية */}
        {showCaptionsBtn && (
          <button
            type="button"
            onClick={toggleCaptions}
            className={cn(
              'flex min-h-[44px] w-full items-center justify-between rounded-xl px-3.5 text-xs font-bold transition-colors',
              itemIdleClass
            )}
          >
            <span className="inline-flex items-center gap-2">
              <Captions className="h-4 w-4 stroke-[1.5]" />
              <span>الترجمة النصية ({activeSubtitlesLabel})</span>
            </span>
            <span className="text-[#60A5FA]">
              {captionsEnabled ? 'مفعّلة' : 'متوقفة'}
            </span>
          </button>
        )}
      </div>
    );
  };

  return (
    <div className={cn('space-y-3', className)}>
      {resolved.video?.chapterTitle && clipEndFixed !== null && isMetadataReady && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs font-bold text-[#2F6BFF]">
          <span>الفصل المرتبط: {resolved.video.chapterTitle}</span>
          <span className="font-tabular tabular-nums text-[#64748B] dark:text-[#94A3B8]">
            مدة المقطع: {formatDisplayTime(effectiveSpan)}
          </span>
        </div>
      )}

      <div
        ref={containerRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onMouseMove={scheduleAutoHide}
        className={cn(
          'group relative aspect-video w-full overflow-hidden rounded-[20px] bg-[#070D1F] shadow-[0_18px_40px_-16px_rgba(10,22,48,0.45)] select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6BFF]',
          isEffectiveFullscreen &&
            'fixed inset-0 z-[75] flex aspect-auto h-dvh w-screen items-center justify-center rounded-none bg-black'
        )}
      >
        {/* مشغل HTML5 الأساسي أو يوتيوب مع غلاف 300% لإخفاء شريط القناة والعلامات */}
        {!useYoutubeFallback ? (
          <video
            key={`${lessonId}-${retryNonce}`}
            ref={videoRef}
            src={hasHls ? undefined : activeMp4Url}
            poster={thumbnailUrl || undefined}
            preload="metadata"
            playsInline
            onLoadedMetadata={() => {
              const video = videoRef.current;
              setIsLoadingMeta(false);
              setIsBuffering(false);
              if (!video) return;
              const vidDur = video.duration || 0;
              setDuration(vidDur);
              video.playbackRate = playbackRateRef.current;

              const restore = pendingRestoreRef.current;
              if (restore) {
                pendingRestoreRef.current = null;
                const bound =
                  clipEndFixed !== null && vidDur > 0
                    ? Math.min(clipEndFixed, vidDur)
                    : vidDur || restore.time;
                const clamped = Math.max(clipStart, Math.min(bound, restore.time));
                video.currentTime = clamped;
                setCurrentTime(clamped);
                if (restore.shouldPlay) void video.play().catch(() => undefined);
                return;
              }

              const saved = readProgressMap()[lessonId];
              const boundEnd =
                clipEndFixed !== null
                  ? Math.min(clipEndFixed, vidDur || clipEndFixed)
                  : Math.max(0, vidDur - 4);
              if (
                saved &&
                saved.currentTime > clipStart + 2 &&
                saved.currentTime < boundEnd
              ) {
                const clampedSaved = Math.min(boundEnd, saved.currentTime);
                video.currentTime = clampedSaved;
                setCurrentTime(clampedSaved);
              } else if (clipStart > 0) {
                video.currentTime = clipStart;
                setCurrentTime(clipStart);
              }
            }}
            onWaiting={() => setIsBuffering(true)}
            onCanPlay={() => setIsBuffering(false)}
            onPlaying={() => {
              setIsBuffering(false);
              setIsLoadingMeta(false);
              setIsPlaying(true);
              setHasStartedOnce(true);
              setClipEnded(false);
            }}
            onTimeUpdate={() => {
              const video = videoRef.current;
              if (!video) return;
              const rawDur = video.duration || 0;
              const spanEnd =
                clipEndFixed !== null
                  ? rawDur > 0
                    ? Math.min(clipEndFixed, rawDur)
                    : clipEndFixed
                  : rawDur;
              const clamped =
                spanEnd > 0
                  ? Math.max(clipStart, Math.min(spanEnd, video.currentTime))
                  : Math.max(clipStart, video.currentTime);
              setCurrentTime(clamped);

              if (
                clipEndFixed !== null &&
                spanEnd > 0 &&
                video.currentTime >= spanEnd - 0.35
              ) {
                video.pause();
                setIsPlaying(false);
                setControlsVisible(true);
                setClipEnded(true);
                markProgressRef.current(spanEnd, rawDur);
              } else {
                markProgressRef.current(clamped, rawDur);
              }

              if (video.buffered.length > 0 && rawDur > 0) {
                const bufEnd = video.buffered.end(video.buffered.length - 1);
                setBufferedPct(Math.max(0, Math.min(100, (bufEnd / rawDur) * 100)));
              }
            }}
            onPlay={() => {
              setIsPlaying(true);
              setHasStartedOnce(true);
              setClipEnded(false);
            }}
            onPause={() => {
              setIsPlaying(false);
              setIsBuffering(false);
              setControlsVisible(true);
            }}
            onEnded={() => {
              setIsPlaying(false);
              setIsBuffering(false);
              setControlsVisible(true);
              if (clipEndFixed !== null) setClipEnded(true);
              if (videoRef.current) {
                const dur = videoRef.current.duration || 0;
                setCurrentTime(dur);
                markProgressRef.current(dur, dur);
              }
            }}
            onError={() => {
              setIsLoadingMeta(false);
              setIsBuffering(false);
              setHasError(true);
            }}
            className="h-full w-full object-contain"
          >
            {activeSubtitlesUrl && (
              <track
                kind="subtitles"
                src={activeSubtitlesUrl}
                srcLang="ar"
                label={activeSubtitlesLabel}
              />
            )}
          </video>
        ) : (
          <div
            style={
              isEffectiveFullscreen
                ? { width: 'min(100vw, calc(100dvh * 16 / 9))' }
                : undefined
            }
            className="pointer-events-none relative aspect-video w-full overflow-hidden"
          >
            <div className="pointer-events-none absolute inset-x-0 -top-[100%] h-[300%] w-full">
              <div
                key={`${lessonId}-${retryNonce}`}
                ref={ytHostRef}
                className="h-full w-full [&>iframe]:h-full [&>iframe]:w-full"
              />
            </div>
          </div>
        )}

        {/* الغلاف الكامل قبل البدء أو عند الانتهاء لإخفاء واجهة يوتيوب كلياً */}
        {showPosterCover && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[6] bg-[#070D1F]"
          >
            {thumbnailUrl && (
              <div
                style={{ backgroundImage: `url("${thumbnailUrl}")` }}
                className="h-full w-full bg-cover bg-center opacity-100"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#070D1F]/80 via-[#070D1F]/30 to-[#070D1F]/40" />
          </div>
        )}

        {/* غطاء هادئ عند الإيقاف المؤقت لإبراز زر التشغيل الأصلي للموقع */}
        {showPausedBackdrop && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[6] bg-[#070D1F]/55 backdrop-blur-[2px]"
          />
        )}

        {/* Skeleton أثناء تحميل البيانات الوصفية */}
        {isLoadingMeta && (
          <div className="pointer-events-none absolute inset-0 z-[7] animate-pulse bg-[#0A1630]/45" />
        )}

        {/* Click Shield: يلتقط كل النقرات والإيماءات ويمنع إطار يوتيوب من ابتلاعها */}
        <div
          role="presentation"
          onPointerUp={handleShieldPointerUp}
          style={{ touchAction: 'manipulation' }}
          className="absolute inset-0 z-10 cursor-pointer bg-transparent"
        />

        {/* زر تكبير/تصغير عائم واضح دائماً على الهاتف عند ظهور الضوابط */}
        <button
          type="button"
          dir="rtl"
          onClick={(e) => {
            e.stopPropagation();
            void toggleFullscreen();
          }}
          aria-label={isEffectiveFullscreen ? 'تصغير الفيديو' : 'تكبير الفيديو'}
          className={cn(
            'absolute left-2.5 z-30 inline-flex min-h-[34px] items-center gap-1.5 rounded-full bg-black/65 px-3 text-[11px] font-bold text-white backdrop-blur-md transition-opacity duration-200 hover:bg-black/80 active:scale-95',
            isEffectiveFullscreen
              ? 'top-[max(12px,env(safe-area-inset-top))] left-3'
              : 'top-2.5',
            barVisible
              ? 'pointer-events-auto opacity-100'
              : 'pointer-events-none opacity-0'
          )}
        >
          {isEffectiveFullscreen ? (
            <>
              <Minimize className="h-3.5 w-3.5 stroke-[2]" />
              <span>تصغير</span>
            </>
          ) : (
            <>
              <Maximize className="h-3.5 w-3.5 stroke-[2]" />
              <span>تكبير</span>
            </>
          )}
        </button>

        {/* مؤشر التقديم/التأخير عند النقر المزدوج */}
        {seekBadge && (
          <div
            className={cn(
              'pointer-events-none absolute top-[44%] z-20 -translate-y-1/2 rounded-full bg-black/75 px-4 py-2 font-tabular text-sm font-bold text-white backdrop-blur-md transition-transform sm:top-1/2',
              seekBadge.side === 'forward' ? 'right-5' : 'left-5'
            )}
          >
            {seekBadge.label}
          </div>
        )}

        {/* المنتصف: مؤشر تحميل أثناء التخزين المؤقت، أو زر واحد فقط عند الإيقاف/الانتهاء */}
        {(isLoadingMeta || isBuffering) && (
          <div className="pointer-events-none absolute top-[44%] left-1/2 z-20 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md sm:top-1/2 sm:h-14 sm:w-14">
            <Loader2 className="h-6 w-6 animate-spin stroke-[1.75] sm:h-7 sm:w-7" />
          </div>
        )}

        {!isLoadingMeta && !isBuffering && clipEnded && (
          <button
            type="button"
            onClick={replayClipOrRestart}
            className="absolute top-[44%] left-1/2 z-20 inline-flex min-h-[44px] -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full bg-[#2F6BFF] px-5 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95 sm:top-1/2 sm:min-h-[48px] sm:px-6"
          >
            <RotateCcw className="h-4 w-4 stroke-[1.75]" />
            <span>أعد المقطع</span>
          </button>
        )}

        {!isLoadingMeta && !isBuffering && !clipEnded && !isPlaying && (
          <button
            type="button"
            onClick={togglePlay}
            aria-label="تشغيل الفيديو"
            className="absolute top-[44%] left-1/2 z-20 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#2F6BFF] text-white shadow-[0_12px_32px_rgba(47,107,255,0.45)] transition-transform hover:scale-105 active:scale-95 sm:top-1/2 sm:h-16 sm:w-16"
          >
            <Play className="h-5 w-5 translate-x-0.5 fill-current stroke-[1.5] sm:h-7 sm:w-7" />
          </button>
        )}

        {/* تدرج خفيف للخلفية السفلية فقط (Scrim) */}
        <div
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-x-0 bottom-0 z-20 h-16 bg-gradient-to-t from-black/85 via-black/40 to-transparent transition-opacity duration-200 sm:h-20',
            barVisible ? 'opacity-100' : 'opacity-0'
          )}
        />

        {/* شريط الضوابط السفلي المضغوط (LTR زمنياً) */}
        <div
          dir="ltr"
          className={cn(
            'absolute inset-x-0 bottom-0 z-30 flex flex-col px-1.5 text-white transition-opacity duration-200 sm:px-3.5 sm:pb-1',
            isEffectiveFullscreen && 'px-3 pb-[max(8px,env(safe-area-inset-bottom))]',
            barVisible
              ? 'pointer-events-auto opacity-100'
              : 'pointer-events-none opacity-0'
          )}
        >
          {/* الشريط الزمني بعرض كامل مع Pointer Capture ومنطقة لمس موسعة */}
          <div
            ref={timelineRef}
            dir="ltr"
            role="slider"
            tabIndex={0}
            aria-label="شريط وقت الفيديو"
            aria-valuemin={0}
            aria-valuemax={Math.round(effectiveSpan)}
            aria-valuenow={Math.round(displayedCurrentSeconds)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight') {
                e.preventDefault();
                e.stopPropagation();
                seekBySeconds(5);
              } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                e.stopPropagation();
                seekBySeconds(-5);
              }
            }}
            onPointerDown={handleTimelinePointerDown}
            onPointerMove={handleTimelinePointerMove}
            onPointerUp={handleTimelinePointerUp}
            onPointerCancel={handleTimelinePointerUp}
            onPointerLeave={() => {
              if (scrubPct === null) setHoverTimePct(null);
            }}
            style={{ touchAction: 'none' }}
            className="relative z-10 flex h-3 w-full cursor-pointer items-center select-none before:absolute before:inset-x-0 before:-inset-y-4 before:content-[''] focus:outline-none"
          >
            {previewPct !== null && effectiveSpan > 0 && (
              <span
                style={{ left: `${Math.max(4, Math.min(96, previewPct * 100))}%` }}
                className="pointer-events-none absolute -top-7 -translate-x-1/2 rounded-full bg-[#0A1630]/95 px-2 py-0.5 font-tabular tabular-nums text-[11px] font-semibold text-white shadow"
              >
                {formatDisplayTime(previewPct * effectiveSpan)}
              </span>
            )}

            <div
              className={cn(
                'relative w-full overflow-visible rounded-full bg-white/25 transition-[height] duration-150',
                isSliderActive ? 'h-2' : 'h-1'
              )}
            >
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-white/35"
                style={{ width: `${bufferedPct}%` }}
              />
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-[#2F6BFF]"
                style={{ width: `${displayedPct * 100}%` }}
              />
              {/* علامات الفصول عند توفر توقيتاتها */}
              {effectiveSpan > 0 &&
                timedChapters.map((ch) => {
                  const markerPct = ((ch.start - clipStart) / effectiveSpan) * 100;
                  return (
                    <span
                      key={ch.id}
                      title={ch.title}
                      style={{ left: `${markerPct}%` }}
                      className="absolute top-0 bottom-0 z-10 w-1 -translate-x-1/2 rounded-full bg-white"
                    />
                  );
                })}
              {/* نقطة مقبض السحب */}
              {effectiveSpan > 0 && (
                <span
                  style={{ left: `${displayedPct * 100}%` }}
                  className={cn(
                    'pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow transition-transform',
                    isSliderActive
                      ? 'h-3.5 w-3.5 scale-100'
                      : 'h-2.5 w-2.5 scale-0 sm:group-hover:scale-100'
                  )}
                />
              )}
            </div>
          </div>

          {/* صف الأزرار الواحد مضغوط على الهاتف ليظهر زر ملء الشاشة كاملاً */}
          <div className="relative z-20 flex h-10 w-full min-w-0 items-center justify-between gap-0 sm:h-11 sm:gap-1">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-white/15 sm:h-10 sm:w-10"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4 stroke-[1.75] sm:h-[18px] sm:w-[18px]" />
              ) : (
                <Play className="h-4 w-4 stroke-[1.75] sm:h-[18px] sm:w-[18px]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => seekBySeconds(-10)}
              aria-label="تأخير 10 ثوانٍ"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-white/15 sm:h-10 sm:w-10"
            >
              <Rewind className="h-4 w-4 stroke-[1.75] sm:h-[17px] sm:w-[17px]" />
            </button>

            <button
              type="button"
              onClick={() => seekBySeconds(10)}
              aria-label="تقديم 10 ثوانٍ"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-white/15 sm:h-10 sm:w-10"
            >
              <FastForward className="h-4 w-4 stroke-[1.75] sm:h-[17px] sm:w-[17px]" />
            </button>

            {/* الصوت للكمبيوتر والشاشات المتوسطة */}
            <div className="hidden items-center gap-1 sm:flex">
              <button
                type="button"
                onClick={toggleMute}
                aria-label={isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-white/15 sm:h-10 sm:w-10"
              >
                {isMuted ? (
                  <VolumeX className="h-[17px] w-[17px] stroke-[1.75]" />
                ) : (
                  <Volume2 className="h-[17px] w-[17px] stroke-[1.75]" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                aria-label="مستوى الصوت"
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="hidden h-1 w-16 cursor-pointer accent-[#2F6BFF] md:block"
              />
            </div>

            {/* الوقت بصيغة LTR موحدة: الحالي / الإجمالي */}
            <span
              dir="ltr"
              className="shrink-0 whitespace-nowrap px-1 font-tabular tabular-nums text-[10px] font-medium text-white/95 sm:px-1.5 sm:text-xs"
            >
              {formatDisplayTime(displayedCurrentSeconds, {
                ready: isMetadataReady,
              })}{' '}
              /{' '}
              {formatDisplayTime(effectiveSpan, {
                ready: isMetadataReady,
                isTotal: true,
              })}
            </span>

            <div className="min-w-0 flex-1" />

            {/* الفصول على الكمبيوتر إن توفرت توقيتاتها */}
            {timedChapters.length > 0 && (
              <div className="relative hidden md:block">
                <button
                  type="button"
                  onClick={() =>
                    setOpenMenu(openMenu === 'chapters' ? 'none' : 'chapters')
                  }
                  aria-label="فصول الفيديو"
                  className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/15"
                >
                  <ListVideo className="h-[17px] w-[17px] stroke-[1.75]" />
                </button>
                {openMenu === 'chapters' && (
                  <div
                    dir="rtl"
                    className="absolute right-0 bottom-12 z-40 w-60 rounded-2xl border border-white/15 bg-[#0A1630]/95 p-1.5 shadow-xl backdrop-blur-md"
                  >
                    {timedChapters.map((ch) => (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => {
                          seekToAbsolute(ch.start);
                          setOpenMenu('none');
                          if (!isPlaying) togglePlay();
                        }}
                        className="flex min-h-[38px] w-full items-center justify-between gap-2 rounded-xl px-2.5 text-right text-xs text-white/90 hover:bg-white/10"
                      >
                        <span className="truncate">{ch.title}</span>
                        <span className="font-tabular tabular-nums text-[11px] text-[#93C5FD]">
                          {formatDisplayTime(ch.start - clipStart)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* شارة السرعة الحالية */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  if (isMobile && !isFullscreen) {
                    setMobileSettingsOpen(true);
                  } else {
                    setOpenMenu(openMenu === 'speed' ? 'none' : 'speed');
                  }
                }}
                aria-label="سرعة التشغيل"
                className="flex h-8 min-w-[32px] shrink-0 items-center justify-center rounded-full px-1.5 font-tabular tabular-nums text-[11px] font-semibold hover:bg-white/15 sm:h-10 sm:min-w-[40px] sm:px-2 sm:text-xs"
              >
                {playbackRate}x
              </button>
              {(!isMobile || isFullscreen) && openMenu === 'speed' && (
                <div className="absolute right-0 bottom-12 z-40 w-24 rounded-2xl border border-white/15 bg-[#0A1630]/95 p-1 shadow-xl backdrop-blur-md">
                  {PLAYBACK_RATES.map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => handleRateSelect(rate)}
                      className={cn(
                        'flex min-h-[36px] w-full items-center justify-center rounded-xl font-tabular text-xs font-semibold',
                        playbackRate === rate
                          ? 'bg-[#2F6BFF] text-white'
                          : 'text-white/80 hover:bg-white/10'
                      )}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* زر الإعدادات الموحدة (BottomSheet على الهاتف، منبثقة على الكمبيوتر) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  if (isMobile && !isFullscreen) {
                    setMobileSettingsOpen(true);
                  } else {
                    setOpenMenu(openMenu === 'settings' ? 'none' : 'settings');
                  }
                }}
                aria-label="إعدادات الفيديو"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-white/15 sm:h-10 sm:w-10"
              >
                <Settings className="h-4 w-4 stroke-[1.75] sm:h-[17px] sm:w-[17px]" />
              </button>

              {(!isMobile || isFullscreen) && openMenu === 'settings' && (
                <div className="absolute right-0 bottom-12 z-40 w-64 rounded-2xl border border-white/15 bg-[#0A1630]/95 p-3.5 text-white shadow-xl backdrop-blur-md">
                  {renderSettingsContent('popover')}
                </div>
              )}
            </div>

            {/* ملء الشاشة */}
            <button
              type="button"
              onClick={() => void toggleFullscreen()}
              aria-label={isEffectiveFullscreen ? 'إنهاء ملء الشاشة' : 'ملء الشاشة'}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-white/15 sm:h-10 sm:w-10"
            >
              {isEffectiveFullscreen ? (
                <Minimize className="h-4 w-4 stroke-[1.75] sm:h-[17px] sm:w-[17px]" />
              ) : (
                <Maximize className="h-4 w-4 stroke-[1.75] sm:h-[17px] sm:w-[17px]" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* قائمة فصول قابلة للنقر أسفل المشغل إن توفرت التوقيتات */}
      {timedChapters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {timedChapters.map((ch) => (
            <button
              key={ch.id}
              type="button"
              onClick={() => {
                seekToAbsolute(ch.start);
                if (!isPlaying) togglePlay();
              }}
              className="inline-flex min-h-[38px] items-center gap-2 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 text-xs font-semibold text-[#0A1630] transition-colors hover:border-[#2F6BFF] hover:text-[#2F6BFF] dark:border-[#1E325C] dark:bg-[#070D1F] dark:text-white"
            >
              <span className="font-tabular tabular-nums text-[#2F6BFF]">
                {formatDisplayTime(ch.start - clipStart)}
              </span>
              <span>{ch.title}</span>
            </button>
          ))}
        </div>
      )}

      {onSkip && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onSkip}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full px-4 text-sm font-semibold text-[#526077] hover:text-[#2F6BFF] dark:text-[#94A3B8]"
          >
            <span>تخطَّ الفيديو</span>
          </button>
        </div>
      )}

      {/* نافذة إعدادات الفيديو الموحدة للهاتف (< md) */}
      <BottomSheet
        open={mobileSettingsOpen}
        onOpenChange={setMobileSettingsOpen}
        title="إعدادات الفيديو"
      >
        <div className="space-y-4">
          {renderSettingsContent('sheet')}
          {timedChapters.length > 0 && (
            <div dir="rtl">
              <p className="mb-2 text-xs font-bold text-[#94A3B8]">الفصول</p>
              <div className="space-y-1.5">
                {timedChapters.map((ch) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => {
                      seekToAbsolute(ch.start);
                      setMobileSettingsOpen(false);
                      if (!isPlaying) togglePlay();
                    }}
                    className="flex min-h-[42px] w-full items-center justify-between rounded-xl bg-[#F1F5F9] px-3.5 text-right text-xs font-semibold text-[#0A1630] dark:bg-white/10 dark:text-white"
                  >
                    <span>{ch.title}</span>
                    <span className="font-tabular tabular-nums text-[#2F6BFF]">
                      {formatDisplayTime(ch.start - clipStart)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </BottomSheet>
    </div>
  );
}
