export type CategoryType = "spareparts" | "fluids" | "autocare";

export interface MockCategory {
  name: string;
  slug: string;
  type: CategoryType;
  subcategories: string[];
}

export interface MockProduct {
  name: string;
  slug: string;
  category: CategoryType;
  subcategory: string;
  shortDescription: string;
  description: string;
  tokopediaUrl?: string;
  shopeeUrl?: string;
  tiktokshopUrl?: string;
  isFeatured: boolean;
  /** Primary (first) gallery image URL; undefined = show the placeholder. */
  image?: string;
}

export const categories: MockCategory[] = [
  {
    name: "Spareparts",
    slug: "spareparts",
    type: "spareparts",
    subcategories: ["Kampas Rem", "Busi", "Filter Udara", "Kampas Kopling"],
  },
  {
    name: "Cairan Otomotif",
    slug: "cairan-otomotif",
    type: "fluids",
    subcategories: ["Oli Mesin", "Oli Sokbreker", "Coolant"],
  },
  {
    name: "Perawatan Kendaraan",
    slug: "perawatan-kendaraan",
    type: "autocare",
    subcategories: ["Pembersih", "Pelindung", "Perawatan Rantai"],
  },
] as const;

export const products: MockProduct[] = [
  {
    name: "Kampas Rem Depan HuCha Racing",
    slug: "kampas-rem-depan-hucha-racing",
    category: "spareparts",
    subcategory: "Kampas Rem",
    shortDescription:
      "Kampas rem depan tipe racing dengan daya cengkeram tinggi.",
    description:
      "Kampas rem depan HuCha Racing dibuat dari material non-asbestos berkualitas tinggi dengan ketahanan panas optimal untuk penggunaan harian maupun balap.",
    tokopediaUrl: "https://tokopedia.com/hucha-id/kampas-rem-depan",
    shopeeUrl: "https://shopee.co.id/hucha-official/kampas-rem-depan",
    tiktokshopUrl: "https://tiktok.com/@hucha.indonesia/shop/kampas-rem-depan",
    isFeatured: true,
  },
  {
    name: "Busi Iridium HuCha Pro",
    slug: "busi-iridium-hucha-pro",
    category: "spareparts",
    subcategory: "Busi",
    shortDescription: "Busi iridium dengan pembakaran lebih stabil.",
    description:
      "Busi Iridium HuCha Pro memberikan pembakaran optimal, akselerasi responsif, dan umur pakai lebih lama dibanding busi standar.",
    tokopediaUrl: "https://tokopedia.com/hucha-id/busi-iridium-pro",
    shopeeUrl: "https://shopee.co.id/hucha-official/busi-iridium-pro",
    tiktokshopUrl: "https://tiktok.com/@hucha.indonesia/shop/busi-iridium-pro",
    isFeatured: false,
  },
  {
    name: "Oli Mesin HuCha Matic 10W-30",
    slug: "oli-mesin-hucha-matic-10w-30",
    category: "fluids",
    subcategory: "Oli Mesin",
    shortDescription:
      "Oli mesin khusus motor matic dengan perlindungan maksimal.",
    description:
      "Oli Mesin HuCha Matic 10W-30 diformulasikan khusus untuk motor matic, menjaga mesin tetap halus, bersih, dan dingin.",
    tokopediaUrl: "https://tokopedia.com/hucha-id/oli-matic-10w-30",
    shopeeUrl: "https://shopee.co.id/hucha-official/oli-matic-10w-30",
    tiktokshopUrl: "https://tiktok.com/@hucha.indonesia/shop/oli-matic-10w-30",
    isFeatured: true,
  },
  {
    name: "Oli Sokbreker HuCha SAE 20",
    slug: "oli-sokbreker-hucha-sae-20",
    category: "fluids",
    subcategory: "Oli Sokbreker",
    shortDescription: "Oli sokbreker dengan redaman stabil dan awet.",
    description:
      "Oli sokbreker HuCha SAE 20 menjaga performa suspensi tetap stabil, mengurangi getaran, dan memperpanjang umur sokbreker.",
    tokopediaUrl: "https://tokopedia.com/hucha-id/oli-sokbreker-sae-20",
    shopeeUrl: "https://shopee.co.id/hucha-official/oli-sokbreker-sae-20",
    tiktokshopUrl:
      "https://tiktok.com/@hucha.indonesia/shop/oli-sokbreker-sae-20",
    isFeatured: false,
  },
  {
    name: "Shampo Motor HuCha Super Gloss",
    slug: "shampo-motor-hucha-super-gloss",
    category: "autocare",
    subcategory: "Pembersih",
    shortDescription: "Shampo motor dengan busa tebal dan hasil mengkilap.",
    description:
      "Shampo Motor HuCha Super Gloss membersihkan kotoran dan lumpur tanpa merusak cat, menghasilkan kilap alami.",
    tokopediaUrl: "https://tokopedia.com/hucha-id/shampo-motor-super-gloss",
    shopeeUrl: "https://shopee.co.id/hucha-official/shampo-motor-super-gloss",
    tiktokshopUrl:
      "https://tiktok.com/@hucha.indonesia/shop/shampo-motor-super-gloss",
    isFeatured: false,
  },
  {
    name: "Pelindung Cat HuCha Nano Ceramic",
    slug: "pelindung-cat-hucha-nano-ceramic",
    category: "autocare",
    subcategory: "Pelindung",
    shortDescription: "Coating nano ceramic untuk melindungi cat motor.",
    description:
      "Pelindung Cat HuCha Nano Ceramic membentuk lapisan pelindung anti gores dan anti air selama berbulan-bulan.",
    tokopediaUrl: "https://tokopedia.com/hucha-id/nano-ceramic-coating",
    shopeeUrl: "https://shopee.co.id/hucha-official/nano-ceramic-coating",
    tiktokshopUrl:
      "https://tiktok.com/@hucha.indonesia/shop/nano-ceramic-coating",
    isFeatured: false,
  },
] as const;

export const categoryTypeLabel: Record<CategoryType, string> = {
  spareparts: "Spareparts",
  fluids: "Cairan Otomotif",
  autocare: "Perawatan Kendaraan",
};

export function getCategoryByType(type: CategoryType): MockCategory {
  return categories.find((category) => category.type === type) ?? categories[0];
}

export function getFeaturedProducts(): MockProduct[] {
  return products.filter((product) => product.isFeatured);
}
