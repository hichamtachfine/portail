import {
  users,
  cities,
  schools,
  semesters,
  groups,
  subjects,
  contents,
  contentPages,
  type User,
  type UpsertUser,
  type City,
  type School,
  type Semester,
  type Group,
  type Subject,
  type Content,
  type ContentPage,
  type InsertCity,
  type InsertSchool,
  type InsertSemester,
  type InsertGroup,
  type InsertSubject,
  type InsertContent,
  type InsertContentPage,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Category operations
  getCities(): Promise<City[]>;
  getSchoolsByCity(cityId: number): Promise<School[]>;
  getSemestersBySchool(schoolId: number): Promise<Semester[]>;
  getGroupsBySemester(semesterId: number): Promise<Group[]>;
  getSubjectsByGroup(groupId: number): Promise<Subject[]>;
  
  // CRUD operations for categories (admin only)
  createCity(city: InsertCity): Promise<City>;
  createSchool(school: InsertSchool): Promise<School>;
  createSemester(semester: InsertSemester): Promise<Semester>;
  createGroup(group: InsertGroup): Promise<Group>;
  createSubject(subject: InsertSubject): Promise<Subject>;
  
  deleteCity(id: number): Promise<void>;
  deleteSchool(id: number): Promise<void>;
  deleteSemester(id: number): Promise<void>;
  deleteGroup(id: number): Promise<void>;
  deleteSubject(id: number): Promise<void>;
  
  // Content operations
  getContentsBySubject(subjectId: number): Promise<Content[]>;
  getContentById(id: number): Promise<Content | undefined>;
  getContentPages(contentId: number): Promise<ContentPage[]>;
  createContent(content: InsertContent): Promise<Content>;
  createContentPage(page: InsertContentPage): Promise<ContentPage>;
  deleteContent(id: number): Promise<void>;
  getContentsByUser(userId: string): Promise<Content[]>;
  
  // Hierarchy navigation helpers
  getCityBySlug(slug: string): Promise<City | undefined>;
  getSchoolBySlug(cityId: number, slug: string): Promise<School | undefined>;
  getSemesterBySlug(schoolId: number, slug: string): Promise<Semester | undefined>;
  getGroupBySlug(semesterId: number, slug: string): Promise<Group | undefined>;
  getSubjectBySlug(groupId: number, slug: string): Promise<Subject | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Category operations
  async getCities(): Promise<City[]> {
    return await db.select().from(cities).orderBy(asc(cities.name));
  }

  async getSchoolsByCity(cityId: number): Promise<School[]> {
    return await db.select().from(schools).where(eq(schools.cityId, cityId)).orderBy(asc(schools.name));
  }

  async getSemestersBySchool(schoolId: number): Promise<Semester[]> {
    return await db.select().from(semesters).where(eq(semesters.schoolId, schoolId)).orderBy(asc(semesters.name));
  }

  async getGroupsBySemester(semesterId: number): Promise<Group[]> {
    return await db.select().from(groups).where(eq(groups.semesterId, semesterId)).orderBy(asc(groups.name));
  }

  async getSubjectsByGroup(groupId: number): Promise<Subject[]> {
    return await db.select().from(subjects).where(eq(subjects.groupId, groupId)).orderBy(asc(subjects.name));
  }

  // CRUD operations for categories
  async createCity(city: InsertCity): Promise<City> {
    const [newCity] = await db.insert(cities).values(city).returning();
    return newCity;
  }

  async createSchool(school: InsertSchool): Promise<School> {
    const [newSchool] = await db.insert(schools).values(school).returning();
    return newSchool;
  }

  async createSemester(semester: InsertSemester): Promise<Semester> {
    const [newSemester] = await db.insert(semesters).values(semester).returning();
    return newSemester;
  }

  async createGroup(group: InsertGroup): Promise<Group> {
    const [newGroup] = await db.insert(groups).values(group).returning();
    return newGroup;
  }

  async createSubject(subject: InsertSubject): Promise<Subject> {
    const [newSubject] = await db.insert(subjects).values(subject).returning();
    return newSubject;
  }

  async deleteCity(id: number): Promise<void> {
    await db.delete(cities).where(eq(cities.id, id));
  }

  async deleteSchool(id: number): Promise<void> {
    await db.delete(schools).where(eq(schools.id, id));
  }

  async deleteSemester(id: number): Promise<void> {
    await db.delete(semesters).where(eq(semesters.id, id));
  }

  async deleteGroup(id: number): Promise<void> {
    await db.delete(groups).where(eq(groups.id, id));
  }

  async deleteSubject(id: number): Promise<void> {
    await db.delete(subjects).where(eq(subjects.id, id));
  }

  // Content operations
  async getContentsBySubject(subjectId: number): Promise<Content[]> {
    return await db.select().from(contents).where(eq(contents.subjectId, subjectId)).orderBy(desc(contents.createdAt));
  }

  async getContentById(id: number): Promise<Content | undefined> {
    const [content] = await db.select().from(contents).where(eq(contents.id, id));
    return content;
  }

  async getContentPages(contentId: number): Promise<ContentPage[]> {
    return await db.select().from(contentPages).where(eq(contentPages.contentId, contentId)).orderBy(asc(contentPages.pageNumber));
  }

  async createContent(content: InsertContent): Promise<Content> {
    const [newContent] = await db.insert(contents).values(content).returning();
    return newContent;
  }

  async createContentPage(page: InsertContentPage): Promise<ContentPage> {
    const [newPage] = await db.insert(contentPages).values(page).returning();
    return newPage;
  }

  async deleteContent(id: number): Promise<void> {
    // Delete associated pages first
    await db.delete(contentPages).where(eq(contentPages.contentId, id));
    // Then delete the content
    await db.delete(contents).where(eq(contents.id, id));
  }

  async getContentsByUser(userId: string): Promise<Content[]> {
    return await db.select().from(contents).where(eq(contents.uploadedBy, userId)).orderBy(desc(contents.createdAt));
  }

  // Hierarchy navigation helpers
  async getCityBySlug(slug: string): Promise<City | undefined> {
    const [city] = await db.select().from(cities).where(eq(cities.slug, slug));
    return city;
  }

  async getSchoolBySlug(cityId: number, slug: string): Promise<School | undefined> {
    const [school] = await db.select().from(schools).where(and(eq(schools.cityId, cityId), eq(schools.slug, slug)));
    return school;
  }

  async getSemesterBySlug(schoolId: number, slug: string): Promise<Semester | undefined> {
    const [semester] = await db.select().from(semesters).where(and(eq(semesters.schoolId, schoolId), eq(semesters.slug, slug)));
    return semester;
  }

  async getGroupBySlug(semesterId: number, slug: string): Promise<Group | undefined> {
    const [group] = await db.select().from(groups).where(and(eq(groups.semesterId, semesterId), eq(groups.slug, slug)));
    return group;
  }

  async getSubjectBySlug(groupId: number, slug: string): Promise<Subject | undefined> {
    const [subject] = await db.select().from(subjects).where(and(eq(subjects.groupId, groupId), eq(subjects.slug, slug)));
    return subject;
  }
}

export const storage = new DatabaseStorage();
