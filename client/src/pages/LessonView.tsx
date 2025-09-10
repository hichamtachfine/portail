import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/Navigation";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Edit, Trash2 } from "lucide-react";
import { Link } from "wouter";

export default function LessonView() {
  const { id } = useParams();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();

  const { data: content, isLoading: contentLoading } = useQuery({
    queryKey: [`/api/contents/${id}`],
    retry: false,
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', `/api/contents/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Content deleted successfully",
      });
      window.history.back();
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
        description: "Failed to delete content",
        variant: "destructive",
      });
    },
  });

  // Redirect to home if not authenticated
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
  }, [isAuthenticated, isLoading, toast]);

  const handleDownload = () => {
    if (content?.filePath) {
      window.open(`/uploads/${content.filePath.split('/').pop()}`, '_blank');
    }
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this content?')) {
      deleteMutation.mutate();
    }
  };

  const canEdit = user && content && (
    user.role === 'admin' || 
    (user.role === 'teacher' && content.uploadedBy === user.id)
  );

  if (isLoading || contentLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">Content not found</p>
                <Button asChild className="mt-4">
                  <Link href="/">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Home
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    );
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
                  <span className="text-sm font-medium text-muted-foreground">{content.title}</span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Back Button */}
          <div className="mb-6">
            <Button variant="outline" onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-foreground" data-testid="text-lesson-title">
                    {content.title}
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    <span className="capitalize">{content.type}</span> • 
                    <span className="ml-1">
                      {new Date(content.createdAt).toLocaleDateString()}
                    </span>
                  </p>
                  {content.description && (
                    <p className="text-muted-foreground mt-2">{content.description}</p>
                  )}
                </div>
                
                {canEdit && (
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      data-testid="button-edit"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={handleDelete}
                      disabled={deleteMutation.isPending}
                      data-testid="button-delete"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>

              {/* PDF Pages as Images */}
              <div className="space-y-4 mb-8">
                {content.pages && content.pages.length > 0 ? (
                  content.pages.map((page: any, index: number) => (
                    <div key={page.id} className="bg-white p-4 rounded-lg border border-border shadow-sm">
                      <img 
                        src={page.imagePath}
                        alt={`Page ${page.pageNumber} of ${content.title}`}
                        className="w-full h-auto rounded-lg shadow-sm transition-transform hover:scale-[1.02]"
                        data-testid={`img-page-${page.pageNumber}`}
                      />
                      <p className="text-center text-sm text-muted-foreground mt-2">
                        Page {page.pageNumber}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="bg-white p-8 rounded-lg border border-border shadow-sm text-center">
                    <p className="text-muted-foreground">
                      PDF pages are being processed. Please check back later.
                    </p>
                  </div>
                )}
              </div>

              {/* Download Button */}
              <div className="text-center">
                <Button 
                  size="lg"
                  onClick={handleDownload}
                  className="bg-primary hover:bg-primary/90"
                  data-testid="button-download"
                >
                  <Download className="h-5 w-5 mr-3" />
                  Download PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
