'use client';

import React, { useState, useSyncExternalStore } from 'react';
import { Save, Video } from 'lucide-react';
import { toast } from 'sonner';
import {
  getRequireVideoWatchBeforeNext,
  LESSON_VIDEOS,
  readLessonVideoOverrides,
  setRequireVideoWatchBeforeNext,
  writeLessonVideoOverrides,
} from '@/data/lessonVideos';
import { UNIT1_LESSONS_META } from '@/lib/labs/accounting/unit1-lessons';
import { ChartCard } from '@/components/dashboard/ui-kit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function LessonVideosSettingsCard() {
  const isClient = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false
  );

  const [draftUrls, setDraftUrls] = useState<Record<string, string>>({});
  const [draftRequireWatch, setDraftRequireWatch] = useState<boolean | null>(
    null
  );

  const storedOverrides = isClient ? readLessonVideoOverrides() : {};
  const requireWatch =
    draftRequireWatch !== null
      ? draftRequireWatch
      : isClient
      ? getRequireVideoWatchBeforeNext()
      : false;

  const getValueForLesson = (lessonId: string) => {
    if (draftUrls[lessonId] !== undefined) return draftUrls[lessonId];
    if (storedOverrides[lessonId] !== undefined) return storedOverrides[lessonId];
    return LESSON_VIDEOS[lessonId]?.url || '';
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const merged: Record<string, string> = {};
    for (const lesson of UNIT1_LESSONS_META) {
      merged[lesson.id] = getValueForLesson(lesson.id).trim();
    }
    writeLessonVideoOverrides(merged);
    setRequireVideoWatchBeforeNext(requireWatch);
    toast.success('تم حفظ روابط فيديو دروس الوحدة الأولى بنجاح');
  };

  return (
    <ChartCard
      title="روابط فيديو دروس الوحدة الأولى (مختبر المحاسبة)"
      subtitle="أدخل رابط فيديو مباشر أو رابط بث أو معرّف يوتيوب لكل درس تمهيداً لإتاحة المشاهدة للطلاب."
      className="mt-6"
    >
      <form onSubmit={handleSave} className="space-y-4">
        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-[14px] border border-[#E3E8F0] bg-[#FAFBFC] p-3.5 text-sm dark:border-[#1E325C] dark:bg-[#0A1630]">
          <span className="font-semibold text-[#0A1630] dark:text-[#FAFBFC]">
            اشترط مشاهدة الفيديو قبل زر التالي
          </span>
          <input
            type="checkbox"
            checked={requireWatch}
            onChange={(e) => setDraftRequireWatch(e.target.checked)}
            className="h-4 w-4 accent-[#2F6BFF]"
          />
        </label>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {UNIT1_LESSONS_META.map((lesson) => (
            <div
              key={lesson.id}
              className="rounded-[12px] border border-[#E3E8F0] bg-[#FAFBFC] p-3 dark:border-[#1E325C] dark:bg-[#0A1630]"
            >
              <Label
                htmlFor={`video-${lesson.id}`}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#0A1630] dark:text-[#FAFBFC]"
              >
                <Video className="h-3.5 w-3.5 text-[#2F6BFF]" />
                <span>
                  الدرس {lesson.lessonNumber}: {lesson.title}
                </span>
              </Label>
              <Input
                id={`video-${lesson.id}`}
                dir="ltr"
                value={getValueForLesson(lesson.id)}
                onChange={(e) =>
                  setDraftUrls((prev) => ({
                    ...prev,
                    [lesson.id]: e.target.value,
                  }))
                }
                placeholder="رابط الفيديو (MP4 أو HLS أو يوتيوب)"
                className="mt-1.5 text-xs"
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-1">
          <Button type="submit" size="sm" className="gap-1.5">
            <Save className="h-3.5 w-3.5 stroke-[1.5]" />
            <span>حفظ روابط الفيديو</span>
          </Button>
        </div>
      </form>
    </ChartCard>
  );
}
