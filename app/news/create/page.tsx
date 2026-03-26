import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import connectToDatabase from "@/lib/mongodb";
import { Lesson } from "@/lib/models";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function CreateNewsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.isApproved) redirect("/");

  async function handleCreate(formData: FormData) {
    "use server";
    const title = formData.get("title") as string;
    const session = await getServerSession(authOptions);
    
    await connectToDatabase();
    const news = await Lesson.create({
      title,
      creator: session?.user?.id,
      contentBlocks: [{ id: 'init', type: 'text', data: 'Start your news article here...' }]
    });
    redirect(`/lesson/${news._id}`);
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-indigo-950 tracking-tight">Post School News</h1>
        <p className="text-slate-500 mt-2">Share announcements or stories with the community.</p>
      </div>
      <form action={handleCreate} className="space-y-6 bg-white p-10 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
        <div className="relative z-10 space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Article Title</label>
            <Input name="title" required placeholder="e.g. Annual Sports Day 2026" className="h-12 text-lg bg-slate-50 border-emerald-100 focus-visible:ring-emerald-500" />
          </div>
          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 text-lg rounded-xl shadow-md transition-all hover:scale-[1.01]">
            Start Writing
          </Button>
        </div>
      </form>
    </div>
  );
}
