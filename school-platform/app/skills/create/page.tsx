import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import connectToDatabase from "@/lib/mongodb";
import { SkillPath } from "@/lib/models";
import { Button } from "@/components/ui-therapy/button";
import { Input } from "@/components/ui-therapy/input";
import { Textarea } from "@/components/ui-therapy/textarea";

export default async function CreateSkillPathPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    console.log("No session user id");
    redirect("/?error=no_session");
  }

  async function handleCreate(formData: FormData) {
    "use server";
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    
    await connectToDatabase();
    const newSkill = await SkillPath.create({
      title,
      description,
      courses: [],
    });
    redirect(`/skills/${newSkill._id}`);
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-indigo-950 tracking-tight">Create Skill Path</h1>
        <p className="text-slate-500 mt-2">Curate a journey of courses to help students master a domain.</p>
      </div>
      <form action={handleCreate} className="space-y-6 bg-white p-10 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -ml-10 -mt-10" />
        <div className="relative z-10 space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Path Title</label>
            <Input name="title" required placeholder="e.g. Frontend Web Development" className="h-12 text-lg bg-slate-50" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Description</label>
            <Textarea name="description" required placeholder="What domain does this path cover?" rows={4} className="bg-slate-50 resize-none text-base p-4" />
          </div>
          <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white py-6 text-lg rounded-xl shadow-md transition-all hover:scale-[1.01]">
            Create Path
          </Button>
        </div>
      </form>
    </div>
  );
}
