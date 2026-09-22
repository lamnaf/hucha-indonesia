import { ProductRepository } from "@/domain/products/product.repository";
import { CategoryRepository } from "@/domain/products/category.repository";
import { normalizeImageUrl } from "@/lib/utils";
import type { CategoryType, MockCategory, MockProduct } from "@/lib/mock/products";

const CATEGORY_TYPE_ORDER: Record<CategoryType, number> = {
  spareparts: 0,
  fluids: 1,
  lubricants: 2,
  autocare: 3,
};

type PublicProduct = Awaited<
  ReturnType<ProductRepository["listPublished"]>
>["items"][number];

function toMockProduct(product: PublicProduct): MockProduct {
  const fallbackByType: Record<string, string> = {
    spareparts: "/spareparts.jpeg",
    fluids: "/cairan.jpeg",
    lubricants: "/lubricants.jpeg",
    autocare: "/autocare.jpeg",
  };
  const rawImage = product.images[0]?.media.filePath;
  const fallback = fallbackByType[product.category.type] ?? "/og-default.png";
  return {
    name: product.name,
    slug: product.slug,
    category: product.category.type as CategoryType,
    subcategory: product.subCategory?.name ?? "",
    shortDescription: product.shortDescription ?? "",
    description: product.description ?? "",
    tiktokshopUrl: product.tiktokshopUrl ?? undefined,
    isFeatured: product.isFeatured,
    // Images are ordered by `sortOrder` — the first one is the primary image.
    // Fallback ke static image agar tidak ada produk tanpa gambar.
    image: rawImage ? normalizeImageUrl(rawImage) : normalizeImageUrl(fallback),
  };
}

/**
 * Published product categories (top-level only), ordered by catalog type so
 * the public site keeps a stable Spareparts → Cairan → Autocare layout.
 */
export async function getPublicCategories(): Promise<MockCategory[]> {
  try {
    const categories = await new CategoryRepository().listTopLevel();
    return categories
      .map((category) => ({
        name: category.name,
        slug: category.slug,
        type: category.type as CategoryType,
        subcategories: (category.children ?? []).map((child) => child.name),
        imageUrl: normalizeImageUrl(
          category.type === "spareparts"
            ? "/spareparts.jpeg"
            : category.type === "fluids"
              ? "/cairan.jpeg"
              : category.type === "lubricants"
                ? "/lubricants.jpeg"
                : "/autocare.jpeg"
        ),
      }))
      .sort((a, b) => CATEGORY_TYPE_ORDER[a.type] - CATEGORY_TYPE_ORDER[b.type]);
  } catch (err) {
    console.error("[products] getPublicCategories failed:", err);
    return [];
  }
}

export async function getPublicProducts(): Promise<MockProduct[]> {
  try {
    const { items } = await new ProductRepository().listPublished({
      pageSize: 100,
    });
    return items.map(toMockProduct);
  } catch (err) {
    console.error("[products] getPublicProducts failed:", err);
    return [];
  }
}

export async function getFeaturedProducts(): Promise<MockProduct[]> {
  const products = await getPublicProducts();
  return products.filter((product) => product.isFeatured);
}

export async function getProductBySlug(
  slug: string
): Promise<MockProduct | undefined> {
  try {
    const product = await new ProductRepository().findBySlug(slug);
    return product ? toMockProduct(product) : undefined;
  } catch (err) {
    console.error(`[products] getProductBySlug failed for "${slug}":`, err);
    return undefined;
  }
}
