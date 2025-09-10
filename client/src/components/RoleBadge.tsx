import { cn } from "@/lib/utils";
import { GraduationCap, BookOpen, Shield } from "lucide-react";

interface RoleBadgeProps {
  role: string;
  className?: string;
}

export default function RoleBadge({ role, className }: RoleBadgeProps) {
  const getRoleConfig = (role: string) => {
    switch (role) {
      case 'student':
        return {
          icon: GraduationCap,
          label: 'Student',
          className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
        };
      case 'teacher':
        return {
          icon: BookOpen,
          label: 'Teacher',
          className: 'bg-primary/10 text-primary dark:bg-primary/20'
        };
      case 'admin':
        return {
          icon: Shield,
          label: 'Admin',
          className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        };
      default:
        return {
          icon: GraduationCap,
          label: 'User',
          className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
        };
    }
  };

  const config = getRoleConfig(role);
  const Icon = config.icon;

  return (
    <div className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
      config.className,
      className
    )}
    data-testid={`badge-role-${role}`}
    >
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </div>
  );
}
