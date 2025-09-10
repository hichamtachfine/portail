import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  serial,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User roles enum
export const userRoleEnum = pgEnum('user_role', ['student', 'teacher', 'admin']);

// User storage table.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username", { length: 50 }).unique(),
  email: varchar("email").unique(),
  password: varchar("password"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: userRoleEnum("role").default("student").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Hierarchical categories
export const cities = pgTable("cities", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const schools = pgTable("schools", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  cityId: serial("city_id").references(() => cities.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const semesters = pgTable("semesters", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  schoolId: serial("school_id").references(() => schools.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  semesterId: serial("semester_id").references(() => semesters.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  groupId: serial("group_id").references(() => groups.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Content types enum
export const contentTypeEnum = pgEnum('content_type', ['lesson', 'exercise']);

// Lessons and exercises
export const contents = pgTable("contents", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: contentTypeEnum("type").notNull(),
  filePath: varchar("file_path", { length: 500 }).notNull(),
  originalFileName: varchar("original_file_name", { length: 255 }).notNull(),
  subjectId: serial("subject_id").references(() => subjects.id),
  uploadedBy: varchar("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// PDF page images for display
export const contentPages = pgTable("content_pages", {
  id: serial("id").primaryKey(),
  contentId: serial("content_id").references(() => contents.id),
  pageNumber: serial("page_number").notNull(),
  imagePath: varchar("image_path", { length: 500 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  contents: many(contents),
}));

export const citiesRelations = relations(cities, ({ many }) => ({
  schools: many(schools),
}));

export const schoolsRelations = relations(schools, ({ one, many }) => ({
  city: one(cities, {
    fields: [schools.cityId],
    references: [cities.id],
  }),
  semesters: many(semesters),
}));

export const semestersRelations = relations(semesters, ({ one, many }) => ({
  school: one(schools, {
    fields: [semesters.schoolId],
    references: [schools.id],
  }),
  groups: many(groups),
}));

export const groupsRelations = relations(groups, ({ one, many }) => ({
  semester: one(semesters, {
    fields: [groups.semesterId],
    references: [semesters.id],
  }),
  subjects: many(subjects),
}));

export const subjectsRelations = relations(subjects, ({ one, many }) => ({
  group: one(groups, {
    fields: [subjects.groupId],
    references: [groups.id],
  }),
  contents: many(contents),
}));

export const contentsRelations = relations(contents, ({ one, many }) => ({
  subject: one(subjects, {
    fields: [contents.subjectId],
    references: [subjects.id],
  }),
  uploader: one(users, {
    fields: [contents.uploadedBy],
    references: [users.id],
  }),
  pages: many(contentPages),
}));

export const contentPagesRelations = relations(contentPages, ({ one }) => ({
  content: one(contents, {
    fields: [contentPages.contentId],
    references: [contents.id],
  }),
}));

// Insert schemas
export const insertCitySchema = createInsertSchema(cities).pick({
  name: true,
  slug: true,
});

export const insertSchoolSchema = createInsertSchema(schools).pick({
  name: true,
  slug: true,
  cityId: true,
});

export const insertSemesterSchema = createInsertSchema(semesters).pick({
  name: true,
  slug: true,
  schoolId: true,
});

export const insertGroupSchema = createInsertSchema(groups).pick({
  name: true,
  slug: true,
  semesterId: true,
});

export const insertSubjectSchema = createInsertSchema(subjects).pick({
  name: true,
  slug: true,
  groupId: true,
});

export const insertContentSchema = createInsertSchema(contents).pick({
  title: true,
  description: true,
  type: true,
  filePath: true,
  originalFileName: true,
  subjectId: true,
});

export const insertContentPageSchema = createInsertSchema(contentPages).pick({
  contentId: true,
  pageNumber: true,
  imagePath: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  role: true,
});

export const loginUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Types
export type InsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type City = typeof cities.$inferSelect;
export type School = typeof schools.$inferSelect;
export type Semester = typeof semesters.$inferSelect;
export type Group = typeof groups.$inferSelect;
export type Subject = typeof subjects.$inferSelect;
export type Content = typeof contents.$inferSelect;
export type ContentPage = typeof contentPages.$inferSelect;

export type InsertCity = z.infer<typeof insertCitySchema>;
export type InsertSchool = z.infer<typeof insertSchoolSchema>;
export type InsertSemester = z.infer<typeof insertSemesterSchema>;
export type InsertGroup = z.infer<typeof insertGroupSchema>;
export type InsertSubject = z.infer<typeof insertSubjectSchema>;
export type InsertContent = z.infer<typeof insertContentSchema>;
export type InsertContentPage = z.infer<typeof insertContentPageSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
