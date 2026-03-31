"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import { Lesson, UserProgress, Comment } from "@/lib/models";

export async function updateLessonBlocks(lessonId: string, blocks: any[]) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  await connectToDatabase();
  await Lesson.findByIdAndUpdate(lessonId, { contentBlocks: blocks });
}

export async function updateLessonTitle(lessonId: string, title: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  await connectToDatabase();
  await Lesson.findByIdAndUpdate(lessonId, { title });
  const { revalidatePath } = await import('next/cache');
  revalidatePath(`/lesson/${lessonId}`);
}

export async function markLessonCompleted(lessonId: string, timeSpent: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");
  await connectToDatabase();
  
  await UserProgress.findOneAndUpdate(
    { userId: session.user.id, lessonId },
    { $set: { completed: true }, $inc: { timeSpent: timeSpent } },
    { upsert: true, new: true }
  );
}

export async function addComment(lessonId: string, content: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");
  await connectToDatabase();
  
  await Comment.create({
    content,
    author: session.user.id,
    lessonId
  });
}

export async function reorderCourseLessons(courseId: string, lessonIds: string[]) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  await connectToDatabase();
  const { Course } = await import('@/lib/models');
  await Course.findByIdAndUpdate(courseId, { lessons: lessonIds });
}

export async function updateCourseCurriculum(courseId: string, curriculum: { type: string; itemId: string; title?: string }[]) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  await connectToDatabase();
  const { Course } = await import('@/lib/models');
  await Course.findByIdAndUpdate(courseId, { curriculum });
  const { revalidatePath } = await import('next/cache');
  revalidatePath(`/course/${courseId}`);
}
