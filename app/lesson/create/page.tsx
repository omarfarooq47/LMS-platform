import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import { Course, Lesson } from "@/lib/models";
import { redirect } from "next/navigation";

export default async function CreateLessonPage({ searchParams }: { searchParams: Promise<{ courseId?: string }> }) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    console.log("No session user id");
    redirect('/?error=no_session');
  }

  const resolvedParams = await searchParams;
  const courseId = resolvedParams.courseId;

  if (!courseId) {
    console.log("No courseId");
    redirect('/staff/approvals'); // Redirect to a safe fallback
  }

  await connectToDatabase();
  const course = await Course.findById(courseId);
  
  if (!course) {
    console.log("Course not found for courseId:", courseId);
    redirect('/?error=no_course');
  }

  // Double check authorization, let staff or creator edit
  if (session.user.role !== 'staff' && session.user.id !== course.creator?.toString()) {
    console.log("Not authorized. Role:", session.user.role, "Creator:", course.creator?.toString());
    redirect(`/course/${courseId}?error=unauthorized`);
  }

  // Create an empty lesson structure
  const newLesson = await Lesson.create({
    title: "New Untitled Lesson",
    courseId: course._id,
    creator: session.user.id,
    contentBlocks: [
      { id: Date.now().toString(), type: 'text', data: '# Welcome to your new Lesson!\n\nUse the buttons below to add more content blocks, videos, and interactive diagrams.' }
    ]
  });

  // Redirect the user immediately to the dynamic route editor
  redirect(`/lesson/${newLesson._id.toString()}`);
}
