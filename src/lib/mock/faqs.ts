export interface MockFaqCategory {
  name: string;
  slug: string;
  questions: { question: string; answer: string }[];
}

export const faqCategories: MockFaqCategory[] = [
  {
    name: "Produk",
    slug: "produk",
    questions: [
      {
        question: "Di mana saya bisa membeli produk HuCha Indonesia?",
        answer:
          "Produk HuCha Indonesia tersedia di toko resmi kami di Tokopedia, Shopee, dan TikTok Shop, serta di toko onderdil dan bengkel rekanan di seluruh Indonesia.",
      },
      {
        question: "Apakah produk HuCha original?",
        answer:
          "Ya, semua produk HuCha Indonesia diproduksi melalui pabrik berstandar mutu dan dijual melalui jalur distribusi resmi agar kualitasnya selalu terjaga.",
      },
      {
        question: "Bagaimana cara membedakan produk asli dan palsu?",
        answer:
          "Periksa kemasan, hologram, dan kode produksi pada setiap produk. Belilah hanya dari toko resmi atau distributor resmi HuCha Indonesia untuk menjamin keaslian.",
      },
    ],
  },
  {
    name: "Kemitraan",
    slug: "kemitraan",
    questions: [
      {
        question: "Bagaimana cara menjadi distributor HuCha Indonesia?",
        answer:
          "Anda dapat mengisi formulir pendaftaran distributor di halaman Kemitraan. Tim sales kami akan menghubungi Anda untuk proses verifikasi dan penawaran.",
      },
      {
        question: "Apakah ada minimal pembelian untuk distributor?",
        answer:
          "Ya, terdapat minimal pembelian awal (initial order) yang akan diinformasikan oleh tim sales kami saat proses negosiasi sesuai wilayah Anda.",
      },
      {
        question: "Apa saja dukungan untuk distributor?",
        answer:
          "Distributor mendapatkan dukungan harga khusus, materi promosi, pelatihan produk, serta prioritas stok untuk produk unggulan.",
      },
    ],
  },
  {
    name: "OEM & Maklon",
    slug: "oem",
    questions: [
      {
        question: "Apakah HuCha menerima jasa maklon (private label)?",
        answer:
          "Ya, HuCha Indonesia menerima kerja sama OEM/maklon untuk produk cairan otomotif dan perawatan kendaraan dengan merek sendiri (private label).",
      },
      {
        question: "Berapa jumlah minimum pesanan untuk OEM?",
        answer:
          "Jumlah minimum pesanan (MOQ) bervariasi tergantung jenis produk dan formulasi. Silakan kirim inquiry melalui halaman OEM untuk penawaran khusus.",
      },
      {
        question: "Apakah tersedia formulasi khusus sesuai kebutuhan?",
        answer:
          "Tersedia. Kami dapat menyesuaikan formulasi dan kemasan sesuai kebutuhan pasar Anda dengan dukungan tim riset dan pengembangan.",
      },
    ],
  },
  {
    name: "Umum",
    slug: "umum",
    questions: [
      {
        question: "Bagaimana cara menghubungi tim HuCha Indonesia?",
        answer:
          "Anda dapat menghubungi kami melalui WhatsApp, email, atau mengunjungi halaman Kontak untuk informasi lebih lanjut.",
      },
      {
        question: "Apakah HuCha membuka lowongan kerja?",
        answer:
          "Lowongan terbaru selalu diumumkan di halaman Karir. Anda juga dapat mengirimkan lamaran melalui formulir yang tersedia.",
      },
    ],
  },
];
