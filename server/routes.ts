import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin } from "./auth";
import { insertCitySchema, insertSchoolSchema, insertSemesterSchema, insertGroupSchema, insertSubjectSchema, insertContentSchema, insertUserSchema, loginUserSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for PDF uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  setupAuth(app);

  // Auth routes
  app.get('/api/user', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      res.json({ ...user, password: undefined });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Category routes
  app.get('/api/cities', async (req, res) => {
    try {
      const cities = await storage.getCities();
      res.json(cities);
    } catch (error) {
      console.error("Error fetching cities:", error);
      res.status(500).json({ message: "Failed to fetch cities" });
    }
  });

  app.get('/api/cities/:cityId/schools', async (req, res) => {
    try {
      const cityId = parseInt(req.params.cityId);
      const schools = await storage.getSchoolsByCity(cityId);
      res.json(schools);
    } catch (error) {
      console.error("Error fetching schools:", error);
      res.status(500).json({ message: "Failed to fetch schools" });
    }
  });

  app.get('/api/schools/:schoolId/semesters', async (req, res) => {
    try {
      const schoolId = parseInt(req.params.schoolId);
      const semesters = await storage.getSemestersBySchool(schoolId);
      res.json(semesters);
    } catch (error) {
      console.error("Error fetching semesters:", error);
      res.status(500).json({ message: "Failed to fetch semesters" });
    }
  });

  app.get('/api/semesters/:semesterId/groups', async (req, res) => {
    try {
      const semesterId = parseInt(req.params.semesterId);
      const groups = await storage.getGroupsBySemester(semesterId);
      res.json(groups);
    } catch (error) {
      console.error("Error fetching groups:", error);
      res.status(500).json({ message: "Failed to fetch groups" });
    }
  });

  app.get('/api/groups/:groupId/subjects', async (req, res) => {
    try {
      const groupId = parseInt(req.params.groupId);
      const subjects = await storage.getSubjectsByGroup(groupId);
      res.json(subjects);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      res.status(500).json({ message: "Failed to fetch subjects" });
    }
  });

  app.get('/api/subjects/:subjectId/contents', async (req, res) => {
    try {
      const subjectId = parseInt(req.params.subjectId);
      const contents = await storage.getContentsBySubject(subjectId);
      res.json(contents);
    } catch (error) {
      console.error("Error fetching contents:", error);
      res.status(500).json({ message: "Failed to fetch contents" });
    }
  });

  app.get('/api/contents/:contentId', async (req, res) => {
    try {
      const contentId = parseInt(req.params.contentId);
      const content = await storage.getContentById(contentId);
      if (!content) {
        return res.status(404).json({ message: "Content not found" });
      }
      const pages = await storage.getContentPages(contentId);
      res.json({ ...content, pages });
    } catch (error) {
      console.error("Error fetching content:", error);
      res.status(500).json({ message: "Failed to fetch content" });
    }
  });

  // Admin-only category management routes
  app.post('/api/cities', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const cityData = insertCitySchema.parse(req.body);
      const city = await storage.createCity(cityData);
      res.json(city);
    } catch (error) {
      console.error("Error creating city:", error);
      res.status(500).json({ message: "Failed to create city" });
    }
  });

  app.post('/api/schools', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const schoolData = insertSchoolSchema.parse(req.body);
      const school = await storage.createSchool(schoolData);
      res.json(school);
    } catch (error) {
      console.error("Error creating school:", error);
      res.status(500).json({ message: "Failed to create school" });
    }
  });

  app.post('/api/semesters', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const semesterData = insertSemesterSchema.parse(req.body);
      const semester = await storage.createSemester(semesterData);
      res.json(semester);
    } catch (error) {
      console.error("Error creating semester:", error);
      res.status(500).json({ message: "Failed to create semester" });
    }
  });

  app.post('/api/groups', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const groupData = insertGroupSchema.parse(req.body);
      const group = await storage.createGroup(groupData);
      res.json(group);
    } catch (error) {
      console.error("Error creating group:", error);
      res.status(500).json({ message: "Failed to create group" });
    }
  });

  app.post('/api/subjects', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const subjectData = insertSubjectSchema.parse(req.body);
      const subject = await storage.createSubject(subjectData);
      res.json(subject);
    } catch (error) {
      console.error("Error creating subject:", error);
      res.status(500).json({ message: "Failed to create subject" });
    }
  });

  // Content upload route (teachers and admins)
  app.post('/api/contents', isAuthenticated, upload.single('pdf'), async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role === 'student') {
        return res.status(403).json({ message: "Students cannot upload content" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "PDF file is required" });
      }

      const contentData = insertContentSchema.parse({
        ...req.body,
        filePath: req.file.path,
        originalFileName: req.file.originalname,
      });

      const content = await storage.createContent({
        ...contentData,
        uploadedBy: req.user.id,
      });

      // TODO: Implement PDF to image conversion here
      // For now, we'll create placeholder pages
      await storage.createContentPage({
        contentId: content.id,
        pageNumber: 1,
        imagePath: `/uploads/placeholder-page-1.jpg`,
      });

      res.json(content);
    } catch (error) {
      console.error("Error uploading content:", error);
      res.status(500).json({ message: "Failed to upload content" });
    }
  });

  // Delete content route
  app.delete('/api/contents/:contentId', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      const contentId = parseInt(req.params.contentId);
      const content = await storage.getContentById(contentId);

      if (!content) {
        return res.status(404).json({ message: "Content not found" });
      }

      // Teachers can only delete their own content, admins can delete any content
      if (user?.role === 'teacher' && content.uploadedBy !== req.user.id) {
        return res.status(403).json({ message: "You can only delete your own content" });
      }

      if (user?.role === 'student') {
        return res.status(403).json({ message: "Students cannot delete content" });
      }

      await storage.deleteContent(contentId);
      
      // TODO: Also delete the actual files from disk
      
      res.json({ message: "Content deleted successfully" });
    } catch (error) {
      console.error("Error deleting content:", error);
      res.status(500).json({ message: "Failed to delete content" });
    }
  });

  // Get user's own content (for teachers)
  app.get('/api/my-contents', isAuthenticated, async (req: any, res) => {
    try {
      const contents = await storage.getContentsByUser(req.user.id);
      res.json(contents);
    } catch (error) {
      console.error("Error fetching user contents:", error);
      res.status(500).json({ message: "Failed to fetch contents" });
    }
  });

  // Admin user management routes
  app.get('/api/admin/users', isAdmin, async (req: any, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users.map(user => ({ ...user, password: undefined })));
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.delete('/api/admin/users/:userId', isAdmin, async (req: any, res) => {
    try {
      const userId = req.params.userId;
      // Prevent admin from deleting themselves
      if (userId === req.user.id) {
        return res.status(400).json({ message: "Cannot delete yourself" });
      }
      
      await storage.deleteUser(userId);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Navigation helper routes
  app.get('/api/navigate/city/:slug', async (req, res) => {
    try {
      const city = await storage.getCityBySlug(req.params.slug);
      if (!city) {
        return res.status(404).json({ message: "City not found" });
      }
      res.json(city);
    } catch (error) {
      console.error("Error finding city:", error);
      res.status(500).json({ message: "Failed to find city" });
    }
  });

  // Serve uploaded files
  app.get('/uploads/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(uploadDir, filename);
    
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ message: "File not found" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
