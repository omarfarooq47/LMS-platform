import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import { Lesson, Course, Comment, UserProgress } from "@/lib/models";
import { notFound, redirect } from "next/navigation";
import { LessonClientWrapper } from "./LessonClientWrapper";

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/");
  }

  await connectToDatabase();
  const lesson = await Lesson.findById(resolvedParams.id).populate('creator', 'name').lean();
  
  if (!lesson) {
    notFound();
  }

  let courseLessons: any[] = [];
  let currentCourse = null;
  let courseCurriculum: any[] = [];
  if (lesson.courseId) {
    currentCourse = await Course.findById(lesson.courseId).lean();
    courseLessons = await Lesson.find({ courseId: lesson.courseId }).sort({ createdAt: 1 }).select('title _id').lean();
    courseCurriculum = ((currentCourse as any)?.curriculum || []).map((item: any) => ({
      type: item.type,
      itemId: item.itemId,
      ...(item.title ? { title: item.title } : {}),
    }));
  }

  const comments = await Comment.find({ lessonId: lesson._id }).sort({ createdAt: -1 }).populate('author', 'name image').lean();
  
  const canEdit = session.user.role === 'staff' || session.user.id === lesson.creator._id.toString();

  return (
    <div className="container mx-auto px-4 py-8">
      <LessonClientWrapper 
        lesson={JSON.parse(JSON.stringify(lesson))}
        courseLessons={JSON.parse(JSON.stringify(courseLessons))}
        currentCourse={JSON.parse(JSON.stringify(currentCourse))}
        courseCurriculum={courseCurriculum}
        comments={JSON.parse(JSON.stringify(comments))}
        canEdit={canEdit}
        userId={session.user.id}
      />
    </div>
  );
}
