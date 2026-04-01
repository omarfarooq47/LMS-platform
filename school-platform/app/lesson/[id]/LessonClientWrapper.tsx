"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { LessonEditor } from '@/components/LessonEditor';
import { Button } from '@/components/ui-therapy/button';
import { updateLessonBlocks, markLessonCompleted, addComment, updateCourseCurriculum, updateLessonTitle } from './actions';
import { Clock, Send, ChevronLeft, ArrowUp, ArrowDown, Trash2, FolderPlus } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useEditorStore } from '@/store/editorStore';

type CurriculumItem =
  | { type: 'lesson'; itemId: string }
  | { type: 'section'; itemId: string; title: string };

export function LessonClientWrapper({ 
  lesson, 
  courseLessons, 
  currentCourse,
  courseCurriculum,
  newsItems,
  comments, 
  canEdit,
  userId
}: any) {
  const [timeSpent, setTimeSpent] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [lessonTitle, setLessonTitle] = useState(lesson.title);
  // Flat curriculum list — sections and lessons interleaved
  const [curriculum, setCurriculum] = useState<CurriculumItem[]>(() => {
    const saved: CurriculumItem[] = courseCurriculum ?? [];
    if (saved.length > 0) return saved;
    // Default: all lessons, no sections
    return (courseLessons ?? []).map((l: any) => ({ type: 'lesson' as const, itemId: l._id }));
  });
  // Track which section item is being renamed
  const [renamingId, setRenamingId] = useState<string | null>(null);
  // Hover state for tooltip on each item
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout>(null);
  const REQUIRED_TIME_SECONDS = 60;

  const isEditing = useEditorStore((s) => s.isEditing);

  // Lookup map for lesson details
  const lessonById = Object.fromEntries(
    (courseLessons ?? []).map((l: any) => [l._id, l])
  );

  // Lesson number = position among lesson-type items
  const lessonPositions: Record<string, number> = {};
  let lessonCount = 0;
  for (const item of curriculum) {
    if (item.type === 'lesson') {
      lessonPositions[item.itemId] = lessonCount++;
    }
  }

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [lesson._id]);

  useEffect(() => {
    if (timeSpent >= REQUIRED_TIME_SECONDS && !isCompleted) {
      setIsCompleted(true);
      markLessonCompleted(lesson._id, timeSpent).catch(console.error);
    }
  }, [timeSpent, isCompleted, lesson._id]);

  const handleSaveBlocks = async (blocks: any[]) => {
    try {
      await updateLessonBlocks(lesson._id, blocks);
      alert("Lesson saved successfully! ✅");
    } catch {
      alert("Error saving lesson.");
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    try {
      await addComment(lesson._id, newComment);
      setNewComment("");
      window.location.reload();
    } catch {
      alert("Error posting comment");
    }
  };

  // Persist curriculum to DB
  const persistCurriculum = async (next: CurriculumItem[]) => {
    if (!currentCourse?._id) return;
    try {
      await updateCourseCurriculum(currentCourse._id, next);
    } catch {
      console.error('Failed to save curriculum');
    }
  };

  const moveItem = (idx: number, direction: 'up' | 'down') => {
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= curriculum.length) return;
    const next = [...curriculum];
    [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
    setCurriculum(next);
    persistCurriculum(next);
  };

  const deleteItem = (idx: number) => {
    const next = curriculum.filter((_, i) => i !== idx);
    setCurriculum(next);
    persistCurriculum(next);
  };

  const addSection = () => {
    const newSection: CurriculumItem = {
      type: 'section',
      itemId: crypto.randomUUID(),
      title: 'New Section',
    };
    const next = [...curriculum, newSection];
    setCurriculum(next);
    persistCurriculum(next);
    // Auto-start renaming
    setRenamingId(newSection.itemId);
  };

  const renameSection = (itemId: string, title: string) => {
    const next = curriculum.map(item =>
      item.type === 'section' && item.itemId === itemId
        ? { ...item, title }
        : item
    );
    setCurriculum(next);
  };

  const finishRenaming = (itemId: string) => {
    setRenamingId(null);
    persistCurriculum(curriculum);
  };

  // Ensure all course lessons appear in the curriculum (add new ones at bottom)
  useEffect(() => {
    const presentIds = new Set(curriculum.filter(i => i.type === 'lesson').map(i => i.itemId));
    const missing = (courseLessons ?? []).filter((l: any) => !presentIds.has(l._id));
    if (missing.length > 0) {
      const next = [
        ...curriculum,
        ...missing.map((l: any) => ({ type: 'lesson' as const, itemId: l._id })),
      ];
      setCurriculum(next);
      persistCurriculum(next);
    }
  }, [courseLessons]);

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-32">
      {/* Left Sidebar — Course */}
      {currentCourse && (
        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-card rounded-3xl shadow-sm border border-border sticky top-24 overflow-hidden">
            {/* Sidebar header */}
            <div className="p-6 bg-primary text-primary-foreground relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl -mr-10 -mt-10" />
              <Link href={`/course/${currentCourse._id}`} className="relative z-10 inline-flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground text-sm font-medium mb-4 transition-colors">
                <ChevronLeft className="w-4 h-4" /> Back to Course
              </Link>
              <h3 className="relative z-10 font-bold text-xl leading-snug">{currentCourse.title}</h3>
              {isEditing && canEdit && (
                <button
                  onClick={addSection}
                  className="relative z-10 mt-3 inline-flex items-center gap-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                  <FolderPlus className="w-3.5 h-3.5" /> Add Section
                </button>
              )}
            </div>

            {/* Flat curriculum list */}
            <div className="max-h-[calc(100vh-350px)] overflow-y-auto custom-scrollbar">
              {curriculum.map((item, idx) => {
                const itemKey = `${item.type}-${item.itemId}-${idx}`;
                const isHovered = hoveredId === itemKey;

                if (item.type === 'section') {
                  return (
                    <div
                      key={itemKey}
                      className="relative group"
                      onMouseEnter={() => setHoveredId(itemKey)}
                      onMouseLeave={() => setHoveredId(null)}
                    >
                  <div className={`px-4 pt-4 pb-2 flex items-center gap-2 border-b border-border`}>
                        {isEditing && renamingId === item.itemId ? (
                          <input
                            autoFocus
                            value={item.title}
                            onChange={e => renameSection(item.itemId, e.target.value)}
                            onBlur={() => finishRenaming(item.itemId)}
                            onKeyDown={e => e.key === 'Enter' && finishRenaming(item.itemId)}
                      className="flex-1 text-[11px] font-bold text-primary uppercase tracking-widest bg-primary/10 border border-primary/30 rounded px-2 py-0.5 outline-none focus:ring-1 focus:ring-primary"
                          />
                        ) : (
                          <button
                            onClick={() => isEditing && setRenamingId(item.itemId)}
                            className={`text-[11px] font-bold text-primary/70 uppercase tracking-widest leading-none ${isEditing ? 'hover:text-primary cursor-text' : 'cursor-default'}`}
                          >
                            {item.title}
                          </button>
                        )}
                        <div className="flex-1 h-px bg-primary/20" />
                      </div>

                      {/* Hover tooltip */}
                      {isEditing && canEdit && isHovered && renamingId !== item.itemId && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex items-center gap-0.5 bg-card border border-border shadow-lg rounded-xl px-1.5 py-1">
                          <button
                            onClick={() => moveItem(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary disabled:opacity-20 transition-colors"
                            title="Move up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => moveItem(idx, 'down')}
                            disabled={idx === curriculum.length - 1}
                            className="p-1 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary disabled:opacity-20 transition-colors"
                            title="Move down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteItem(idx)}
                            className="p-1 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"
                            title="Delete section"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                }

                // Lesson item
                const cl = lessonById[item.itemId];
                if (!cl) return null;
                const isActive = cl._id === lesson._id;
                const lessonNum = lessonPositions[item.itemId] ?? 0;

                return (
                  <div
                    key={itemKey}
                    className={`relative flex items-center gap-2 transition-all border-b border-border ${isActive ? 'bg-primary/5 border-l-4 border-l-primary' : 'hover:bg-muted border-l-4 border-l-transparent'}`}
                    onMouseEnter={() => setHoveredId(itemKey)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <Link href={`/lesson/${cl._id}`} className="flex-1">
                      <div className="p-4 flex items-center gap-4 pr-10">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-sm ${isActive ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground'}`}>
                          {lessonNum + 1}
                        </div>
                        <span className={`text-sm font-medium line-clamp-2 ${isActive ? 'text-foreground font-bold' : 'text-muted-foreground'}`}>
                          {cl.title}
                        </span>
                      </div>
                    </Link>

                    {/* Hover tooltip for lesson */}
                    {isEditing && canEdit && isHovered && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex items-center gap-0.5 bg-card border border-border shadow-lg rounded-xl px-1.5 py-1">
                        <button
                          onClick={() => moveItem(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary disabled:opacity-20 transition-colors"
                          title="Move up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => moveItem(idx, 'down')}
                          disabled={idx === curriculum.length - 1}
                          className="p-1 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary disabled:opacity-20 transition-colors"
                          title="Move down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteItem(idx)}
                          className="p-1 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"
                          title="Remove from curriculum"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Left Sidebar — News */}
      {!currentCourse && newsItems && newsItems.length > 0 && (
        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-card rounded-3xl shadow-sm border border-border sticky top-24 overflow-hidden">
            {/* Sidebar header */}
            <div className="p-6 bg-primary text-primary-foreground relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/20 rounded-full blur-2xl -mr-10 -mt-10" />
              <Link href="/news" className="relative z-10 inline-flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground text-sm font-medium mb-4 transition-colors">
                <ChevronLeft className="w-4 h-4" /> All News
              </Link>
              <h3 className="relative z-10 font-bold text-xl leading-snug">School News & Articles</h3>
            </div>
            {/* News list */}
            <div className="max-h-[calc(100vh-350px)] overflow-y-auto custom-scrollbar divide-y divide-border">
              {newsItems.map((item: any) => {
                const isActive = item._id === lesson._id;
                return (
                  <Link
                    key={item._id}
                    href={`/lesson/${item._id}`}
                    className={`flex items-start gap-3 p-4 transition-all border-l-4 ${isActive ? 'bg-primary/5 border-l-primary' : 'hover:bg-muted border-l-transparent'}`}
                  >
                    <span className="text-xl shrink-0 mt-0.5">📰</span>
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold line-clamp-2 leading-snug ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {item.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 max-w-4xl min-w-0">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            {currentCourse ? (
              <span className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider shadow-sm border border-primary/20">Course Lesson</span>
            ) : (
              <span className="bg-rose-100 text-rose-800 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider shadow-sm border border-rose-200">School News</span>
            )}
            <span className="text-muted-foreground text-sm font-medium">By {lesson.creator?.name}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
            {isEditing && canEdit ? (
              <input
                value={lessonTitle}
                onChange={e => setLessonTitle(e.target.value)}
                onBlur={async () => {
                  if (lessonTitle.trim() && lessonTitle !== lesson.title) {
                    await updateLessonTitle(lesson._id, lessonTitle.trim()).catch(console.error);
                  }
                }}
                onKeyDown={async e => {
                  if (e.key === 'Enter') {
                    (e.target as HTMLInputElement).blur();
                  }
                }}
                className="w-full bg-transparent border-b-2 border-primary/40 focus:border-primary outline-none pb-1 transition-colors placeholder:text-muted-foreground"
                placeholder="Lesson title…"
              />
            ) : (
              lessonTitle
            )}
          </h1>
        </div>

        {/* Progress indicator */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-card rounded-2xl shadow-sm border border-border mb-8 gap-4">
          <div className="flex items-center gap-3 text-muted-foreground font-medium bg-muted px-4 py-2 rounded-xl">
            <Clock className={`w-5 h-5 ${isCompleted ? 'text-emerald-500' : 'text-primary animate-pulse'}`} />
            <span>Time spent: <span className="font-bold text-foreground">{Math.floor(timeSpent / 60)}m {timeSpent % 60}s</span></span>
          </div>
          {isCompleted ? (
            <span className="flex items-center gap-2 text-emerald-700 font-bold bg-emerald-100 px-5 py-2.5 rounded-xl border border-emerald-200 shadow-sm">
              Lesson Completed 🎉
            </span>
          ) : (
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <span className="text-sm font-bold text-amber-600 bg-amber-100 px-3 py-1.5 rounded-lg whitespace-nowrap">In Progress</span>
              <div className="w-full sm:w-48 bg-muted h-3 rounded-full overflow-hidden shadow-inner border border-border">
                <div className="bg-linear-to-r from-amber-400 to-amber-500 h-full transition-all duration-1000 ease-linear" style={{ width: `${Math.min((timeSpent / REQUIRED_TIME_SECONDS) * 100, 100)}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Editor Area */}
        <div className="bg-card/80 backdrop-blur-md rounded-[2.5rem] shadow-sm border border-border mb-16 overflow-hidden">
          <LessonEditor initialBlocks={lesson.contentBlocks} canEdit={canEdit} onSave={handleSaveBlocks} />
        </div>

        {/* Comments Section */}
        <div className="bg-card rounded-3xl p-8 shadow-sm border border-border relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-muted rounded-full blur-3xl -mr-32 -mt-32 z-0" />
          <div className="relative z-10">
            <h3 className="text-3xl font-bold text-foreground mb-8 flex items-center gap-4 border-b border-border pb-6">
              <span className="bg-blue-100 text-blue-600 p-3 rounded-xl shadow-inner">💬</span> Class Discussion
            </h3>
            <div className="mb-12 flex gap-5 bg-muted p-6 rounded-2xl border border-border shadow-sm">
              <div className="w-12 h-12 rounded-full bg-card border-2 border-primary/20 shadow-sm shrink-0 font-bold flex items-center justify-center text-primary text-lg">You</div>
              <div className="flex-1 flex flex-col items-end gap-3">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Ask a question or share your thoughts with the class..."
                  className="bg-card text-base shadow-inner resize-none min-h-25 rounded-xl"
                />
                <Button onClick={handlePostComment} className="rounded-xl px-8 shadow-md hover:-translate-y-0.5 transition-all">
                  <Send className="w-4 h-4 mr-2" /> Post Comment
                </Button>
              </div>
            </div>
            <div className="space-y-6">
              {comments.length === 0 ? (
                <p className="text-center text-muted-foreground italic py-8">No comments yet. Be the first to start the discussion!</p>
              ) : comments.map((comment: any) => (
                <div key={comment._id} className="flex gap-5 p-6 bg-card rounded-2xl border border-border shadow-sm hover:border-primary/30 transition-colors">
                  {comment.author?.image ? (
                    <img src={comment.author.image} className="w-12 h-12 rounded-full shadow-sm border border-border" alt="" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0 border border-emerald-200 text-lg">
                      {comment.author?.name?.[0] || '?'}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-foreground text-lg tracking-tight">{comment.author?.name}</span>
                      <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-1 rounded-md">{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
