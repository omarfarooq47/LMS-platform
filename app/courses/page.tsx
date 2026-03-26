import connectToDatabase from "@/lib/mongodb";
import { Course } from "@/lib/models";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export const revalidate = 60;

export default async function CoursesPage() {
  await connectToDatabase();
  const courses = await Course.find().sort({ createdAt: -1 }).populate('creator', 'name').lean();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold text-indigo-950 mb-4 tracking-tight">All Courses</h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Browse our extensive catalog of interactive courses covering a variety of topics.
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
           <span className="text-5xl text-slate-300 block mb-4">📚</span>
           <p className="text-xl text-slate-500 font-medium">No courses available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map((course: any) => (
            <Link href={`/course/${course._id.toString()}`} key={course._id.toString()}>
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all border border-slate-100 flex flex-col h-full group cursor-pointer relative">
                
                {/* Course Image Placeholder */}
                <div className="h-40 bg-slate-100 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-emerald-500/20 mix-blend-multiply group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-50">🎓</div>
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <div className="mb-3">
                    {course.pathId ? (
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 text-xs px-2 py-0.5 rounded-full font-semibold border-none">
                        Part of a Path
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-indigo-600 border-indigo-200 text-xs px-2 py-0.5 rounded-full font-semibold">
                        Standalone
                      </Badge>
                    )}
                  </div>
                  
                  <h2 className="text-xl font-bold text-indigo-950 mb-2 group-hover:text-indigo-700 transition-colors line-clamp-2">
                    {course.title}
                  </h2>
                  
                  <p className="text-slate-600 text-sm mb-4 line-clamp-2 flex-grow">
                    {course.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50 text-xs font-medium text-slate-500">
                    <span className="truncate max-w-[120px]">By {course.creator?.name || 'Staff'}</span>
                    <span className="capitalize text-slate-400">{course.status}</span>
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
