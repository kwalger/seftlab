export type LessonVideoQuality = 'auto' | '360p' | '480p' | '720p' | '1080p';

export interface LessonVideoSource {
  quality: Exclude<LessonVideoQuality, 'auto'>;
  url: string;
}

export interface LessonFileVideoSource {
  src: string;
  label: string;
}

export interface LessonFileVideoSpec {
  provider?: 'file';
  sources: LessonFileVideoSource[];
  hlsUrl?: string;
  poster?: string;
  subtitlesUrl?: string;
  subtitlesLabel?: string;
}

export interface VideoChapter {
  id: number;
  title: string;
  start: number | null;
  end?: number | null;
}

export interface LessonYoutubeVideoSpec {
  provider: 'youtube';
  id: string;
  title?: string;
  start: number | null;
  end: number | null;
  chapterNumber?: number;
  chapterTitle?: string;
  chapters?: VideoChapter[];
}

export interface LessonVideoConfig {
  lessonId: string;
  title: string;
  provider?: 'file' | 'youtube';
  url: string;
  hlsUrl?: string;
  youtubeId?: string;
  poster?: string;
  subtitlesUrl?: string;
  subtitlesLabel?: string;
  sources?: LessonVideoSource[];
  file?: LessonFileVideoSpec;
  video?: LessonYoutubeVideoSpec;
  showBeforeTimestamps?: boolean;
}

export const ACCOUNTING_OVERVIEW_YOUTUBE_ID = 'lGjj4ggsOmk';
export const ACCOUNTING_OVERVIEW_TITLE = 'أساسيات المحاسبة المالية';

export const ACCOUNTING_VIDEO_CHAPTERS: VideoChapter[] = [
  { id: 1, title: 'المحاسبة كنظام معلومات مالي', start: null },
  { id: 2, title: 'التطور التاريخي للفكر المحاسبي', start: null },
  { id: 3, title: 'معادلة الميزانية', start: null },
  { id: 4, title: 'الفروض والمبادئ المحاسبية', start: null },
  { id: 5, title: 'الدورة المستندية والدفاتر', start: null },
];

export const LESSON_VIDEOS: Record<string, LessonVideoConfig> = {
  'u1-lesson-0': {
    lessonId: 'u1-lesson-0',
    title: 'نظرة عامة على الوحدة',
    url: '',
    showBeforeTimestamps: true,
    file: {
      sources: [{ src: '', label: '720p' }],
      poster: '',
    },
    video: {
      provider: 'youtube',
      id: '1jz_Q7ENNSU',
      title: 'نظرة عامة على الوحدة',
      start: null,
      end: null,
      chapters: ACCOUNTING_VIDEO_CHAPTERS,
    },
  },
  'u1-lesson-1': {
    lessonId: 'u1-lesson-1',
    title: 'ما هي المحاسبة؟',
    url: '',
    showBeforeTimestamps: true,
    file: {
      sources: [{ src: '', label: '720p' }],
      poster: '',
    },
    video: {
      provider: 'youtube',
      id: 'C51-vrsK-8A',
      title: 'ما هي المحاسبة؟',
      start: null,
      end: null,
      chapterNumber: 1,
      chapterTitle: 'المحاسبة كنظام معلومات مالي',
    },
  },
  'u1-lesson-2': {
    lessonId: 'u1-lesson-2',
    title: 'لماذا نحتاج المحاسبة؟',
    url: '',
    showBeforeTimestamps: true,
    file: {
      sources: [{ src: '', label: '720p' }],
      poster: '',
    },
    video: {
      provider: 'youtube',
      id: 'lMOw68Bln00',
      title: 'لماذا نحتاج المحاسبة؟',
      start: null,
      end: null,
      chapterNumber: 1,
      chapterTitle: 'المحاسبة كنظام معلومات مالي',
    },
  },
  'u1-lesson-3': {
    lessonId: 'u1-lesson-3',
    title: 'من يستفيد من المعلومات المحاسبية؟',
    url: '',
    showBeforeTimestamps: true,
    file: {
      sources: [{ src: '', label: '720p' }],
      poster: '',
    },
    video: {
      provider: 'youtube',
      id: 'F9OQJNMcrfs',
      title: 'من يستفيد من المعلومات المحاسبية؟',
      start: null,
      end: null,
      chapterNumber: 1,
      chapterTitle: 'المحاسبة كنظام معلومات مالي',
    },
  },
  'u1-lesson-4': {
    lessonId: 'u1-lesson-4',
    title: 'من أين بدأت المحاسبة؟',
    url: '',
    showBeforeTimestamps: true,
    file: {
      sources: [{ src: '', label: '720p' }],
      poster: '',
    },
    video: {
      provider: 'youtube',
      id: 'LEMXYWDzCfI',
      title: 'من أين بدأت المحاسبة؟',
      start: null,
      end: null,
      chapterNumber: 2,
      chapterTitle: 'التطور التاريخي للفكر المحاسبي',
    },
  },
  'u1-lesson-5': {
    lessonId: 'u1-lesson-5',
    title: 'أنواع المحاسبة',
    url: '',
    showBeforeTimestamps: true,
    file: {
      sources: [{ src: '', label: '720p' }],
      poster: '',
    },
    video: {
      provider: 'youtube',
      id: 'GBZynzSHtHE',
      title: 'أنواع المحاسبة',
      start: null,
      end: null,
      chapterNumber: 1,
      chapterTitle: 'أنواع المحاسبة وفروعها',
    },
  },
  'u1-lesson-6': {
    lessonId: 'u1-lesson-6',
    title: 'المحاسبة وعلاقتها بالعلوم الأخرى',
    url: '',
    showBeforeTimestamps: true,
    file: {
      sources: [{ src: '', label: '720p' }],
      poster: '',
    },
    video: {
      provider: 'youtube',
      id: 'ecel9OVdbzM',
      title: 'المحاسبة وعلاقتها بالعلوم الأخرى',
      start: null,
      end: null,
      chapterNumber: 2,
      chapterTitle: 'المحاسبة والعلوم الأخرى',
    },
  },
  'u1-lesson-7': {
    lessonId: 'u1-lesson-7',
    title: 'المفاهيم المحاسبية الأساسية',
    url: '',
    showBeforeTimestamps: true,
    file: {
      sources: [{ src: '', label: '720p' }],
      poster: '',
    },
    video: {
      provider: 'youtube',
      id: '_Vu5AHnI2j0',
      title: 'المفاهيم المحاسبية الأساسية',
      start: null,
      end: null,
      chapterNumber: 3,
      chapterTitle: 'معادلة الميزانية والمفاهيم الأساسية',
    },
  },
  'u1-lesson-8': {
    lessonId: 'u1-lesson-8',
    title: 'الفروض المحاسبية',
    url: '',
    showBeforeTimestamps: true,
    file: {
      sources: [{ src: '', label: '720p' }],
      poster: '',
    },
    video: {
      provider: 'youtube',
      id: 'Ci6Vsmvx4b0',
      title: 'الفروض المحاسبية',
      start: null,
      end: null,
      chapterNumber: 4,
      chapterTitle: 'الفروض والمبادئ المحاسبية',
    },
  },
  'u1-lesson-9': {
    lessonId: 'u1-lesson-9',
    title: 'المبادئ المحاسبية',
    url: '',
    showBeforeTimestamps: true,
    file: {
      sources: [{ src: '', label: '720p' }],
      poster: '',
    },
    video: {
      provider: 'youtube',
      id: 'sgtVo_H0_yE',
      title: 'المبادئ المحاسبية',
      start: null,
      end: null,
      chapterNumber: 4,
      chapterTitle: 'الفروض والمبادئ المحاسبية',
    },
  },
  'u1-lesson-10': {
    lessonId: 'u1-lesson-10',
    title: 'السياسات المحاسبية',
    url: '',
    showBeforeTimestamps: true,
    file: {
      sources: [{ src: '', label: '720p' }],
      poster: '',
    },
    video: {
      provider: 'youtube',
      id: 'wEJSdz8S-bc',
      title: 'السياسات المحاسبية',
      start: null,
      end: null,
      chapterNumber: 4,
      chapterTitle: 'الفروض والمبادئ والسياسات المحاسبية',
    },
  },
  'u1-lesson-11': {
    lessonId: 'u1-lesson-11',
    title: 'المحاسبة كنظام للمعلومات',
    url: '',
    showBeforeTimestamps: true,
    file: {
      sources: [{ src: '', label: '720p' }],
      poster: '',
    },
    video: {
      provider: 'youtube',
      id: 'oLS7ANz3NIU',
      title: 'المحاسبة كنظام للمعلومات',
      start: null,
      end: null,
      chapterNumber: 5,
      chapterTitle: 'الدورة المستندية والدفاتر ونظام المعلومات',
    },
  },
  'u1-lesson-12': {
    lessonId: 'u1-lesson-12',
    title: 'مراجعة الوحدة والاختبار الختامي',
    url: '',
    showBeforeTimestamps: true,
    file: {
      sources: [{ src: '', label: '720p' }],
      poster: '',
    },
    video: {
      provider: 'youtube',
      id: 'qlE-WDuA8Rg',
      title: 'مراجعة الوحدة والاختبار الختامي',
      start: null,
      end: null,
      chapterNumber: 5,
      chapterTitle: 'مراجعة الوحدة الأولى والاختبار الختامي',
      chapters: ACCOUNTING_VIDEO_CHAPTERS,
    },
  },
  'u2-lesson-0': {
    lessonId: 'u2-lesson-0',
    title: 'نظرة عامة على الوحدة',
    url: 'https://youtu.be/FEFoegdSSFQ',
    showBeforeTimestamps: true,
    file: {
      sources: [{ src: '', label: '720p' }],
      poster: '',
    },
    video: {
      provider: 'youtube',
      id: 'FEFoegdSSFQ',
      title: 'نظرة عامة على الوحدة',
      start: null,
      end: null,
      chapters: ACCOUNTING_VIDEO_CHAPTERS,
    },
  },
  'u2-lesson-1': {
    lessonId: 'u2-lesson-1',
    title: 'ماهية الدورة المحاسبية',
    url: 'https://youtu.be/yC8-gGantZo',
    video: {
      provider: 'youtube',
      id: 'yC8-gGantZo',
      title: 'ماهية الدورة المحاسبية',
      start: null,
      end: null,
      chapterNumber: 1,
      chapterTitle: 'ماهية الدورة المحاسبية',
    },
  },
  'u2-lesson-2': {
    lessonId: 'u2-lesson-2',
    title: 'التفرقة بين العمليات المالية وغير المالية',
    url: 'https://youtu.be/JodwCdcUiO8',
    video: {
      provider: 'youtube',
      id: 'JodwCdcUiO8',
      title: 'التفرقة بين العمليات المالية وغير المالية',
      start: null,
      end: null,
      chapterNumber: 2,
      chapterTitle: 'التفرقة بين العمليات المالية وغير المالية',
    },
  },
  'u2-lesson-3': {
    lessonId: 'u2-lesson-3',
    title: 'التعرف على معادلة الميزانية',
    url: 'https://youtu.be/tcxIok6Vafg',
    video: {
      provider: 'youtube',
      id: 'tcxIok6Vafg',
      title: 'التعرف على معادلة الميزانية',
      start: null,
      end: null,
      chapterNumber: 3,
      chapterTitle: 'التعرف على معادلة الميزانية',
    },
  },
  'u2-lesson-4': {
    lessonId: 'u2-lesson-4',
    title: 'معرفة أثر العمليات المالية على معادلة الميزانية',
    url: 'https://youtu.be/OyzI0ECrIiM',
    video: {
      provider: 'youtube',
      id: 'OyzI0ECrIiM',
      title: 'معرفة أثر العمليات المالية على معادلة الميزانية',
      start: null,
      end: null,
      chapterNumber: 4,
      chapterTitle: 'معرفة أثر العمليات المالية على معادلة الميزانية',
    },
  },
  'u2-lesson-5': {
    lessonId: 'u2-lesson-5',
    title: 'التعرف على القوائم المالية',
    url: 'https://youtu.be/PihVhrKl0p8',
    video: {
      provider: 'youtube',
      id: 'PihVhrKl0p8',
      title: 'التعرف على القوائم المالية',
      start: null,
      end: null,
      chapterNumber: 5,
      chapterTitle: 'التعرف على القوائم المالية',
    },
  },
  'u2-lesson-6': {
    lessonId: 'u2-lesson-6',
    title: 'معرفة العلاقة بين القوائم المالية',
    url: 'https://youtu.be/uEdc4gV-BS8',
    video: {
      provider: 'youtube',
      id: 'uEdc4gV-BS8',
      title: 'معرفة العلاقة بين القوائم المالية',
      start: null,
      end: null,
      chapterNumber: 6,
      chapterTitle: 'معرفة العلاقة بين القوائم المالية',
    },
  },
  'u2-lesson-7': {
    lessonId: 'u2-lesson-7',
    title: 'معرفة العلاقة بين القوائم المالية',
    url: 'https://youtu.be/uEdc4gV-BS8',
    video: {
      provider: 'youtube',
      id: 'uEdc4gV-BS8',
      title: 'معرفة العلاقة بين القوائم المالية',
      start: null,
      end: null,
      chapterNumber: 6,
      chapterTitle: 'معرفة العلاقة بين القوائم المالية',
    },
  },
  'u3-lesson-1': {
    lessonId: 'u3-lesson-1',
    title: 'مقدمة الدورة المستندية والدفاتر',
    url: '',
    video: {
      provider: 'youtube',
      id: ACCOUNTING_OVERVIEW_YOUTUBE_ID,
      title: ACCOUNTING_OVERVIEW_TITLE,
      start: null,
      end: null,
      chapterNumber: 5,
      chapterTitle: 'الدورة المستندية والدفاتر',
    },
  },
};

export const VIDEO_OVERRIDES_STORAGE_KEY = 'seftlab-lesson-video-overrides-v1';
export const VIDEO_REQUIRE_WATCH_STORAGE_KEY =
  'seftlab-require-video-watch-v1';

export function extractYoutubeId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const match = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

export function resolveVideoConfigFromRawUrl(
  base: LessonVideoConfig,
  rawUrl: string
): LessonVideoConfig {
  const cleaned = rawUrl.trim();
  if (!cleaned) {
    return { ...base };
  }
  const ytId = extractYoutubeId(cleaned);
  if (ytId) {
    return {
      ...base,
      provider: 'youtube',
      url: '',
      hlsUrl: undefined,
      youtubeId: ytId,
      video: base.video
        ? { ...base.video, id: ytId }
        : {
            provider: 'youtube',
            id: ytId,
            title: base.title,
            start: null,
            end: null,
          },
    };
  }
  if (/\.m3u8($|\?)/i.test(cleaned)) {
    return {
      ...base,
      provider: 'file',
      url: '',
      hlsUrl: cleaned,
      youtubeId: undefined,
      video: undefined,
    };
  }
  return {
    ...base,
    provider: 'file',
    url: cleaned,
    hlsUrl: undefined,
    youtubeId: undefined,
    video: undefined,
  };
}

export function readLessonVideoOverrides(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(VIDEO_OVERRIDES_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, string>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function writeLessonVideoOverrides(
  overrides: Record<string, string>
): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      VIDEO_OVERRIDES_STORAGE_KEY,
      JSON.stringify(overrides)
    );
  } catch {
    // تجاهل أخطاء التخزين في التصفح الخاص
  }
}

export function getResolvedLessonVideo(lessonId: string): LessonVideoConfig {
  const base: LessonVideoConfig = LESSON_VIDEOS[lessonId] || {
    lessonId,
    title: 'فيديو الدرس',
    url: '',
  };
  const overrides = readLessonVideoOverrides();
  const overrideUrl = overrides[lessonId];
  if (overrideUrl !== undefined) {
    if (!overrideUrl.trim()) {
      return {
        ...base,
        provider: undefined,
        url: '',
        hlsUrl: undefined,
        youtubeId: undefined,
        file: undefined,
        video: undefined,
      };
    }
    return resolveVideoConfigFromRawUrl(base, overrideUrl);
  }

  // الأولوية للملف الخاص (MP4 أو HLS) متى ما وُجد رابط غير فارغ
  const validFileSources = (base.file?.sources || []).filter((s) =>
    Boolean(s.src && s.src.trim())
  );
  const fileHlsUrl = base.file?.hlsUrl?.trim();
  if (validFileSources.length > 0 || fileHlsUrl) {
    const primaryUrl = validFileSources[0]?.src.trim() || '';
    return {
      ...base,
      provider: 'file',
      url: primaryUrl,
      sources: validFileSources.map((s) => ({
        quality: (['360p', '480p', '720p', '1080p'].includes(s.label)
          ? s.label
          : '720p') as Exclude<LessonVideoQuality, 'auto'>,
        url: s.src.trim(),
      })),
      file: {
        provider: 'file',
        sources: validFileSources.map((s) => ({
          src: s.src.trim(),
          label: s.label,
        })),
        hlsUrl: fileHlsUrl || undefined,
        poster: base.file?.poster?.trim() || undefined,
        subtitlesUrl: base.file?.subtitlesUrl?.trim() || undefined,
        subtitlesLabel: base.file?.subtitlesLabel,
      },
      hlsUrl: fileHlsUrl || base.hlsUrl,
      poster: base.file?.poster?.trim() || base.poster,
      subtitlesUrl: base.file?.subtitlesUrl?.trim() || base.subtitlesUrl,
      subtitlesLabel: base.file?.subtitlesLabel || base.subtitlesLabel,
      youtubeId: undefined,
    };
  }

  if (base.url || base.hlsUrl || (base.sources && base.sources.length > 0)) {
    if (base.url) {
      return resolveVideoConfigFromRawUrl(base, base.url);
    }
    return {
      ...base,
      provider: 'file',
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

export function getRequireVideoWatchBeforeNext(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return (
      window.localStorage.getItem(VIDEO_REQUIRE_WATCH_STORAGE_KEY) === 'true'
    );
  } catch {
    return false;
  }
}

export function setRequireVideoWatchBeforeNext(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      VIDEO_REQUIRE_WATCH_STORAGE_KEY,
      enabled ? 'true' : 'false'
    );
  } catch {
    // تجاهل أخطاء التخزين في التصفح الخاص
  }
}
