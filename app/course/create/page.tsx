import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import connectToDatabase from "@/lib/mongodb";
import { Course } from "@/lib/models";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default async function CreateCoursePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.isApproved) redirect("/");

  async function handleCreate(formData: FormData) {
    "use server";
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const session = await getServerSession(authOptions);
    
    await connectToDatabase();
    const course = await Course.create({
      title,
      description,
      creator: session?.user?.id,
      status: 'initialized'
    });
    redirect(`/course/${course._id}`);
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Create New Course</h1>
        <p className="text-muted-foreground mt-2">Design an interactive learning experience.</p>
      </div>
      <form action={handleCreate} className="space-y-6 bg-card p-10 rounded-3xl shadow-sm border border-border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mr-10 -mt-10" />
        <div className="relative z-10 space-y-6">
          <div>
            <label className="block text-sm font-bold text-muted-foreground mb-2 uppercase tracking-wider">Course Title</label>
            <Input name="title" required placeholder="e.g. Advanced Physics 101" className="h-12 text-lg text-foreground" />
          </div>
          <div>
            <label className="block text-sm font-bold text-muted-foreground mb-2 uppercase tracking-wider">Description</label>
            <Textarea name="description" required placeholder="What will students learn in this course?" rows={5} className="foreground resize-none text-base p-4" />
          </div>
          <Button type="submit" className="w-full py-6 text-lg rounded-xl shadow-md transition-all hover:scale-[1.01]">
            Create Course
          </Button>
        </div>
      </form>
    </div>
  );
}
