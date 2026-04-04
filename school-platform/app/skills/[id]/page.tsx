import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import { SkillPath, Course, Book, Lesson } from "@/lib/models";
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

async function addBookToSkill(id: string, bookId: string) {
  "use server";
  await connectToDatabase();
  await SkillPath.findByIdAndUpdate(id, { $addToSet: { books: bookId } });
  revalidatePath(`/skills/${id}`);
}

async function removeBookFromSkill(id: string, bookId: string) {
  "use server";
  await connectToDatabase();
  await SkillPath.findByIdAndUpdate(id, { $pull: { books: bookId } });
  revalidatePath(`/skills/${id}`);
}

async function addNewsToSkill(id: string, newsId: string) {
  "use server";
  await connectToDatabase();
  await SkillPath.findByIdAndUpdate(id, { $addToSet: { newsItems: newsId } });
  revalidatePath(`/skills/${id}`);
}

async function removeNewsFromSkill(id: string, newsId: string) {
  "use server";
  await connectToDatabase();
  await SkillPath.findByIdAndUpdate(id, { $pull: { newsItems: newsId } });
  revalidatePath(`/skills/${id}`);
}

export default async function SkillPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);

  await connectToDatabase();
  let skill;
  try {
    skill = await SkillPath.findById(resolvedParams.id)
      .populate('courses')
      .populate('books')
      .populate({ path: 'newsItems', populate: { path: 'creator', select: 'name' } })
      .lean();
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
    description: c.description,
  }));

  const allBooksRaw = await Book.find({}).lean();
  const allBooks = allBooksRaw.map((b: any) => ({
    _id: b._id.toString(),
    title: b.title,
    author: b.author,
    description: b.description ?? '',
    status: b.status,
  }));

  const allNewsRaw = await Lesson.find({ courseId: { $exists: false } })
    .populate('creator', 'name')
    .sort({ createdAt: -1 })
    .lean();
  const allNews = allNewsRaw.map((n: any) => ({
    _id: n._id.toString(),
    title: n.title,
    creatorName: n.creator?.name ?? 'Unknown',
    createdAt: new Date(n.createdAt as Date).toISOString(),
  }));

  const canEdit = session?.user?.isApproved && (
    session?.user?.role === 'staff' || session?.user?.id === skill.creator?.toString()
  );

  const safeSkill = {
    _id: skill._id.toString(),
    title: skill.title,
    description: skill.description,
    courses: skill.courses
      ? skill.courses.map((c: any) => ({
          _id: c._id.toString(),
          title: c.title,
          description: c.description,
        }))
      : [],
    books: skill.books
      ? skill.books
          .filter((b: any) => b && b._id) // skip deleted/nulled refs
          .map((b: any) => ({
            _id: b._id.toString(),
            title: b.title,
            author: b.author,
            description: b.description ?? '',
            status: b.status,
          }))
      : [],
    newsItems: skill.newsItems
      ? skill.newsItems
          .filter((n: any) => n && n._id)
          .map((n: any) => ({
            _id: n._id.toString(),
            title: n.title,
            creatorName: n.creator?.name ?? 'Unknown',
            createdAt: new Date(n.createdAt as Date).toISOString(),
          }))
      : [],
  };

  const boundUpdateSkillDetails = updateSkillDetails.bind(null, resolvedParams.id);
  const boundAddCourse = addCourseToSkill.bind(null, resolvedParams.id);
  const boundRemoveCourse = removeCourseFromSkill.bind(null, resolvedParams.id);
  const boundAddBook = addBookToSkill.bind(null, resolvedParams.id);
  const boundRemoveBook = removeBookFromSkill.bind(null, resolvedParams.id);
  const boundAddNews = addNewsToSkill.bind(null, resolvedParams.id);
  const boundRemoveNews = removeNewsFromSkill.bind(null, resolvedParams.id);

  return (
    <SkillClientWrapper
      skill={safeSkill}
      allCourses={allCourses}
      allBooks={allBooks}
      allNews={allNews}
      canEdit={canEdit}
      updateSkillDetailsAction={boundUpdateSkillDetails}
      addCourseAction={boundAddCourse}
      removeCourseAction={boundRemoveCourse}
      addBookAction={boundAddBook}
      removeBookAction={boundRemoveBook}
      addNewsAction={boundAddNews}
      removeNewsAction={boundRemoveNews}
    />
  );
}
