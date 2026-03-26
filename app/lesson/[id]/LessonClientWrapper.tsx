"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { LessonEditor } from '@/components/LessonEditor';
import { Button } from '@/components/ui/button';
import { updateLessonBlocks, markLessonCompleted, addComment } from './actions';
import { Clock, Send, ChevronLeft } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

export function LessonClientWrapper({ 
  lesson, 
  courseLessons, 
  currentCourse, 
  comments, 
  canEdit,
  userId
}: any) {
  const [timeSpent, setTimeSpent] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [newComment, setNewComment] = useState("");
  const timerRef = useRef<NodeJS.Timeout>(null);
  const REQUIRED_TIME_SECONDS = 60; // Configurable per task requirements

  useEffect(() => {
    // Start active timer
    timerRef.current = setInterval(() => {
      setTimeSpent(prev => {
        const next = prev + 1;
        if (next >= REQUIRED_TIME_SECONDS && !isCompleted) {
          setIsCompleted(true);
          // Auto trigger API call to mark UserProgress
          markLessonCompleted(lesson._id, next).catch(console.error);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timerRef.current!);
  }, [isCompleted, lesson._id]);

  const handleSaveBlocks = async (blocks: any[]) => {
    try {
       await updateLessonBlocks(lesson._id, blocks);
       alert("Lesson saved successfully! ✅");
    } catch (e) {
       alert("Error saving lesson.");
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    try {
      await addComment(lesson._id, newComment);
      setNewComment("");
      window.location.reload(); // Simple refresh to show new comment
    } catch (e) {
      alert("Error posting comment");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-32">
      {/* Left Sidebar for Course Lessons */}
      {currentCourse && (
        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 sticky top-24 overflow-hidden">
            <div className="p-6 bg-gradient-to-br from-indigo-900 to-indigo-950 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl -mr-10 -mt-10" />
              <Link href={`/course/${currentCourse._id}`} className="relative z-10 inline-flex items-center gap-2 text-indigo-200 hover:text-white text-sm font-medium mb-4 transition-colors">
                <ChevronLeft className="w-4 h-4" /> Back to Course
              </Link>
              <h3 className="relative z-10 font-bold text-xl leading-snug">{currentCourse.title}</h3>
            </div>
            <div className="divide-y divide-slate-50 max-h-[calc(100vh-350px)] overflow-y-auto custom-scrollbar">
              {courseLessons.map((cl: any, idx: number) => (
                <Link href={`/lesson/${cl._id}`} key={cl._id}>
                  <div className={`p-4 flex items-center gap-4 transition-all ${cl._id === lesson._id ? 'bg-indigo-50/50 border-l-4 border-l-indigo-600' : 'hover:bg-slate-50 border-l-4 border-l-transparent'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-sm ${cl._id === lesson._id ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-500'}`}>
                      {idx + 1}
                    </div>
                    <span className={`text-sm font-medium line-clamp-2 ${cl._id === lesson._id ? 'text-indigo-950 font-bold' : 'text-slate-600'}`}>
                      {cl.title}
                    </span>
                  </div>
                </Link>
              ))}
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
              <span className="bg-indigo-100 text-indigo-800 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider shadow-sm border border-indigo-200">Course Lesson</span>
            ) : (
              <span className="bg-rose-100 text-rose-800 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider shadow-sm border border-rose-200">School News</span>
            )}
            <span className="text-slate-500 text-sm font-medium">By {lesson.creator?.name}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-950 tracking-tight leading-tight">
            {lesson.title}
          </h1>
        </div>

        {/* Top bar for progress indicator */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-white rounded-2xl shadow-sm border border-slate-200 mb-8 gap-4">
           <div className="flex items-center gap-3 text-slate-600 font-medium bg-slate-50 px-4 py-2 rounded-xl">
              <Clock className={`w-5 h-5 ${isCompleted ? 'text-emerald-500' : 'text-indigo-500 animate-pulse'}`} />
              <span>Time spent: <span className="font-bold text-slate-800">{Math.floor(timeSpent / 60)}m {timeSpent % 60}s</span></span>
           </div>
           
           {isCompleted ? (
             <span className="flex items-center gap-2 text-emerald-700 font-bold bg-emerald-100 px-5 py-2.5 rounded-xl border border-emerald-200 shadow-sm">
               Lesson Completed 🎉
             </span>
           ) : (
             <div className="flex items-center gap-4 w-full sm:w-auto">
               <span className="text-sm font-bold text-amber-600 bg-amber-100 px-3 py-1.5 rounded-lg whitespace-nowrap">In Progress</span>
               <div className="w-full sm:w-48 bg-slate-100 h-3 rounded-full overflow-hidden shadow-inner border border-slate-200">
                 <div className="bg-gradient-to-r from-amber-400 to-amber-500 h-full transition-all duration-1000 ease-linear" style={{ width: `${Math.min((timeSpent / REQUIRED_TIME_SECONDS) * 100, 100)}%` }} />
               </div>
             </div>
           )}
        </div>

        {/* Editor Area */}
        <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] shadow-sm border border-slate-200 mb-16 overflow-hidden">
          <LessonEditor initialBlocks={lesson.contentBlocks} canEdit={canEdit} onSave={handleSaveBlocks} />
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -mr-32 -mt-32 z-0" />
          <div className="relative z-10">
            <h3 className="text-3xl font-bold text-indigo-950 mb-8 flex items-center gap-4 border-b border-slate-100 pb-6">
               <span className="bg-blue-100 text-blue-600 p-3 rounded-xl shadow-inner">💬</span> Class Discussion
            </h3>
            
            <div className="mb-12 flex gap-5 bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm">
               <div className="w-12 h-12 rounded-full bg-white border-2 border-indigo-100 shadow-sm shrink-0 font-bold flex items-center justify-center text-indigo-400 text-lg">You</div>
               <div className="flex-1 flex flex-col items-end gap-3">
                  <Textarea 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Ask a question or share your thoughts with the class..."
                    className="bg-white focus-visible:ring-indigo-500 text-base shadow-inner resize-none min-h-[100px] rounded-xl border-slate-200"
                  />
                  <Button onClick={handlePostComment} className="bg-indigo-900 hover:bg-indigo-800 text-white rounded-xl px-8 shadow-md hover:-translate-y-0.5 transition-all">
                    <Send className="w-4 h-4 mr-2" /> Post Comment
                  </Button>
               </div>
            </div>

            <div className="space-y-6">
               {comments.length === 0 ? (
                 <p className="text-center text-slate-500 italic py-8">No comments yet. Be the first to start the discussion!</p>
               ) : comments.map((comment: any) => (
                  <div key={comment._id} className="flex gap-5 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-100 transition-colors group">
                     {comment.author?.image ? (
                       <img src={comment.author.image} className="w-12 h-12 rounded-full shadow-sm border border-slate-200" alt="" />
                     ) : (
                       <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0 border border-emerald-200 text-lg">
                         {comment.author?.name?.[0] || '?'}
                       </div>
                     )}
                     <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-indigo-950 text-lg tracking-tight">{comment.author?.name}</span>
                          <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">{new Date(comment.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-slate-600 leading-relaxed">{comment.content}</p>
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
