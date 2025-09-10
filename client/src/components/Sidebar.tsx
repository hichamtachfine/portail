import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { 
  Home, 
  FolderOpen, 
  Upload, 
  FileText, 
  Settings, 
  Users 
} from "lucide-react";

export default function Sidebar() {
  const { user } = useAuth();
  const [location] = useLocation();

  const menuItems = [
    {
      icon: Home,
      label: "Dashboard",
      href: "/",
      roles: ["student", "teacher", "admin"]
    },
    {
      icon: FolderOpen,
      label: "Browse Categories",
      href: "/browse",
      roles: ["student", "teacher", "admin"]
    },
    {
      icon: Upload,
      label: "Upload Content",
      href: "/upload",
      roles: ["teacher", "admin"]
    },
    {
      icon: FileText,
      label: "My Content",
      href: "/my-content",
      roles: ["teacher", "admin"]
    },
  ];

  const adminItems = [
    {
      icon: Settings,
      label: "Manage Categories",
      href: "/admin/categories",
      roles: ["admin"]
    },
    {
      icon: Users,
      label: "User Management",
      href: "/admin/users",
      roles: ["admin"]
    },
  ];

  const isActive = (href: string) => {
    if (href === "/" && location === "/") return true;
    return href !== "/" && location.startsWith(href);
  };

  const canAccess = (roles: string[]) => {
    return user && roles.includes(user.role);
  };

  return (
    <aside className="w-64 bg-card border-r border-border">
      <div className="p-6">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            if (!canAccess(item.roles)) return null;
            
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <a className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive(item.href)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
                data-testid={`link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                </a>
              </Link>
            );
          })}
          
          {/* Admin Section */}
          {user?.role === 'admin' && (
            <div className="pt-4 border-t border-border">
              <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Administration
              </p>
              {adminItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <a className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      isActive(item.href)
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                    data-testid={`link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {item.label}
                    </a>
                  </Link>
                );
              })}
            </div>
          )}
        </nav>
      </div>
    </aside>
  );
}
