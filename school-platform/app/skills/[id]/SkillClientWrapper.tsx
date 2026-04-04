"use client";

import { useState } from 'react';
import { Button } from "@/components/ui-therapy/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye, Edit2, BookOpen, Save, PlusCircle, X, Search,
  Newspaper, BookCopy, ExternalLink, User, Calendar,
} from "lucide-react";
import { CourseDiagram } from "@/components/CourseDiagram";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

type BookItem = {
  _id: string;
  title: string;
  author: string;
  description: string;
  status: string; // 'available' | 'lended'
};

type NewsItem = {
  _id: string;
  title: string;
  creatorName: string;
  createdAt: string;
};

export function SkillClientWrapper({
  skill,
  allCourses,
  allBooks,
  allNews,
  canEdit,
  updateSkillDetailsAction,
  addCourseAction,
  removeCourseAction,
  addBookAction,
  removeBookAction,
  addNewsAction,
  removeNewsAction,
}: any) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  // Course search
  const [courseSearch, setCourseSearch] = useState('');

  // Book search & modal
  const [bookSearch, setBookSearch] = useState('');
  const [selectedBook, setSelectedBook] = useState<BookItem | null>(null);
  const [bookModalOpen, setBookModalOpen] = useState(false);

  // News search
  const [newsSearch, setNewsSearch] = useState('');

  // ── Courses ─────────────────────────────────────────────────────────────────
  const availableCourses: any[] = (allCourses ?? []).filter(
    (c: any) => !skill.courses?.find((sc: any) => sc._id === c._id)
  );
  const filteredCourses = courseSearch.trim()
    ? availableCourses.filter((c: any) =>
        c.title.toLowerCase().includes(courseSearch.toLowerCase()) ||
        (c.description ?? '').toLowerCase().includes(courseSearch.toLowerCase())
      )
    : availableCourses;

  // ── Books ────────────────────────────────────────────────────────────────────
  const availableBooks: BookItem[] = (allBooks ?? []).filter(
    (b: BookItem) => !skill.books?.find((sb: BookItem) => sb._id === b._id)
  );
  const filteredBooks = bookSearch.trim()
    ? availableBooks.filter((b) =>
        b.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
        b.author.toLowerCase().includes(bookSearch.toLowerCase()) ||
        b.description.toLowerCase().includes(bookSearch.toLowerCase())
      )
    : availableBooks;

  // ── News ─────────────────────────────────────────────────────────────────────
  const availableNews: NewsItem[] = (allNews ?? []).filter(
    (n: NewsItem) => !skill.newsItems?.find((sn: NewsItem) => sn._id === n._id)
  );
  const filteredNews = newsSearch.trim()
    ? availableNews.filter((n) =>
        n.title.toLowerCase().includes(newsSearch.toLowerCase()) ||
        n.creatorName.toLowerCase().includes(newsSearch.toLowerCase())
      )
    : availableNews;

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl relative">
      {canEdit && (
        <div className="flex justify-end gap-2 mb-4 sticky top-18 z-20">
          <Button
            variant={isEditing ? "outline" : "default"}
            onClick={() => setIsEditing(false)}
            className={`gap-2 ${!isEditing && 'bg-indigo-900 text-white shadow-md'}`}
          >
            <Eye className="w-4 h-4" /> Preview
          </Button>
          <Button
            variant={isEditing ? "default" : "outline"}
            onClick={() => setIsEditing(true)}
            className={`gap-2 ${isEditing && 'bg-indigo-900 text-white shadow-md'}`}
          >
            <Edit2 className="w-4 h-4" /> Edit
          </Button>
          {isEditing && (
            <Button type="submit" form="skill-edit-form" className="gap-2 bg-amber-600 hover:bg-amber-700 text-white shadow-md hover:scale-105 transition-transform ml-2">
              <Save className="w-4 h-4" /> Save Skill Path
            </Button>
          )}
        </div>
      )}

      {/* Header Section */}
      <div className={`bg-card rounded-3xl p-8 md:p-12 shadow-sm border mb-8 relative overflow-hidden transition-all ${isEditing ? 'border-dashed border-indigo-300 bg-muted' : 'border-border'}`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold uppercase tracking-wider">
              Skill Path
            </span>
          </div>
          {isEditing ? (
            <form id="skill-edit-form" action={async (formData) => {
              await updateSkillDetailsAction(formData);
              setIsEditing(false);
            }} className="space-y-4 max-w-3xl">
              <input name="title" type="text" defaultValue={skill.title} required className="w-full text-4xl md:text-5xl font-extrabold text-foreground bg-card border border-border rounded-xl px-4 py-2" placeholder="Skill Title" />
              <textarea name="description" defaultValue={skill.description} required className="w-full text-lg text-muted-foreground bg-card border border-border rounded-xl px-4 py-3 min-h-30" placeholder="Skill Description" />
            </form>
          ) : (
            <>
              <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6 tracking-tight">{skill.title}</h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">{skill.description}</p>
            </>
          )}
        </div>
      </div>

      {/* Illustration Section */}
      <div className="mb-12 border-t border-slate-100 pt-12">
        {isEditing ? (
          <div className="p-4 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-300">
            <CourseDiagram canEdit={true} persistenceKey={`skill-${skill._id}`} />
            <p className="text-xs text-slate-500 mt-3 text-center">Interactive Canvas (Edit Mode Only). Autosaves locally.</p>
          </div>
        ) : (
          <div className="rounded-3xl overflow-hidden shadow-lg border border-slate-100 bg-white relative">
            <CourseDiagram canEdit={false} persistenceKey={`skill-${skill._id}`} />
            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full font-medium z-10 pointer-events-none">
              Snapshot
            </div>
          </div>
        )}
      </div>

      {/* ── Required Courses ──────────────────────────────────────────────────── */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
          <span className="bg-amber-100 text-amber-600 p-2 rounded-lg"><BookOpen className="w-5 h-5" /></span>
          Required Courses
        </h2>

        {isEditing && (
          <div className="mb-8 p-6 bg-muted border border-border rounded-3xl">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <PlusCircle className="w-4 h-4" /> Add Courses to Path
            </h3>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                placeholder="Type to search courses…"
                className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-shadow"
              />
            </div>
            {courseSearch.trim().length > 0 && (
              filteredCourses.length > 0 ? (
                <div className="bg-card border border-border rounded-xl shadow-md overflow-hidden max-h-60 overflow-y-auto">
                  {filteredCourses.map((course: any) => (
                    <button
                      key={course._id}
                      type="button"
                      onClick={() => { addCourseAction(course._id); setCourseSearch(''); }}
                      className="w-full text-left px-4 py-3 hover:bg-muted transition-colors border-b border-border last:border-0 flex items-start gap-3 group"
                    >
                      <PlusCircle className="w-4 h-4 mt-0.5 text-indigo-400 group-hover:text-indigo-600 shrink-0" />
                      <div>
                        <div className="font-medium text-foreground text-sm">{course.title}</div>
                        {course.description && (
                          <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{course.description}</div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic mt-2 px-1">No matching courses found.</p>
              )
            )}
            {availableCourses.length === 0 && courseSearch.trim().length === 0 && (
              <p className="text-sm text-muted-foreground italic mt-2 px-1">All available courses are already in this path!</p>
            )}
          </div>
        )}

        {skill.courses?.length === 0 ? (
          <div className="p-8 bg-muted rounded-2xl border border-dashed border-border text-center text-muted-foreground">
            No courses in this path yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skill.courses?.map((course: any) => (
              <div key={course._id} className="relative group h-full">
                {isEditing && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-3 -right-3 rounded-full shadow-md z-10 w-8 h-8"
                    onClick={(e) => { e.preventDefault(); removeCourseAction(course._id); }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
                <Link href={`/course/${course._id}`} className="block h-full">
                  <div className="bg-card rounded-3xl p-6 shadow-sm border border-border hover:shadow-xl hover:-translate-y-1 transition-all h-full flex flex-col cursor-pointer">
                    <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6 line-clamp-3 grow">
                      {course.description}
                    </p>
                    <div className="flex items-center text-sm font-bold text-indigo-600 mt-auto">
                      View Course <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── News Articles ─────────────────────────────────────────────────────── */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
          <span className="bg-indigo-100 text-indigo-600 p-2 rounded-lg"><Newspaper className="w-5 h-5" /></span>
          Related News &amp; Articles
        </h2>

        {isEditing && (
          <div className="mb-8 p-6 bg-muted border border-border rounded-3xl">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <PlusCircle className="w-4 h-4" /> Add News Articles to Path
            </h3>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={newsSearch}
                onChange={(e) => setNewsSearch(e.target.value)}
                placeholder="Type to search news articles…"
                className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-shadow"
              />
            </div>
            {newsSearch.trim().length > 0 && (
              filteredNews.length > 0 ? (
                <div className="bg-card border border-border rounded-xl shadow-md overflow-hidden max-h-60 overflow-y-auto">
                  {filteredNews.map((news: NewsItem) => (
                    <button
                      key={news._id}
                      type="button"
                      onClick={() => { addNewsAction(news._id); setNewsSearch(''); }}
                      className="w-full text-left px-4 py-3 hover:bg-muted transition-colors border-b border-border last:border-0 flex items-start gap-3 group"
                    >
                      <PlusCircle className="w-4 h-4 mt-0.5 text-indigo-400 group-hover:text-indigo-600 shrink-0" />
                      <div>
                        <div className="font-medium text-foreground text-sm">{news.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {news.creatorName} · {new Date(news.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic mt-2 px-1">No matching news articles found.</p>
              )
            )}
            {availableNews.length === 0 && newsSearch.trim().length === 0 && (
              <p className="text-sm text-muted-foreground italic mt-2 px-1">All available news articles are already in this path!</p>
            )}
          </div>
        )}

        {!skill.newsItems || skill.newsItems.length === 0 ? (
          <div className="p-8 bg-muted rounded-2xl border border-dashed border-border text-center text-muted-foreground">
            No news articles linked to this path yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skill.newsItems.map((news: NewsItem) => (
              <div key={news._id} className="relative group h-full">
                {isEditing && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-3 -right-3 rounded-full shadow-md z-10 w-8 h-8"
                    onClick={(e) => { e.preventDefault(); removeNewsAction(news._id); }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
                <Link href={`/lesson/${news._id}`} className="block h-full">
                  <div className="bg-card rounded-3xl p-6 shadow-sm border border-border hover:shadow-xl hover:-translate-y-1 transition-all h-full flex flex-col cursor-pointer">
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Newspaper className="w-5 h-5" />
                    </div>
                    <Badge variant="secondary" className="w-fit mb-3 bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider border-none">
                      Article
                    </Badge>
                    <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2 grow">
                      {news.title}
                    </h3>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <User className="w-3 h-3" /> {news.creatorName}
                      </span>
                      <span className="text-xs font-semibold text-indigo-500 flex items-center gap-1 group-hover:gap-2 transition-all">
                        Read <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Recommended Books ─────────────────────────────────────────────────── */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
          <span className="bg-emerald-100 text-emerald-600 p-2 rounded-lg"><BookCopy className="w-5 h-5" /></span>
          Recommended Books
        </h2>

        {isEditing && (
          <div className="mb-8 p-6 bg-muted border border-border rounded-3xl">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <PlusCircle className="w-4 h-4" /> Add Books to Path
            </h3>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={bookSearch}
                onChange={(e) => setBookSearch(e.target.value)}
                placeholder="Type to search books…"
                className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-shadow"
              />
            </div>
            {bookSearch.trim().length > 0 && (
              filteredBooks.length > 0 ? (
                <div className="bg-card border border-border rounded-xl shadow-md overflow-hidden max-h-60 overflow-y-auto">
                  {filteredBooks.map((book: BookItem) => (
                    <button
                      key={book._id}
                      type="button"
                      onClick={() => { addBookAction(book._id); setBookSearch(''); }}
                      className="w-full text-left px-4 py-3 hover:bg-muted transition-colors border-b border-border last:border-0 flex items-start gap-3 group"
                    >
                      <PlusCircle className="w-4 h-4 mt-0.5 text-emerald-400 group-hover:text-emerald-600 shrink-0" />
                      <div>
                        <div className="font-medium text-foreground text-sm">{book.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">by {book.author}</div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic mt-2 px-1">No matching books found.</p>
              )
            )}
            {availableBooks.length === 0 && bookSearch.trim().length === 0 && (
              <p className="text-sm text-muted-foreground italic mt-2 px-1">All available books are already in this path!</p>
            )}
          </div>
        )}

        {!skill.books || skill.books.length === 0 ? (
          <div className="p-8 bg-muted rounded-2xl border border-dashed border-border text-center text-muted-foreground">
            No books recommended in this path yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skill.books.map((book: BookItem) => (
              <div key={book._id} className="relative group h-full">
                {isEditing && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-3 -right-3 rounded-full shadow-md z-10 w-8 h-8"
                    onClick={(e) => { e.preventDefault(); removeBookAction(book._id); }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
                <button
                  type="button"
                  className="block h-full w-full text-left"
                  onClick={() => { setSelectedBook(book); setBookModalOpen(true); }}
                >
                  <div className="bg-card rounded-3xl p-6 shadow-sm border border-border hover:shadow-xl hover:-translate-y-1 transition-all h-full flex flex-col cursor-pointer">
                    <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <BookCopy className="w-5 h-5" />
                    </div>
                    <Badge
                      variant="secondary"
                      className={`w-fit mb-3 text-xs font-bold uppercase tracking-wider border-none ${
                        book.status === 'available'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {book.status === 'available' ? 'Available' : 'On Loan'}
                    </Badge>
                    <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-emerald-600 transition-colors line-clamp-2">
                      {book.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2 grow">
                      by {book.author}
                    </p>
                    <div className="flex items-center text-sm font-bold text-emerald-600 mt-auto">
                      View details <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Book Detail Modal ─────────────────────────────────────────────────── */}
      <Dialog open={bookModalOpen} onOpenChange={(open) => { if (!open) { setBookModalOpen(false); setSelectedBook(null); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                <BookCopy className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl leading-tight">{selectedBook?.title}</DialogTitle>
                <p className="text-sm text-muted-foreground mt-0.5">by {selectedBook?.author}</p>
              </div>
            </div>
          </DialogHeader>

          <div className="py-2">
            <Badge
              variant="secondary"
              className={`mb-4 text-xs font-bold uppercase tracking-wider border-none ${
                selectedBook?.status === 'available'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {selectedBook?.status === 'available' ? '✓ Available to borrow' : '✗ Currently on loan'}
            </Badge>

            {selectedBook?.description ? (
              <DialogDescription className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                {selectedBook.description}
              </DialogDescription>
            ) : (
              <DialogDescription className="text-sm text-muted-foreground italic">
                No description available.
              </DialogDescription>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => { setBookModalOpen(false); setSelectedBook(null); }}
            >
              Close
            </Button>
            <Button
              disabled={selectedBook?.status !== 'available'}
              onClick={() => {
                setBookModalOpen(false);
                router.push('/library/borrow');
              }}
              className={`gap-2 ${
                selectedBook?.status === 'available'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'opacity-50 cursor-not-allowed'
              }`}
            >
              <BookCopy className="w-4 h-4" />
              Borrow Book
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
