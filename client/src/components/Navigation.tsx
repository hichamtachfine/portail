import { useAuth } from "@/hooks/useAuth";
import RoleBadge from "./RoleBadge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GraduationCap, LogOut, LogIn } from "lucide-react";
import { User } from "@shared/schema";

export default function Navigation() {
  const { user, isAuthenticated } = useAuth();
  const userTyped = user as User | undefined;

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  const handleLogin = () => {
    window.location.href = '/api/login';
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return 'U';
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-primary flex items-center">
                <GraduationCap className="h-8 w-8 mr-2" />
                UniPortal
              </h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {userTyped && <RoleBadge role={userTyped.role} />}
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={userTyped?.profileImageUrl ? userTyped.profileImageUrl : undefined} 
                      alt="User avatar" 
                    />
                    <AvatarFallback>
                      {getInitials(userTyped?.firstName, userTyped?.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium" data-testid="text-username">
                    {userTyped?.firstName && userTyped?.lastName 
                      ? `${userTyped.firstName} ${userTyped.lastName}`
                      : userTyped?.email || 'User'
                    }
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleLogout}
                    className="text-muted-foreground hover:text-foreground"
                    data-testid="button-logout"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <Button 
                onClick={handleLogin}
                className="bg-primary hover:bg-primary/90"
                data-testid="button-login"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
