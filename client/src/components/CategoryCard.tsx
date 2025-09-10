import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { Link } from "wouter";

interface CategoryCardProps {
  title: string;
  subtitle: string;
  count: string;
  icon: string;
  href: string;
}

export default function CategoryCard({ title, subtitle, count, icon, href }: CategoryCardProps) {
  return (
    <Link href={href}>
      <a className="block">
        <Card className="folder-card bg-muted border border-border cursor-pointer transition-all duration-200 hover:transform hover:-translate-y-1 hover:shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center mb-3">
              <div className="p-2 bg-primary/10 rounded-lg mr-3">
                <span className="text-lg" role="img" aria-label="Category icon">
                  {icon}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-foreground" data-testid={`text-category-${title.toLowerCase().replace(/\s+/g, '-')}`}>
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{count}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </a>
    </Link>
  );
}
