import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import Sidebar from "@/components/Sidebar";
import CategoryCard from "@/components/CategoryCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function Browse() {
  const params = useParams();
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Parse the current path to determine what level we're at
  const pathSegments = window.location.pathname.split('/').filter(Boolean);
  const level = pathSegments[1] || 'cities'; // cities, city, school, semester, group, subject

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

  // Determine API endpoint based on current level
  const getApiEndpoint = () => {
    if (level === 'cities' || pathSegments.length === 2) {
      return '/api/cities';
    } else if (pathSegments[2] && pathSegments[3]) {
      const type = pathSegments[2];
      const id = pathSegments[3];
      
      switch (type) {
        case 'city':
          return `/api/cities/${id}/schools`;
        case 'school':
          return `/api/schools/${id}/semesters`;
        case 'semester':
          return `/api/semesters/${id}/groups`;
        case 'group':
          return `/api/groups/${id}/subjects`;
        case 'subject':
          return `/api/subjects/${id}/contents`;
        default:
          return '/api/cities';
      }
    }
    return '/api/cities';
  };

  const { data: items, isLoading: itemsLoading } = useQuery({
    queryKey: [getApiEndpoint()],
    retry: false,
  });

  // Generate breadcrumbs
  const getBreadcrumbs = () => {
    const breadcrumbs = [
      { label: 'Home', href: '/' },
    ];

    if (pathSegments.length > 2) {
      breadcrumbs.push({ label: 'Browse', href: '/browse' });
      
      // Add dynamic breadcrumbs based on path
      for (let i = 2; i < pathSegments.length; i += 2) {
        const type = pathSegments[i];
        const id = pathSegments[i + 1];
        if (type && id) {
          breadcrumbs.push({
            label: `${type.charAt(0).toUpperCase() + type.slice(1)} ${id}`,
            href: `/browse/${pathSegments.slice(2, i + 2).join('/')}`
          });
        }
      }
    }

    return breadcrumbs;
  };

  const getTitle = () => {
    if (pathSegments.length === 2) return 'Cities';
    const type = pathSegments[pathSegments.length - 2];
    return type ? `${type.charAt(0).toUpperCase() + type.slice(1)}s` : 'Categories';
  };

  const getItemHref = (item: any) => {
    const currentPath = pathSegments.slice(2).join('/');
    const type = pathSegments[pathSegments.length - 2] || 'city';
    
    const nextLevel = {
      'city': 'school',
      'school': 'semester', 
      'semester': 'group',
      'group': 'subject',
      'subject': 'content'
    }[type] || 'school';

    if (nextLevel === 'content') {
      return `/lesson/${item.id}`;
    }

    return `/browse/${currentPath}/${nextLevel}/${item.id}`;
  };

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6">
          {/* Breadcrumb */}
          <nav className="flex mb-6" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              {breadcrumbs.map((crumb, index) => (
                <li key={index} className="inline-flex items-center">
                  {index > 0 && <span className="text-muted-foreground mx-2">›</span>}
                  {index === breadcrumbs.length - 1 ? (
                    <span className="text-sm font-medium text-muted-foreground">{crumb.label}</span>
                  ) : (
                    <Link href={crumb.href}>
                      <a className="text-primary hover:text-primary/80 text-sm font-medium">
                        {crumb.label}
                      </a>
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          {/* Back Button */}
          {pathSegments.length > 2 && (
            <div className="mb-6">
              <Button variant="outline" asChild>
                <Link href={breadcrumbs[breadcrumbs.length - 2]?.href || '/'}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Link>
              </Button>
            </div>
          )}

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">{getTitle()}</h2>
              </div>

              {itemsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-muted animate-pulse rounded-lg h-24"></div>
                  ))}
                </div>
              ) : items && items.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((item: any) => (
                    <CategoryCard
                      key={item.id}
                      title={item.name || item.title}
                      subtitle={item.description || "Click to explore"}
                      count={item.type ? `Type: ${item.type}` : ""}
                      icon={item.type === 'lesson' ? '📚' : item.type === 'exercise' ? '📝' : '📁'}
                      href={getItemHref(item)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No items found at this level.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
