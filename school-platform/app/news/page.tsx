import connectToDatabase from "@/lib/mongodb";
import { Lesson } from "@/lib/models";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export const revalidate = 60;

export default async function NewsPage() {
  await connectToDatabase();
  // Fetch only lessons that don't belong to a course
  const newsItems = await Lesson.find({ courseId: { $exists: false } }).sort({ createdAt: -1 }).populate('creator', 'name').lean();

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold text-foreground mb-4 tracking-tight">School News & Articles</h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          Stay up-to-date with the latest news, announcements, and featured articles from our vibrant community.
        </p>
      </div>

      {newsItems.length === 0 ? (
        <div className="text-center py-32 bg-card rounded-3xl border border-dashed border-border">
           <span className="text-6xl text-muted-foreground block mb-6">🗞️</span>
           <p className="text-xl text-muted-foreground font-medium">No news articles published yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {newsItems.map((news: any) => (
            <Link href={`/lesson/${news._id.toString()}`} key={news._id.toString()}>
              <div className="bg-card rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all border border-border flex flex-col md:flex-row gap-6 lg:gap-8 group cursor-pointer items-start">
                
                {/* News Thumbnail */}
                <div className="w-full md:w-1/3 h-48 md:h-full min-h-[12rem] bg-muted rounded-2xl relative overflow-hidden shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-emerald-500/10 group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-80 group-hover:scale-110 transition-transform duration-300">📰</div>
                </div>

                <div className="flex flex-col flex-grow py-2">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200 text-xs px-3 py-1 rounded-full font-bold border-none uppercase tracking-wider">
                      Article
                    </Badge>
                    <span className="text-xs font-semibold text-slate-400">
                      {new Date(news.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-foreground mb-3 group-hover:text-indigo-700 transition-colors">
                    {news.title}
                  </h2>
                  
                  <p className="text-muted-foreground mb-6 line-clamp-3 leading-relaxed">
                    {news.contentBlocks?.find((b: any) => b.type === 'text')?.data || 'Read the full story to learn more...'}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                        {news.creator?.name?.[0] || 'U'}
                      </div>
                      <span className="text-sm font-medium text-foreground">{news.creator?.name || 'Unknown Author'}</span>
                    </div>
                    <span className="text-indigo-600 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                      Read full article <span aria-hidden="true">&rarr;</span>
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
