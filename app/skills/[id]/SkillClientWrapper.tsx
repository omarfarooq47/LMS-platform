"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Eye, Edit2, BookOpen, Save } from "lucide-react";
import { CourseDiagram } from "@/components/CourseDiagram";

export function SkillClientWrapper({ skill, canEdit, updateSkillDetailsAction }: any) {
  const [isEditing, setIsEditing] = useState(false);

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
             <Button type="submit" form="skill-edit-form" className="gap-2 bg-amber-600 hover:bg-amber-700 text-white shadow-md hover:scale-105 transition-transform ml-2">
               <Save className="w-4 h-4" /> Save Skill Path
             </Button>
          )}
        </div>
      )}

      {/* Header Section */}
      <div className={`bg-white rounded-3xl p-8 md:p-12 shadow-sm border mb-8 relative overflow-hidden transition-all ${isEditing ? 'border-dashed border-indigo-300 bg-slate-50' : 'border-slate-100'}`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold uppercase tracking-wider">
              Skill Path
            </span>
          </div>
          {isEditing ? (
             <form id="skill-edit-form" action={async (formData) => {
               await updateSkillDetailsAction(formData);
               setIsEditing(false);
             }} className="space-y-4 max-w-3xl">
               <input name="title" type="text" defaultValue={skill.title} required className="w-full text-4xl md:text-5xl font-extrabold text-indigo-950 bg-white border border-slate-200 rounded-xl px-4 py-2" placeholder="Skill Title" />
               <textarea name="description" defaultValue={skill.description} required className="w-full text-lg text-slate-600 bg-white border border-slate-200 rounded-xl px-4 py-3 min-h-[120px]" placeholder="Skill Description" />
             </form>
          ) : (
            <>
              <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-950 mb-6 tracking-tight">{skill.title}</h1>
              <p className="text-lg text-slate-600 leading-relaxed max-w-3xl">
                {skill.description}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Illustration Section */}
      <div className="mb-12 border-t border-slate-100 pt-12">
        <h2 className="text-2xl font-bold text-indigo-950 mb-6 flex items-center gap-3">
          <span className="bg-blue-100 text-blue-600 p-2 rounded-lg">🎨</span> Skill Illustration
        </h2>
        {isEditing ? (
           <div className="p-4 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-300">
             <CourseDiagram canEdit={true} persistenceKey={`skill-${skill._id}`} />
             <p className="text-xs text-slate-500 mt-3 text-center">Interactive Canvas (Edit Mode Only). Autosaves locally.</p>
           </div>
        ) : (
           <div className="rounded-3xl overflow-hidden shadow-lg border border-slate-100 bg-white relative">
             <CourseDiagram canEdit={false} persistenceKey={`skill-${skill._id}`} />
             <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full font-medium z-10 pointer-events-none">
               Snapshot
             </div>
           </div>
        )}
      </div>

      {/* Courses Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-indigo-950 mb-6 flex items-center gap-3">
          <span className="bg-amber-100 text-amber-600 p-2 rounded-lg"><BookOpen className="w-5 h-5" /></span>
          Required Courses
        </h2>
        {skill.courses?.length === 0 ? (
          <div className="p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center text-slate-500">
            No courses in this path yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skill.courses?.map((course: any) => (
              <Link href={`/course/${course._id.toString()}`} key={course._id.toString()}>
                <div className="group bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all h-full flex flex-col cursor-pointer">
                  <h3 className="text-xl font-bold text-indigo-950 mb-3 group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-sm text-slate-600 mb-6 line-clamp-3 flex-grow">
                    {course.description}
                  </p>
                  <div className="flex items-center text-sm font-bold text-indigo-600 mt-auto">
                    View Course <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
