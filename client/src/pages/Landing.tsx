import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, Users, Upload } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-primary mr-2" />
              <h1 className="text-2xl font-bold text-foreground">UniPortal</h1>
            </div>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-primary hover:bg-primary/90"
              data-testid="button-login"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Welcome to Your University Community Portal
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Access lessons, exercises, and educational resources organized by city, school, semester, and subject. 
            A comprehensive platform for students, teachers, and administrators.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="border-primary/20 hover:border-primary/40 transition-colors">
            <CardHeader>
              <BookOpen className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Organized Content</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Browse through lessons and exercises organized in a hierarchical structure: 
                City → School → Semester → Group → Subject.
              </p>
            </CardContent>
          </Card>

          <Card className="border-secondary/20 hover:border-secondary/40 transition-colors">
            <CardHeader>
              <Users className="h-12 w-12 text-secondary mb-4" />
              <CardTitle>Role-Based Access</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Different access levels for students, teachers, and administrators. 
                Students view content, teachers manage their uploads, admins control everything.
              </p>
            </CardContent>
          </Card>

          <Card className="border-accent/20 hover:border-accent/40 transition-colors">
            <CardHeader>
              <Upload className="h-12 w-12 text-accent mb-4" />
              <CardTitle>Easy PDF Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Upload PDF lessons that are automatically converted to images for easy viewing, 
                with download options for offline access.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-primary/5 border-primary/20 max-w-2xl mx-auto">
            <CardContent className="pt-8 pb-8">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Ready to Get Started?
              </h3>
              <p className="text-muted-foreground mb-6">
                Sign in to access your university community and start exploring educational content.
              </p>
              <Button 
                size="lg"
                onClick={() => window.location.href = '/api/login'}
                className="bg-primary hover:bg-primary/90"
                data-testid="button-get-started"
              >
                <GraduationCap className="mr-2 h-5 w-5" />
                Get Started
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
