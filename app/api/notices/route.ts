import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import { Notice } from "@/lib/models";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "staff") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, content } = await req.json();

  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "Title and content are required." }, { status: 400 });
  }

  await connectToDatabase();

  const notice = await Notice.create({
    title: title.trim(),
    content: content.trim(),
    author: session.user.id,
  });

  const populated = await notice.populate("author", "name");

  return NextResponse.json({
    _id: populated._id.toString(),
    title: populated.title,
    content: populated.content,
    author: { name: (populated.author as any).name },
    createdAt: populated.createdAt,
  });
}
