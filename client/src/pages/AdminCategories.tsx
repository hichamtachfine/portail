import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function AdminCategories() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  // Redirect if not authenticated or not admin
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

    if (!isLoading && user && user.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Admin access required",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

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
                  <span className="text-sm font-medium text-muted-foreground">Manage Categories</span>
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
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">Category Management</h2>
                <Button className="bg-primary hover:bg-primary/90" data-testid="button-add-category">
                  <span className="mr-2">+</span>
                  Add Category
                </Button>
              </div>

              <div className="text-center py-12">
                <div className="mb-6">
                  <div className="mx-auto h-24 w-24 bg-muted rounded-full flex items-center justify-center">
                    <span className="text-3xl">🏗️</span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Category Management Coming Soon
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  The category management interface is under development. 
                  For now, categories can be managed through the API endpoints.
                </p>
                <div className="mt-6">
                  <Button variant="outline" asChild>
                    <Link href="/">
                      Return to Dashboard
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
