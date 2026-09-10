import {
  products,
  getCategoryByType,
  type CategoryType,
  type MockCategory,
  type MockProduct,
} from "./products";

export interface MockBrand {
  name: string;
  tagline: string;
  description: string;
  category: CategoryType;
  highlights: string[];
}

export const brands: MockBrand[] = [
  {
    name: "HuCha Racing",
    tagline: "Performa untuk jalanan & lintasan",
    description:
      "Lini spareparts performa tinggi — kampas rem, busi, dan komponen lain yang dirancang untuk ketahanan dan daya cengkeram maksimal.",
    category: "spareparts",
    highlights: [
      "Material non-asbestos",
      "Tahan panas tinggi",
      "Cocok harian & balap",
    ],
  },
  {
    name: "HuCha Lubricants",
    tagline: "Cairan pelumas berkualitas",
    description:
      "Oli mesin, oli sokbreker, dan coolant dengan formulasi khusus untuk menjaga mesin dan suspensi motor Anda tetap prima.",
    category: "fluids",
    highlights: [
      "Formulasi khusus matic",
      "Perlindungan maksimal",
      "Stabil di segala cuaca",
    ],
  },
  {
    name: "HuCha Auto Care",
    tagline: "Perawatan kendaraan menyeluruh",
    description:
      "Shampo, pelindung cat, hingga perawatan rantai — rangkaian produk perawatan untuk membuat motor tampil dan awet.",
    category: "autocare",
    highlights: [
      "Formula aman untuk cat",
      "Kilap tahan lama",
      "Mudah digunakan",
    ],
  },
];

export interface BrandProductGroup {
  brand: MockBrand;
  category: MockCategory;
  products: MockProduct[];
}

export function getBrandProductGroups(): BrandProductGroup[] {
  return brands.map((brand) => ({
    brand,
    category: getCategoryByType(brand.category),
    products: products.filter((product) => product.category === brand.category),
  }));
}

export const brandCategoryIndex: Record<
  MockBrand["category"],
  { name: string; slug: string; href: string }
> = {
  spareparts: {
    name: "Spareparts",
    slug: "spareparts",
    href: "/produk?kategori=spareparts",
  },
  fluids: {
    name: "Cairan Otomotif",
    slug: "cairan-otomotif",
    href: "/produk?kategori=fluids",
  },
  autocare: {
    name: "Perawatan Kendaraan",
    slug: "perawatan-kendaraan",
    href: "/produk?kategori=autocare",
  },
};
