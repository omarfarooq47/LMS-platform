import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import { Notice, Lesson } from "@/lib/models";

export const revalidate = 0; // Ensure fresh data on home page

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session?.user && !session.user.isApproved) {
    return (
      <div className="container mx-auto px-4 py-20 text-center flex h-[60vh] items-center justify-center">
        <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-lg border border-slate-100">
          <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-sm">⏳</div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-indigo-950 mb-4 tracking-tight">Pending Approval</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            Your account has been successfully created and is currently awaiting staff approval. 
            Once approved, you'll have full access to the OakTree platform.
          </p>
          <div className="p-4 bg-slate-50 rounded-xl">
             <p className="text-sm font-medium text-slate-500">Please check back later or contact administration.</p>
          </div>
        </div>
      </div>
    );
  }

  await connectToDatabase();
  const notices = await Notice.find().sort({ createdAt: -1 }).limit(5).populate('author', 'name').lean();
  const newsItems = await Lesson.find({ courseId: { $exists: false } }).sort({ createdAt: -1 }).limit(5).populate('creator', 'name').lean();

  return (
    <div className="container mx-auto px-4 py-10">
      {!session && (
        <div className="bg-indigo-950 text-white rounded-[2rem] p-12 md:p-20 mb-16 text-center shadow-2xl relative overflow-hidden ring-1 ring-white/10">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-indigo-500/40 z-0" />
          <div className="relative z-10 space-y-6">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">Welcome to OakTree</h1>
            <p className="text-xl md:text-2xl text-indigo-200 text-opacity-90 max-w-3xl mx-auto leading-relaxed font-light">
              A modern learning environment combining interactive courses, comprehensive skill paths, and a vibrant community.
            </p>
          </div>
        </div>
      )}

      {/* Notices & News Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-20">
        {/* Notice Board */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <h2 className="text-3xl font-bold text-indigo-950 mb-8 flex items-center gap-4 border-b border-slate-100 pb-6">
            <span className="bg-amber-100 text-amber-600 p-3 rounded-xl shadow-inner">📌</span> Notice Board
          </h2>
          <div className="space-y-5">
            {notices.length === 0 ? <p className="text-slate-500 text-center italic py-8 bg-slate-50 rounded-2xl">No notices available at the moment.</p> : notices.map((notice: any) => (
              <div key={notice._id.toString()} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-md hover:bg-white transition-all">
                <h3 className="font-bold text-xl text-indigo-900 mb-2">{notice.title}</h3>
                <p className="text-slate-600 leading-relaxed">{notice.content}</p>
                <div className="text-xs font-semibold text-slate-400 mt-5 flex justify-between items-center bg-slate-100/50 p-2 rounded-lg">
                  <span className="text-indigo-600">By {notice.author?.name}</span>
                  <span>{new Date(notice.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current News */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <h2 className="text-3xl font-bold text-indigo-950 mb-8 flex items-center gap-4 border-b border-slate-100 pb-6">
            <span className="bg-indigo-100 text-indigo-600 p-3 rounded-xl shadow-inner">📰</span> School News
          </h2>
          <div className="space-y-5">
            {newsItems.length === 0 ? <p className="text-slate-500 text-center italic py-8 bg-slate-50 rounded-2xl">No news available at the moment.</p> : newsItems.map((news: any) => (
              <div key={news._id.toString()} className="p-6 rounded-2xl bg-indigo-50/40 border border-indigo-50 hover:shadow-md hover:bg-white transition-all">
                <h3 className="font-bold text-xl text-indigo-900 mb-2">{news.title}</h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {news.contentBlocks?.find((b: any) => b.type === 'text')?.data || 'Click to read full story...'}
                </p>
                <div className="text-xs font-semibold text-indigo-400 mt-5 flex justify-between items-center bg-indigo-50/50 p-2 rounded-lg">
                  <span className="text-indigo-600">By {news.creator?.name}</span>
                  <span>{new Date(news.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Carousels Placeholders */}
      {session?.user?.isApproved && (
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-indigo-950 mb-8 flex items-center gap-4">
             <span className="bg-emerald-100 text-emerald-600 p-3 rounded-xl shadow-inner">🚀</span> Your Learning Journey
          </h2>
          <div className="p-16 bg-white rounded-3xl border-2 border-dashed border-slate-200 flex items-center justify-center flex-col text-slate-400">
             <span className="text-5xl mb-6">🎠</span>
             <p className="text-lg font-medium">Carousel of Current/Completed Courses will appear here.</p>
             <p className="text-sm mt-2">Integrating shadcn/ui carousels with progress queries.</p>
          </div>
        </div>
      )}
    </div>
  );
}
