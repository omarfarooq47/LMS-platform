import connectToDatabase from "@/lib/mongodb";
import { SkillPath } from "@/lib/models";
import Link from "next/link";

export const revalidate = 60;

export default async function SkillsPage() {
  await connectToDatabase();
  const paths = await SkillPath.find().sort({ createdAt: -1 }).populate('courses').lean();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold text-indigo-950 mb-4 tracking-tight">Skill Paths</h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Curated journeys designed to take you from beginner to expert. 
          Follow a path, master the skills, and unlock your potential.
        </p>
      </div>

      {paths.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
           <span className="text-5xl text-slate-300 block mb-4">🗺️</span>
           <p className="text-xl text-slate-500 font-medium">No skill paths found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {paths.map((path: any) => (
            <Link href={`/skills/${path._id.toString()}`} key={path._id.toString()}>
              <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all border border-slate-100 flex flex-col h-full group cursor-pointer">
                <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  🧭
                </div>
                <h2 className="text-2xl font-bold text-indigo-950 mb-3 group-hover:text-emerald-600 transition-colors">{path.title}</h2>
                <p className="text-slate-600 leading-relaxed mb-6 flex-grow">{path.description}</p>
                <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-100">
                  <span className="text-sm font-semibold text-slate-500">{path.courses?.length || 0} Courses</span>
                  <span className="text-emerald-600 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                    Explore <span aria-hidden="true">&rarr;</span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
