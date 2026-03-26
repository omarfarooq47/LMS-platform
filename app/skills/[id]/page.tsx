import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import { SkillPath, Course } from "@/lib/models";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { SkillClientWrapper } from "./SkillClientWrapper";

async function updateSkillDetails(id: string, formData: FormData) {
  "use server";
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  await connectToDatabase();
  await SkillPath.findByIdAndUpdate(id, { title, description });
  revalidatePath(`/skills/${id}`);
}

export default async function SkillPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);
  
  await connectToDatabase();
  const skill = await SkillPath.findById(resolvedParams.id).populate('courses').lean();
  
  if (!skill) {
    notFound();
  }

  const canEdit = session?.user?.role === 'staff';

  const safeSkill = {
    _id: skill._id.toString(),
    title: skill.title,
    description: skill.description,
    courses: skill.courses ? skill.courses.map((c: any) => ({
      _id: c._id.toString(),
      title: c.title,
      description: c.description
    })) : []
  };

  const boundUpdateSkillDetails = updateSkillDetails.bind(null, resolvedParams.id);

  return (
    <SkillClientWrapper 
      skill={safeSkill}
      canEdit={canEdit}
      updateSkillDetailsAction={boundUpdateSkillDetails}
    />
  );
}
