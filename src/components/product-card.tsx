import Link from "next/link";
import { PackageIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MediaPlaceholder } from "@/components/media-placeholder";
import { MarketplaceBadges } from "@/components/marketplace-badges";
import { categoryTypeLabel, type MockProduct } from "@/lib/mock/products";

export interface ProductCardProps {
  product: MockProduct;
}

function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="group flex flex-col overflow-hidden gap-0">
      <Link href={`/produk/${product.slug}`} aria-label={product.name}>
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt={product.name}
            className="aspect-video w-full object-cover transition-opacity group-hover:opacity-90"
          />
        ) : (
          <MediaPlaceholder
            icon={<PackageIcon />}
            className="transition-opacity group-hover:opacity-90"
          />
        )}
      </Link>
      <CardHeader>
        <Badge variant="secondary" className="w-fit">
          {categoryTypeLabel[product.category]}
        </Badge>
        <CardTitle>
          <Link
            href={`/produk/${product.slug}`}
            className="hover:text-primary line-clamp-2 transition-colors"
          >
            {product.name}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <p className="text-muted-foreground text-sm line-clamp-2">
          {product.shortDescription}
        </p>
        <div className="mt-auto">
          <MarketplaceBadges
            tokopediaUrl={product.tokopediaUrl}
            shopeeUrl={product.shopeeUrl}
            tiktokshopUrl={product.tiktokshopUrl}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export { ProductCard };
