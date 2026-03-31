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

async function addCourseToSkill(id: string, courseId: string) {
  "use server";
  await connectToDatabase();
  await SkillPath.findByIdAndUpdate(id, { $addToSet: { courses: courseId } });
  revalidatePath(`/skills/${id}`);
}

async function removeCourseFromSkill(id: string, courseId: string) {
  "use server";
  await connectToDatabase();
  await SkillPath.findByIdAndUpdate(id, { $pull: { courses: courseId } });
  revalidatePath(`/skills/${id}`);
}

export default async function SkillPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);
  
  await connectToDatabase();
  let skill;
  try {
    skill = await SkillPath.findById(resolvedParams.id).populate('courses').lean();
  } catch (error) {
    // Gracefully catch Mongoose CastError on invalid ids
  }
  
  if (!skill) {
    notFound();
  }

  const allCoursesRaw = await Course.find({}).lean();
  const allCourses = allCoursesRaw.map((c: any) => ({
    _id: c._id.toString(),
    title: c.title,
    description: c.description
  }));

  const canEdit = session?.user?.isApproved && (
    session?.user?.role === 'staff' || session?.user?.id === skill.creator?.toString()
  );

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
  const boundAddCourse = addCourseToSkill.bind(null, resolvedParams.id);
  const boundRemoveCourse = removeCourseFromSkill.bind(null, resolvedParams.id);

  return (
    <SkillClientWrapper 
      skill={safeSkill}
      allCourses={allCourses}
      canEdit={canEdit}
      updateSkillDetailsAction={boundUpdateSkillDetails}
      addCourseAction={boundAddCourse}
      removeCourseAction={boundRemoveCourse}
    />
  );
}
