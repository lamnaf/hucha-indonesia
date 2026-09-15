import { BrandRepository } from "@/domain/brands/brand.repository";
import type { MockBrand, BrandProductGroup } from "@/lib/mock/brands";
import type { CategoryType } from "@/lib/mock/products";
import { getPublicCategories, getPublicProducts } from "./products";

type PublicBrand = Awaited<ReturnType<BrandRepository["listPublished"]>>[number];

function toMockBrand(brand: PublicBrand): MockBrand {
  const highlights = Array.isArray(brand.highlights)
    ? brand.highlights.filter(
        (item): item is string => typeof item === "string"
      )
    : [];
  return {
    name: brand.name,
    tagline: brand.tagline ?? "",
    description: brand.description ?? "",
    category: brand.category as CategoryType,
    icon:
      brand.logo?.filePath ??
      (brand.category === "spareparts"
        ? "/spareparts_icon.jpeg"
        : brand.category === "fluids"
          ? "/cairan_icon.jpeg"
          : brand.category === "lubricants"
            ? "/lubricants_icon.jpeg"
            : brand.category === "autocare"
              ? "/autocare_icon.jpeg"
              : undefined),
    highlights,
  };
}

export async function getPublicBrands(): Promise<MockBrand[]> {
  const items = await new BrandRepository().listPublished();
  return items.map(toMockBrand);
}

/**
 * Published brands paired with their catalog category and the published
 * products that belong to each brand line (drives the Merek Kami page).
 */
export async function getBrandProductGroups(): Promise<BrandProductGroup[]> {
  const [brands, products, categories] = await Promise.all([
    getPublicBrands(),
    getPublicProducts(),
    getPublicCategories(),
  ]);

  return brands.map((brand) => ({
    brand,
    category: categories.find((category) => category.type === brand.category) ?? {
      name: brand.category,
      slug: brand.category,
      type: brand.category,
      subcategories: [],
    },
    products: products.filter((product) => product.category === brand.category),
  }));
}