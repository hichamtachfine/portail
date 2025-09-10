import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/Navigation";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft, Upload as UploadIcon, FileText } from "lucide-react";
import { Link } from "wouter";

const uploadSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  type: z.enum(["lesson", "exercise"]),
  cityId: z.string().min(1, "City is required"),
  schoolId: z.string().min(1, "School is required"),
  semesterId: z.string().min(1, "Semester is required"),
  groupId: z.string().min(1, "Group is required"),
  subjectId: z.string().min(1, "Subject is required"),
});

export default function Upload() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "lesson" as const,
      cityId: "",
      schoolId: "",
      semesterId: "",
      groupId: "",
      subjectId: "",
    },
  });

  const watchedCityId = form.watch("cityId");
  const watchedSchoolId = form.watch("schoolId");
  const watchedSemesterId = form.watch("semesterId");
  const watchedGroupId = form.watch("groupId");

  // Fetch data for dropdowns
  const { data: cities } = useQuery({
    queryKey: ["/api/cities"],
    retry: false,
  });

  const { data: schools } = useQuery({
    queryKey: [`/api/cities/${watchedCityId}/schools`],
    enabled: !!watchedCityId,
    retry: false,
  });

  const { data: semesters } = useQuery({
    queryKey: [`/api/schools/${watchedSchoolId}/semesters`],
    enabled: !!watchedSchoolId,
    retry: false,
  });

  const { data: groups } = useQuery({
    queryKey: [`/api/semesters/${watchedSemesterId}/groups`],
    enabled: !!watchedSemesterId,
    retry: false,
  });

  const { data: subjects } = useQuery({
    queryKey: [`/api/groups/${watchedGroupId}/subjects`],
    enabled: !!watchedGroupId,
    retry: false,
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: any) => {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== "") {
          formData.append(key, data[key]);
        }
      });
      if (selectedFile) {
        formData.append('pdf', selectedFile);
      }

      const response = await fetch('/api/contents', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`${response.status}: ${error}`);
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Content uploaded successfully",
      });
      form.reset();
      setSelectedFile(null);
      queryClient.invalidateQueries({ queryKey: ["/api/my-contents"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to upload content",
        variant: "destructive",
      });
    },
  });

  // Redirect if not authenticated or not teacher/admin
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }

    if (!isLoading && user && user.role === 'student') {
      toast({
        title: "Access Denied",
        description: "Students cannot upload content",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  const onSubmit = (data: any) => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a PDF file",
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate(data);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast({
          title: "Error",
          description: "Only PDF files are allowed",
          variant: "destructive",
        });
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File size must be less than 50MB",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6">
          {/* Breadcrumb */}
          <nav className="flex mb-6" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link href="/">
                  <a className="text-primary hover:text-primary/80">
                    🏠
                  </a>
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="text-muted-foreground mx-2">›</span>
                  <span className="text-sm font-medium text-muted-foreground">Upload Content</span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Back Button */}
          <div className="mb-6">
            <Button variant="outline" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-6">Upload New Content</h2>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Category Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <FormField
                      control={form.control}
                      name="cityId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <Select 
                            onValueChange={(value) => {
                              field.onChange(value);
                              form.setValue("schoolId", "");
                              form.setValue("semesterId", "");
                              form.setValue("groupId", "");
                              form.setValue("subjectId", "");
                            }}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-city">
                                <SelectValue placeholder="Select City" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {cities?.map((city: any) => (
                                <SelectItem key={city.id} value={city.id.toString()}>
                                  {city.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="schoolId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>School</FormLabel>
                          <Select 
                            onValueChange={(value) => {
                              field.onChange(value);
                              form.setValue("semesterId", "");
                              form.setValue("groupId", "");
                              form.setValue("subjectId", "");
                            }}
                            value={field.value}
                            disabled={!watchedCityId}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-school">
                                <SelectValue placeholder="Select School" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {schools?.map((school: any) => (
                                <SelectItem key={school.id} value={school.id.toString()}>
                                  {school.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="semesterId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Semester</FormLabel>
                          <Select 
                            onValueChange={(value) => {
                              field.onChange(value);
                              form.setValue("groupId", "");
                              form.setValue("subjectId", "");
                            }}
                            value={field.value}
                            disabled={!watchedSchoolId}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-semester">
                                <SelectValue placeholder="Select Semester" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {semesters?.map((semester: any) => (
                                <SelectItem key={semester.id} value={semester.id.toString()}>
                                  {semester.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="groupId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Group</FormLabel>
                          <Select 
                            onValueChange={(value) => {
                              field.onChange(value);
                              form.setValue("subjectId", "");
                            }}
                            value={field.value}
                            disabled={!watchedSemesterId}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-group">
                                <SelectValue placeholder="Select Group" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {groups?.map((group: any) => (
                                <SelectItem key={group.id} value={group.id.toString()}>
                                  {group.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="subjectId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value} disabled={!watchedGroupId}>
                            <FormControl>
                              <SelectTrigger data-testid="select-subject">
                                <SelectValue placeholder="Select Subject" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {subjects?.map((subject: any) => (
                                <SelectItem key={subject.id} value={subject.id.toString()}>
                                  {subject.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Content Details */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter content title"
                                {...field}
                                data-testid="input-title"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-type">
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="lesson">Lesson</SelectItem>
                                <SelectItem value="exercise">Exercise</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter content description"
                              rows={3}
                              {...field}
                              data-testid="textarea-description"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">PDF File</label>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <div className="mb-4">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
                      </div>
                      <div className="mb-4">
                        <p className="text-sm text-muted-foreground">
                          {selectedFile ? selectedFile.name : "Drop your PDF file here or click to browse"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Maximum file size: 50MB</p>
                      </div>
                      <input 
                        type="file" 
                        accept=".pdf" 
                        className="hidden" 
                        id="pdf-upload"
                        onChange={handleFileChange}
                        data-testid="input-file"
                      />
                      <label 
                        htmlFor="pdf-upload" 
                        className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg cursor-pointer hover:bg-primary/90 transition-colors"
                      >
                        <UploadIcon className="h-4 w-4 mr-2" />
                        Choose File
                      </label>
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex justify-end space-x-4">
                    <Button 
                      type="button" 
                      variant="outline"
                      asChild
                    >
                      <Link href="/">
                        Cancel
                      </Link>
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={uploadMutation.isPending}
                      data-testid="button-upload"
                    >
                      <UploadIcon className="h-4 w-4 mr-2" />
                      {uploadMutation.isPending ? "Uploading..." : "Upload Content"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
