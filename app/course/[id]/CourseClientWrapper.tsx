"use client";

import { useState } from 'react';
import { CourseDiagram } from "@/components/CourseDiagram";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Eye, Edit2, PlusCircle, Save } from "lucide-react";

export function CourseClientWrapper({ 
  course, 
  lessons, 
  canEdit, 
  completedLessonIds, 
  allLessonsCompleted,
  updateStatusAction,
  updateCourseDetailsAction
}: any) {
  const [isEditing, setIsEditing] = useState(false);
  const completedLessonIdsSet = new Set(completedLessonIds || []);

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl relative">
      {canEdit && (
        <div className="flex justify-end gap-2 mb-4 sticky top-[4.5rem] z-20">
          <Button variant={isEditing ? "outline" : "default"} onClick={() => setIsEditing(false)} className={`gap-2 ${!isEditing && 'bg-indigo-900 text-white shadow-md'}`}>
            <Eye className="w-4 h-4" /> Preview
          </Button>
          <Button variant={isEditing ? "default" : "outline"} onClick={() => setIsEditing(true)} className={`gap-2 ${isEditing && 'bg-indigo-900 text-white shadow-md'}`}>
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
      <div className={`bg-white rounded-3xl p-8 md:p-12 shadow-sm border mb-8 relative overflow-hidden transition-all ${isEditing ? 'border-dashed border-indigo-300 bg-slate-50' : 'border-slate-100'}`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-bold uppercase tracking-wider">
                Course
              </span>
              <span className="text-slate-500 text-sm font-medium">By {course.creator?.name || 'Unknown'}</span>
            </div>
            {isEditing ? (
               <form id="course-edit-form" action={async (formData) => {
                 await updateCourseDetailsAction(formData);
                 setIsEditing(false);
               }} className="space-y-4">
                 <input name="title" type="text" defaultValue={course.title} required className="w-full text-4xl md:text-5xl font-extrabold text-indigo-950 bg-white border border-slate-200 rounded-xl px-4 py-2" placeholder="Course Title" />
                 <textarea name="description" defaultValue={course.description} required className="w-full text-lg text-slate-600 bg-white border border-slate-200 rounded-xl px-4 py-3 min-h-[120px]" placeholder="Course Description" />
               </form>
            ) : (
              <>
                <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-950 mb-6 tracking-tight">{course.title}</h1>
                <p className="text-lg text-slate-600 leading-relaxed max-w-3xl">
                  {course.description}
                </p>
              </>
            )}
          </div>
          
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 shrink-0 min-w-[250px]">
             <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Course Status</h3>
             {isEditing ? (
               <form action={updateStatusAction} className="flex flex-col gap-3">
                 <select name="status" defaultValue={course.status} className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500 outline-none">
                   <option value="initialized">Initialized</option>
                   <option value="50% content">50% Content</option>
                   <option value="100% content">100% Content</option>
                   <option value="reviewed">Reviewed</option>
                   <option value="published">Published</option>
                   <option value="canceled">Canceled</option>
                   <option value="confirmed">Confirmed</option>
                   <option value="blocked">Blocked</option>
                 </select>
                 <Button type="submit" variant="outline" size="sm" className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50">
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
        <h2 className="text-2xl font-bold text-indigo-950 mb-6 flex items-center gap-3">
          <span className="bg-blue-100 text-blue-600 p-2 rounded-lg">🎨</span> Course Illustration
        </h2>
        {isEditing ? (
           <div className="p-4 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-300">
             <CourseDiagram canEdit={true} persistenceKey={`course-${course._id}`} />
             <p className="text-xs text-slate-500 mt-3 text-center">Interactive Canvas (Edit Mode Only). Autosaves locally.</p>
           </div>
        ) : (
           <div className="rounded-3xl overflow-hidden shadow-lg border border-slate-100 bg-white relative">
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
            <h2 className="text-2xl font-bold text-indigo-950 flex items-center gap-3">
              <span className="bg-purple-100 text-purple-600 p-2 rounded-lg">📚</span> Curriculum ({lessons.length} Lessons)
            </h2>
          </div>
          
          <div className="space-y-4 mb-6">
            {lessons.length === 0 ? (
              <div className="p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center">
                <p className="text-slate-500">No lessons added to this course yet.</p>
              </div>
            ) : (
              lessons.map((lesson: any, index: number) => {
                const isCompleted = completedLessonIds.has(lesson._id.toString());
                return (
                  <Link href={`/lesson/${lesson._id.toString()}`} key={lesson._id.toString()} className="block">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all flex items-center justify-between group">
                      <div className="flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg 
                          ${isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
                          {isCompleted ? '✓' : index + 1}
                        </div>
                        <h3 className="font-semibold text-lg text-indigo-950 group-hover:text-indigo-700 transition-colors">
                          {lesson.title}
                        </h3>
                      </div>
                      <div className="text-slate-400 group-hover:text-indigo-500 pr-2">
                        <span aria-hidden="true">&rarr;</span>
                      </div>
                    </div>
                  </Link>
                )
              })
            )}
          </div>
          
          {isEditing && (
            <div className="mt-6 flex justify-center border-t border-slate-100 pt-6">
               <a href={`/lesson/create?courseId=${course._id}`}>
                 <Button className="bg-white text-indigo-700 border-2 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 shadow-sm rounded-full px-8 py-6 font-bold text-base gap-2 transition-all">
                   <PlusCircle className="w-5 h-5" /> Add New Lesson
                 </Button>
               </a>
            </div>
          )}
        </div>
        
        {/* Completion Logic Sidebar */}
        <div>
          <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 rounded-3xl p-8 text-white shadow-xl sticky top-24">
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
                ></div>
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
