import mongoose, { Schema, model, models } from 'mongoose';

// User Schema
const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  image: { type: String },
  role: { type: String, enum: ['staff', 'student'] },
  parentPhone: { type: String },
  isApproved: { type: Boolean, default: false },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Notice Schema
const NoticeSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

// Lesson Schema
const blockSchema = new Schema({
  id: { type: String, required: true },
  type: { type: String, enum: ['text', 'video', 'image'], required: true },
  data: { type: Schema.Types.Mixed, required: true },
}, { _id: false });

const LessonSchema = new Schema({
  title: { type: String, required: true },
  contentBlocks: { type: [blockSchema], default: [] },
  creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
}, { timestamps: true });

// Course Schema
const CourseSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  pathId: { type: Schema.Types.ObjectId, ref: 'SkillPath' },
  status: { 
    type: String, 
    enum: ['confirmed', 'initialized', '50% content', '100% content', 'blocked', 'reviewed', 'incorporated', 'published', 'canceled'],
    default: 'initialized'
  },
  lessons: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }],
  coverDiagram: { type: Schema.Types.Mixed },
}, { timestamps: true });

// SkillPath Schema
const SkillPathSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  courses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
  books: [{ type: Schema.Types.Mixed }],
}, { timestamps: true });

// Comment Schema
const CommentSchema = new Schema({
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true },
}, { timestamps: true });

// UserProgress Schema
const UserProgressSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true },
  completed: { type: Boolean, default: false },
  timeSpent: { type: Number, default: 0 },
}, { timestamps: true });

export const User = models.User || model('User', UserSchema);
export const Notice = models.Notice || model('Notice', NoticeSchema);
export const Lesson = models.Lesson || model('Lesson', LessonSchema);
export const Course = models.Course || model('Course', CourseSchema);
export const SkillPath = models.SkillPath || model('SkillPath', SkillPathSchema);
export const Comment = models.Comment || model('Comment', CommentSchema);
export const UserProgress = models.UserProgress || model('UserProgress', UserProgressSchema);
