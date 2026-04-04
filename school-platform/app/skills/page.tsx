import connectToDatabase from "@/lib/mongodb";
import { SkillPath } from "@/lib/models";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Button, Input } from "@base-ui/react";

export const revalidate = 60;

export default async function SkillsPage() {
  await connectToDatabase();
  const paths = await SkillPath.find().sort({ createdAt: -1 }).populate('courses').lean();

  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.isApproved) redirect("/");

  async function handleCreate(formData: FormData) {
    "use server";
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const session = await getServerSession(authOptions);

    await connectToDatabase();
    const skillpath = await SkillPath.create({
      title,
      description,
      creator: session?.user?.id,
      status: 'initialized'
    });
    redirect(`/skills/${skillpath._id}`);
  }
  return (
    <div className="min-h-screen">
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold text-foreground mb-4 tracking-tight">Skill Paths</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Curated journeys designed to take you from beginner to expert.
          Follow a path, master the skills, and unlock your potential.
        </p>
      </div>
      
      {paths.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-3xl border border-dashed border-border">
          <span className="text-5xl text-muted-foreground block mb-4">🗺️</span>
          <p className="text-xl text-muted-foreground font-medium">No skill paths found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {paths.map((path: any) => (
            <Link href={`/skills/${path._id.toString()}`} key={path._id.toString()}>
              <div className="bg-card rounded-3xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all border border-border flex flex-col h-full group cursor-pointer">
                <div className="w-16 h-16 bg-indigo-900/60 text-indigo-400 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  🧭
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-3 group-hover:text-emerald-400 transition-colors">{path.title}</h2>
                <p className="text-muted-foreground leading-relaxed mb-6 grow">{path.description}</p>
                <div className="flex items-center justify-between mt-auto pt-6 border-t border-border">
                  <div className="flex items-center gap-3 text-sm font-semibold text-muted-foreground">
                    <span>{path.courses?.length || 0} Courses</span>
                    {(path.books?.length || 0) > 0 && <span>· {path.books.length} Books</span>}
                    {(path.newsItems?.length || 0) > 0 && <span>· {path.newsItems.length} Articles</span>}
                  </div>
                  <span className="text-emerald-400 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                    Explore <span aria-hidden="true">&rarr;</span>
                  </span>
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
