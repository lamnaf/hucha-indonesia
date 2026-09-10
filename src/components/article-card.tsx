import Link from "next/link";
import { ArrowRightIcon, FileTextIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MediaPlaceholder } from "@/components/media-placeholder";
import type { MockArticle } from "@/lib/mock/blog";

export interface ArticleCardProps {
  article: MockArticle;
}

function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Card className="group flex flex-col overflow-hidden gap-0">
      <Link href={`/blog/${article.slug}`} aria-label={article.title}>
        <MediaPlaceholder
          icon={<FileTextIcon />}
          className="transition-opacity group-hover:opacity-90"
        />
      </Link>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="w-fit">
            {article.category}
          </Badge>
          <span className="text-muted-foreground text-xs">
            {article.readingMinutes} menit baca
          </span>
        </div>
        <CardTitle>
          <Link
            href={`/blog/${article.slug}`}
            className="hover:text-primary line-clamp-2 text-lg transition-colors"
          >
            {article.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <p className="text-muted-foreground text-sm line-clamp-3">
          {article.excerpt}
        </p>
        <Link
          href={`/blog/${article.slug}`}
          className="text-primary mt-auto inline-flex items-center gap-1 text-sm font-medium"
        >
          Baca selengkapnya
          <ArrowRightIcon className="size-4" aria-hidden="true" />
        </Link>
      </CardContent>
    </Card>
  );
}

export { ArticleCard };
