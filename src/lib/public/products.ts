import { ProductRepository } from "@/domain/products/product.repository";
import { CategoryRepository } from "@/domain/products/category.repository";
import type { CategoryType, MockCategory, MockProduct } from "@/lib/mock/products";

const CATEGORY_TYPE_ORDER: Record<CategoryType, number> = {
  spareparts: 0,
  fluids: 1,
  autocare: 2,
};

type PublicProduct = Awaited<
  ReturnType<ProductRepository["listPublished"]>
>["items"][number];

function toMockProduct(product: PublicProduct): MockProduct {
  let imageUrl = product.images[0]?.media.filePath;
  
  // If it's a relative path (legacy local), ensure it starts with /
  if (imageUrl && !imageUrl.startsWith("http") && !imageUrl.startsWith("/")) {
    imageUrl = `/${imageUrl}`;
  }

  return {
    name: product.name,
    slug: product.slug,
    category: product.category.type as CategoryType,
    subcategory: product.subCategory?.name ?? "",
    shortDescription: product.shortDescription ?? "",
    description: product.description ?? "",
    tokopediaUrl: product.tokopediaUrl ?? undefined,
    shopeeUrl: product.shopeeUrl ?? undefined,
    tiktokshopUrl: product.tiktokshopUrl ?? undefined,
    isFeatured: product.isFeatured,
    // Images are ordered by `sortOrder` — the first one is the primary image.
    image: imageUrl,
  };
}

/**
 * Published product categories (top-level only), ordered by catalog type so
 * the public site keeps a stable Spareparts → Cairan → Autocare layout.
 */
export async function getPublicCategories(): Promise<MockCategory[]> {
  const categories = await new CategoryRepository().listTopLevel();
  return categories
    .map((category) => ({
      name: category.name,
      slug: category.slug,
      type: category.type as CategoryType,
      subcategories: (category.children ?? []).map((child) => child.name),
    }))
    .sort((a, b) => CATEGORY_TYPE_ORDER[a.type] - CATEGORY_TYPE_ORDER[b.type]);
}

export async function getPublicProducts(): Promise<MockProduct[]> {
  const { items } = await new ProductRepository().listPublished({
    pageSize: 100,
  });
  return items.map(toMockProduct);
}

export async function getFeaturedProducts(): Promise<MockProduct[]> {
  const products = await getPublicProducts();
  return products.filter((product) => product.isFeatured);
}

export async function getProductBySlug(
  slug: string
): Promise<MockProduct | undefined> {
  const product = await new ProductRepository().findBySlug(slug);
  return product ? toMockProduct(product) : undefined;
}
