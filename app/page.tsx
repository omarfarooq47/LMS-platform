import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import { Notice, Lesson } from "@/lib/models";
import NoticeBoard from "@/components/NoticeBoard";

export const revalidate = 0; // Ensure fresh data on home page

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session?.user && !session.user.isApproved) {
    return (
      <div className="container mx-auto px-4 py-20 text-center flex h-[60vh] items-center justify-center">
        <div className="max-w-md w-full bg-card p-10 rounded-3xl shadow-lg border border-border">
          <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-sm">⏳</div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-4 tracking-tight">Pending Approval</h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Your account has been successfully created and is currently awaiting staff approval. 
            Once approved, you'll have full access to the OakTree platform.
          </p>
          <div className="p-4 bg-muted rounded-xl">
             <p className="text-sm font-medium text-muted-foreground">Please check back later or contact administration.</p>
          </div>
        </div>
      </div>
    );
  }

  await connectToDatabase();
  const notices = await Notice.find().sort({ createdAt: -1 }).limit(5).populate('author', 'name').lean();
  const newsItems = await Lesson.find({ courseId: { $exists: false } }).sort({ createdAt: -1 }).limit(10).populate('creator', 'name').lean();

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
        <NoticeBoard
          initialNotices={notices.map((n: any) => ({
            _id: n._id.toString(),
            title: n.title,
            content: n.content,
            author: n.author ? { name: n.author.name } : undefined,
            createdAt: n.createdAt instanceof Date ? n.createdAt.toISOString() : String(n.createdAt),
          }))}
          isStaff={session?.user?.role === "staff"}
        />

        {/* Current News */}
        <div className="bg-card rounded-3xl p-8 shadow-sm border border-border">
          <h2 className="text-3xl font-bold text-foreground mb-8 flex items-center gap-4 border-b border-border pb-6">
            <span className="bg-indigo-100 text-indigo-600 p-3 rounded-xl shadow-inner">📰</span> School News
          </h2>
          <div className="space-y-5 max-h-120 overflow-y-auto pr-1">
            {newsItems.length === 0 ? <p className="text-muted-foreground text-center italic py-8 bg-muted rounded-2xl">No news available at the moment.</p> : newsItems.map((news: any) => (
              <div key={news._id.toString()} className="px-4 py-3 rounded-2xl bg-muted/40 border border-border hover:shadow-md hover:bg-card transition-all flex justify-between items-start gap-4">
                <h3 className="font-semibold text-foreground">{news.title}</h3>
                <div className="text-xs font-medium text-muted-foreground shrink-0 flex flex-col items-end gap-0.5">
                  <span className="text-indigo-600">{news.creator?.name}</span>
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
          <h2 className="text-3xl font-bold text-foreground mb-8 flex items-center gap-4">
             <span className="bg-emerald-100 text-emerald-600 p-3 rounded-xl shadow-inner">🚀</span> Your Learning Journey
          </h2>
          <div className="p-16 bg-card rounded-3xl border-2 border-dashed border-border flex items-center justify-center flex-col text-muted-foreground">
             <span className="text-5xl mb-6">🎠</span>
             <p className="text-lg font-medium">Carousel of Current/Completed Courses will appear here.</p>
             <p className="text-sm mt-2">Integrating shadcn/ui carousels with progress queries.</p>
          </div>
        </div>
      )}
    </div>
  );
}
