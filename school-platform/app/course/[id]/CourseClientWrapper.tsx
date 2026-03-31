"use client";

import { useState } from 'react';
import { CourseDiagram } from "@/components/CourseDiagram";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Eye, Edit2, PlusCircle, Save } from "lucide-react";

type CurriculumItem =
  | { type: 'lesson'; itemId: string }
  | { type: 'section'; itemId: string; title: string };

export function CourseClientWrapper({
  course,
  lessons,
  canEdit,
  completedLessonIds,
  allLessonsCompleted,
  updateStatusAction,
  updateCourseDetailsAction,
}: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [courseTitle, setCourseTitle] = useState(course.title);
  const [courseDescription, setCourseDescription] = useState(course.description);
  const completedLessonIdsSet = new Set(completedLessonIds || []);

  const curriculum: CurriculumItem[] = course.curriculum ?? [];
  const lessonById = Object.fromEntries(lessons.map((l: any) => [l._id, l]));

  // Compute global lesson number by order in curriculum
  const orderedLessonIds: string[] = curriculum
    .filter(item => item.type === 'lesson')
    .map(item => item.itemId);
  // Lessons not yet in curriculum appear at the end
  const lessonsNotInCurriculum = lessons.filter((l: any) => !orderedLessonIds.includes(l._id));
  const allOrderedIds = [...orderedLessonIds, ...lessonsNotInCurriculum.map((l: any) => l._id)];
  const globalIndex = (lessonId: string) => allOrderedIds.indexOf(lessonId);

  const renderLessonCard = (lesson: any) => {
    const isCompleted = completedLessonIdsSet.has(lesson._id);
    const idx = globalIndex(lesson._id);
    return (
      <Link key={lesson._id} href={`/lesson/${lesson._id}`} className="block">
        <div className="bg-card p-5 rounded-2xl shadow-sm border border-border hover:border-primary/40 hover:shadow-md transition-all flex items-center justify-between group">
          <div className="flex items-center gap-5">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg 
              ${isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'}`}>
              {isCompleted ? '✓' : idx + 1}
            </div>
            <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
              {lesson.title}
            </h3>
          </div>
          <div className="text-muted-foreground group-hover:text-primary pr-2">
            <span aria-hidden="true">&rarr;</span>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl relative">
      {canEdit && (
        <div className="flex justify-end gap-2 mb-4 sticky top-18 z-20">
          <Button variant={isEditing ? "outline" : "default"} onClick={() => setIsEditing(false)} className="gap-2">
            <Eye className="w-4 h-4" /> Preview
          </Button>
          <Button variant={isEditing ? "default" : "outline"} onClick={() => setIsEditing(true)} className="gap-2">
            <Edit2 className="w-4 h-4" /> Edit
          </Button>
          {isEditing && (
            <Button type="submit" form="course-edit-form" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:scale-105 transition-transform ml-2">
              <Save className="w-4 h-4" /> Save Course
            </Button>
          )}
        </div>
      )}

      {/* Header Section */}
      <div className={`bg-card rounded-3xl p-8 md:p-12 shadow-sm border mb-8 relative overflow-hidden transition-all ${isEditing ? 'border-dashed border-primary/40 bg-muted' : 'border-border'}`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider">
                Course
              </span>
              <span className="text-muted-foreground text-sm font-medium">By {course.creator?.name || 'Unknown'}</span>
            </div>
            {isEditing ? (
              <form id="course-edit-form" action={async (formData) => {
                await updateCourseDetailsAction(formData);
                setIsEditing(false);
              }} className="space-y-4">
                <input
                  name="title"
                  type="text"
                  value={courseTitle}
                  onChange={e => setCourseTitle(e.target.value)}
                  required
                  className="w-full text-4xl md:text-5xl font-extrabold text-foreground bg-card border border-border rounded-xl px-4 py-2"
                  placeholder="Course Title"
                />
                <textarea
                  name="description"
                  value={courseDescription}
                  onChange={e => setCourseDescription(e.target.value)}
                  required
                  className="w-full text-lg text-muted-foreground bg-card border border-border rounded-xl px-4 py-3 min-h-30"
                  placeholder="Course Description"
                />
              </form>
            ) : (
              <>
                <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6 tracking-tight">{courseTitle}</h1>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
                  {courseDescription}
                </p>
              </>
            )}
          </div>

          <div className="bg-muted p-6 rounded-2xl border border-border shrink-0 min-w-62">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Course Status</h3>
            {isEditing ? (
              <form action={updateStatusAction} className="flex flex-col gap-3">
                <select name="status" defaultValue={course.status} className="w-full p-2.5 rounded-lg border border-border bg-card text-foreground font-medium focus:ring-2 focus:ring-primary outline-none">
                  <option value="initialized">Initialized</option>
                  <option value="50% content">50% Content</option>
                  <option value="100% content">100% Content</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="published">Published</option>
                  <option value="canceled">Canceled</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="blocked">Blocked</option>
                </select>
                <Button type="submit" variant="outline" size="sm" className="w-full">
                  Update Status
                </Button>
              </form>
            ) : (
              <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 uppercase tracking-widest text-sm px-4 py-1.5 rounded-lg border-none shadow-sm">
                {course.status}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Illustration Section */}
      <div className="mb-12">
        {isEditing ? (
          <div className="p-4 bg-muted rounded-3xl border-2 border-dashed border-border">
            <CourseDiagram canEdit={true} persistenceKey={`course-${course._id}`} />
            <p className="text-xs text-muted-foreground mt-3 text-center">Interactive Canvas (Edit Mode Only). Autosaves locally.</p>
          </div>
        ) : (
          <div className="rounded-3xl overflow-hidden shadow-lg border border-border bg-card relative">
            <CourseDiagram canEdit={false} persistenceKey={`course-${course._id}`} />
            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full font-medium z-10 pointer-events-none">
              Snapshot
            </div>
          </div>
        )}
      </div>

      {/* Curriculum Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <span className="bg-purple-100 text-purple-600 p-2 rounded-lg">📚</span> Curriculum ({lessons.length} Lessons)
            </h2>
          </div>

          {lessons.length === 0 ? (
            <div className="p-8 bg-muted rounded-2xl border border-dashed border-border text-center">
              <p className="text-muted-foreground">No lessons added to this course yet.</p>
            </div>
          ) : (
            <div className="space-y-2 mb-6">
              {curriculum.length === 0 ? (
                lessons.map((lesson: any) => renderLessonCard(lesson))
              ) : (
                <>
                  {curriculum.map((item, i) => {
                    if (item.type === 'section') {
                      return (
                        <div key={`section-${item.itemId}-${i}`} className="pt-4 pb-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-bold text-primary text-base tracking-tight">{item.title}</h3>
                            <div className="flex-1 h-px bg-primary/20" />
                          </div>
                        </div>
                      );
                    }
                    const lesson = lessonById[item.itemId];
                    if (!lesson) return null;
                    return renderLessonCard(lesson);
                  })}
                  {lessonsNotInCurriculum.length > 0 && (
                    <div className="pt-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-1 pb-2">Other Lessons</p>
                      {lessonsNotInCurriculum.map((lesson: any) => renderLessonCard(lesson))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {isEditing && (
            <div className="mt-6 flex justify-center border-t border-border pt-6">
              <a href={`/lesson/create?courseId=${course._id}`}>
                <Button variant="outline" className="rounded-full px-8 py-6 font-bold text-base gap-2 transition-all">
                  <PlusCircle className="w-5 h-5" /> Add New Lesson
                </Button>
              </a>
            </div>
          )}
        </div>

        {/* Progress Sidebar */}
        <div>
          <div className="bg-linear-to-br from-indigo-900 to-indigo-950 rounded-3xl p-8 text-white shadow-xl sticky top-24">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              🏆 Your Progress
            </h3>
            <div className="mb-6 bg-indigo-950/50 p-4 rounded-xl border border-indigo-800/50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-indigo-200 text-sm font-medium">Completed</span>
                <span className="font-bold text-emerald-400">{completedLessonIdsSet.size} / {lessons.length}</span>
              </div>
              <div className="w-full bg-indigo-950 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2.5 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${lessons.length > 0 ? (completedLessonIdsSet.size / lessons.length) * 100 : 0}%` }}
                />
              </div>
            </div>
            {allLessonsCompleted && lessons.length > 0 ? (
              <div className="space-y-4">
                <p className="text-emerald-400 font-bold bg-emerald-400/10 p-3 rounded-lg text-center text-sm border border-emerald-400/20">
                  🎉 Congratulations! You have completed all lessons in this course.
                </p>
                <Button className="w-full bg-emerald-500 hover:bg-emerald-400 text-indigo-950 font-bold py-6 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:scale-[1.02]">
                  Download Certificate
                </Button>
              </div>
            ) : (
              <p className="text-indigo-300 text-sm leading-relaxed text-center">
                Complete all lessons in this course to unlock your certificate of completion.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
