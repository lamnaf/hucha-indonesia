export const siteConfig = {
  name: "HuCha Indonesia",
  legalName: "CV Usaha Bintang Mulia",
  tagline: "Spareparts, Cairan & Autocare Motor",
  description:
    "Distributor spareparts, cairan otomotif, dan produk perawatan kendaraan berkualitas untuk motor Anda.",
  address: "Jl. Raya Industri No. 45, Cikarang, Jawa Barat",
  phone: "+6280000000000",
  email: "halo@hucha.id",
  whatsapp: "+6280000000000",
  whatsappDisplay: "6280000000000",
  hours: "Senin–Sabtu, 08.00–17.00 WIB",
  social: {
    instagram: "https://instagram.com/hucha.indonesia",
    tiktok: "https://tiktok.com/@hucha.indonesia",
    whatsapp: "https://wa.me/6280000000000",
  },
  mapEmbedUrl:
    "https://www.google.com/maps?q=Cikarang,+Jawa+Barat&output=embed",
} as const;

export type SiteConfig = typeof siteConfig;

export interface NavLink {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
}

export const primaryNav: NavLink[] = [
  { label: "Beranda", href: "/" },
  { label: "Tentang Kami", href: "/tentang-kami" },
  { label: "Merek Kami", href: "/merek-kami" },
  {
    label: "Produk",
    href: "/produk",
    children: [
      { label: "Spareparts", href: "/produk?kategori=spareparts" },
      { label: "Cairan Otomotif", href: "/produk?kategori=fluids" },
      { label: "Perawatan Kendaraan", href: "/produk?kategori=autocare" },
      { label: "Lihat Semua Produk", href: "/produk" },
    ],
  },
  { label: "Kemitraan", href: "/kemitraan" },
  { label: "OEM", href: "/oem" },
  { label: "Blog", href: "/blog" },
  { label: "Karir", href: "/karir" },
  { label: "Kontak", href: "/kontak" },
];

export const footerColumns: {
  title: string;
  links: { label: string; href: string }[];
}[] = [
  {
    title: "Perusahaan",
    links: [
      { label: "Tentang Kami", href: "/tentang-kami" },
      { label: "Merek Kami", href: "/merek-kami" },
      { label: "Kemitraan Distributor", href: "/kemitraan" },
      { label: "OEM / Maklon", href: "/oem" },
      { label: "Karir", href: "/karir" },
    ],
  },
  {
    title: "Produk & Konten",
    links: [
      { label: "Semua Produk", href: "/produk" },
      { label: "Blog", href: "/blog" },
      { label: "Testimoni", href: "/testimoni" },
      { label: "FAQ", href: "/faq" },
      { label: "Kontak", href: "/kontak" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Kebijakan Privasi", href: "/kebijakan-privasi" },
      { label: "Syarat & Ketentuan", href: "/syarat-ketentuan" },
    ],
  },
];

export const marketplaces = [
  { name: "Tokopedia", href: "https://www.tokopedia.com" },
  { name: "Shopee", href: "https://shopee.co.id" },
  { name: "TikTok Shop", href: "https://www.tiktok.com" },
] as const;
