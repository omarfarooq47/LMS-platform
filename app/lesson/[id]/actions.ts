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
