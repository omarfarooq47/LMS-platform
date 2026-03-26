import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import { Course, Lesson, UserProgress } from "@/lib/models";
import { notFound } from "next/navigation";
import { CourseClientWrapper } from "./CourseClientWrapper";
import { revalidatePath } from "next/cache";

async function updateStatus(id: string, formData: FormData) {
  "use server";
  const status = formData.get("status") as string;
  await connectToDatabase();
  await Course.findByIdAndUpdate(id, { status });
  revalidatePath(`/course/${id}`);
}

async function updateCourseDetails(id: string, formData: FormData) {
  "use server";
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  await connectToDatabase();
  await Course.findByIdAndUpdate(id, { title, description });
  revalidatePath(`/course/${id}`);
}

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);
  
  await connectToDatabase();
  const course = await Course.findById(resolvedParams.id).populate('creator', 'name').lean();
  
  if (!course) {
    notFound();
  }

  const lessons = await Lesson.find({ courseId: course._id }).sort({ createdAt: 1 }).lean();
  
  let userProgress: any[] = [];
  if (session?.user?.id) {
    userProgress = await UserProgress.find({ 
      userId: session.user.id,
      lessonId: { $in: lessons.map(l => l._id) }
    }).lean();
  }

  const completedLessonIds = new Set(userProgress.filter(p => p.completed).map(p => p.lessonId.toString()));
  const allLessonsCompleted = lessons.length > 0 && lessons.every(l => completedLessonIds.has(l._id.toString()));

  const canEdit = session?.user?.role === 'staff' || session?.user?.id === course.creator?._id?.toString();

  const safeCourse = {
    _id: course._id.toString(),
    title: course.title,
    description: course.description,
    status: course.status,
    creator: course.creator ? { name: course.creator.name } : null
  };

  const safeLessons = lessons.map((l: any) => ({
    _id: l._id.toString(),
    title: l.title
  }));

  const boundUpdateStatus = updateStatus.bind(null, resolvedParams.id);
  const boundUpdateDetails = updateCourseDetails.bind(null, resolvedParams.id);

  return (
    <CourseClientWrapper 
      course={safeCourse}
      lessons={safeLessons}
      canEdit={canEdit}
      completedLessonIds={Array.from(completedLessonIds)}
      allLessonsCompleted={allLessonsCompleted}
      updateStatusAction={boundUpdateStatus}
      updateCourseDetailsAction={boundUpdateDetails}
    />
  );
}
