import { getSiteConfig } from "@/lib/public/site";
import { pageMetadata } from "@/lib/seo";
import {
  HandshakeIcon,
  ShieldCheckIcon,
  TrendingUpIcon,
  LockIcon,
  MedalIcon,
  LightbulbIcon,
  UsersIcon,
  WrenchIcon,
  DropletsIcon,
  ZapIcon,
  BatteryIcon,
  SettingsIcon,
  PackageIcon,
  TargetIcon,
  HeartIcon,
  ArrowRightIcon,
  ChevronRightIcon,
  MapPinIcon,
  FactoryIcon,
  GlobeIcon,
  HelpCircleIcon,
  CheckIcon,
  MessageCircleIcon,
  CameraIcon,
  Music2Icon,
} from "lucide-react";

export const metadata = pageMetadata({
  title: "Tentang Kami",
  description:
    "Kenali HuCha Indonesia (CV Usaha Bintang Mulia) — distributor suku cadang motor, cairan otomotif, dan produk perawatan kendaraan yang terpercaya di Indonesia.",
  path: "/tentang-kami",
});

const values = [
  {
    letter: "P",
    title: "PARTNERSHIP",
    desc: "Pertumbuhan berkelanjutan dibangun bersama. Kami mengembangkan hubungan dengan pelanggan, pemasok, dan mitra berbasis kepercayaan, rasa hormat, manfaat bersama, dan komitmen jangka panjang.",
    icon: HandshakeIcon,
  },
  {
    letter: "R",
    title: "RESPONSIBILITY",
    desc: "Kami bertanggung jawab penuh atas pekerjaan, keputusan, dan komitmen. Setiap anggota tim HUCHA mendorong kemajuan perusahaan dengan kontribusi terbaik.",
    icon: ShieldCheckIcon,
  },
  {
    letter: "O",
    title: "OPPORTUNITY",
    desc: "Kami terus mencari peluang untuk perbaikan, belajar, berinovasi, dan berkembang. Tantangan adalah kesempatan bagi kami untuk menjadi lebih baik.",
    icon: TrendingUpIcon,
  },
  {
    letter: "T",
    title: "TRUST",
    desc: "Kepercayaan adalah fondasi setiap hubungan kami. Kami menjunjung tinggi kejujuran, konsistensi, transparansi, dan komitmen yang tepat janji.",
    icon: LockIcon,
  },
  {
    letter: "E",
    title: "EXCELLENCE",
    desc: "Kami terus meningkatkan kualitas produk, layanan, sistem, dan cara kerja. Kami mungkin belum sempurna, tetapi selalu berusaha memberikan yang terbaik.",
    icon: MedalIcon,
  },
  {
    letter: "C",
    title: "CUSTOMER SOLUTIONS",
    desc: "Kami tidak sekadar menjual produk. Kami memahami permasalahan dan memberikan solusi praktis yang memberikan nilai nyata bagi pelanggan.",
    icon: LightbulbIcon,
  },
  {
    letter: "T",
    title: "TOGETHER",
    desc: "HUCHA berkembang melalui kerja sama tim. Kami saling menghormati, mendukung, dan percaya keberhasilan adalah tanggung jawab bersama.",
    icon: UsersIcon,
  },
];

const purposeCards = [
  {
    title: "SOLVING PROBLEMS",
    desc: "Mendengarkan pelanggan, pemilik bengkel, retailer, dan dinamika pasar untuk memahami apa yang benar-benar dibutuhkan.",
    icon: WrenchIcon,
    image: "/tentang-hucha/49.png",
  },
  {
    title: "CREATING VALUE",
    desc: "Setiap produk harus memberikan nilai yang berarti bagi pelanggan dan mitra bisnis — bukan sekadar menjalankan fungsinya.",
    icon: TargetIcon,
    image: "/tentang-hucha/51.png",
  },
  {
    title: "BUILDING RELATIONSHIPS",
    desc: "Kemitraan berbasis saling percaya, saling menguntungkan, dan tumbuh bersama dalam jangka panjang.",
    icon: HandshakeIcon,
    image: "/tentang-hucha/52.png",
  },
];

const products = [
  {
    category: "CAIRAN OTOMOTIF",
    desc: "Produk untuk pemeliharaan dan perlindungan sistem pendingin kendaraan.",
    icon: DropletsIcon,
    image: "/tentang-hucha/53.png",
  },
  {
    category: "LUBRICANTS",
    desc: "Solusi pelumasan untuk berbagai komponen dan aplikasi sepeda motor.",
    icon: SettingsIcon,
    image: "/tentang-hucha/54.png",
  },
  {
    category: "SPAREPARTS",
    desc: "Komponen dan suku cadang pilihan untuk kebutuhan pasar sehari-hari.",
    icon: PackageIcon,
    image: "/tentang-hucha/55.png",
  },
  {
    category: "AUTOCARE",
    desc: "Produk pendukung perawatan dan pemeliharaan aki sepeda motor.",
    icon: BatteryIcon,
    image: "/tentang-hucha/56.png",
  },
];

const approachPillars = [
  { title: "FUNCTION", desc: "Produk menjalankan fungsinya secara optimal" },
  { title: "VALUE", desc: "Memberikan nilai berarti bagi pelanggan & mitra" },
  { title: "PRACTICALITY", desc: "Praktis untuk penggunaan sehari-hari di dunia nyata" },
  { title: "CONSISTENCY", desc: "Menjaga dan meningkatkan konsistensi kualitas" },
  { title: "IMPROVEMENT", desc: "Umpan balik pelanggan sebagai basis pengembangan" },
];

const commitments = [
  { title: "OUR PRODUCTS", desc: "Memperluas dan meningkatkan portofolio produk berdasarkan kebutuhan nyata di pasar.", icon: PackageIcon },
  { title: "OUR SERVICE", desc: "Selalu responsif dan memberikan dukungan penuh kepada pelanggan serta mitra bisnis.", icon: HeartIcon },
  { title: "OUR PEOPLE", desc: "Membangun tim yang saling menghormati, bertanggung jawab, dan terus belajar.", icon: UsersIcon },
  { title: "OUR SYSTEM", desc: "Meningkatkan proses operasional agar menjadi lebih konsisten dan handal.", icon: FactoryIcon },
  { title: "OUR REACH", desc: "Memperluas jangkauan HUCHA dan membangun jaringan distribusi yang lebih kuat di seluruh Indonesia.", icon: GlobeIcon },
];

const timeline = [
  { year: "AWAL MULA", desc: "HUCHA berawal dari tujuan sederhana: menyediakan produk praktis yang membantu masyarakat merawat kendaraan dengan lebih baik." },
  { year: "PENGEMBANGAN PRODUK", desc: "Mengembangkan produk cooling system, brake system, lubrication, battery care, hingga kebutuhan sepeda motor lainnya." },
  { year: "EKSPANSI PASAR", desc: "Memahami dinamika pasar, membangun hubungan erat dengan pelanggan serta pemasok di seluruh Indonesia." },
  { year: "HARI INI", desc: "Melanjutkan perjalanan dengan ambisi lebih besar: TO BRING HUCHA CLOSER TO CUSTOMERS ACROSS INDONESIA." },
  { year: "MASA DEPAN", desc: "Perjalanan kami masih terus ditulis, dan kami percaya bagian terbaik masih ada di depan." },
];

const futureGoals = [
  "Mendengarkan kebutuhan pasar",
  "Menyelesaikan masalah nyata",
  "Mengembangkan produk yang lebih baik",
  "Membangun kemitraan yang lebih kuat",
  "Mengembangkan kualitas tim kami",
  "Memperluas jangkauan distribusi",
];

export default async function About() {
  const siteConfig = await getSiteConfig();

  return (
    <>
      <div className="container py-16 sm:py-20 space-y-24">
        {/* ABOUT HUCHA - Zig-zag: Text Left, Image Right */}
        <section id="about" className="scroll-mt-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="text-left lg:pr-8">
              <span className="inline-block px-4 py-1.5 text-sm font-semibold text-primary bg-primary/10 rounded-full mb-6">
                ABOUT HUCHA
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-navy-dark mb-6 leading-tight">
                Built to Protect.<br />
                <span className="text-primary">Made to Grow.</span>
              </h2>
              <div className="space-y-4 text-lg text-muted-foreground max-w-xl">
                <p>HUCHA adalah merek perawatan otomotif Indonesia yang berfokus pada penyediaan solusi praktis untuk pemeliharaan dan perlindungan kendaraan.</p>
                <p>Kami mengembangkan dan menyediakan produk yang dirancang untuk mendukung perawatan kendaraan sehari-hari mulai dari cooling system, brake system, lubrication, battery care, hingga kebutuhan sepeda motor dan otomotif lainnya.</p>
                <p>Kami percaya bahwa produk otomotif yang baik harus melakukan lebih dari sekadar menjalankan fungsinya. Produk tersebut harus mampu memberikan solusi masalah, memberikan nilai nyata (real value), dan memberikan rasa percaya diri kepada pelanggan terhadap kendaraan mereka.</p>
                <p>HUCHA terus berkembang dengan memperluas portofolio produk kami, meningkatkan layanan kepada para mitra, serta membangun hubungan jangka panjang dengan pelanggan dan pemasok di seluruh Indonesia.</p>
              </div>
            </div>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-muted">
              <img
                src="/tentang-hucha/48.png"
                alt="Produk HUCHA tertata rapi di bengkel modern"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <p className="text-sm font-medium text-primary-foreground/80 mb-1">HUCHA Product Lineup</p>
                <p className="text-lg font-heading tracking-wide">Complete Automotive Care Solutions</p>
              </div>
            </div>
          </div>
        </section>

        {/* OUR PURPOSE - Centered Text + 3 Card Grid */}
        <section id="purpose" className="scroll-mt-20">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <span className="inline-block px-4 py-1.5 text-sm font-semibold text-primary bg-primary/10 rounded-full mb-6">
              OUR PURPOSE
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-navy-dark mb-6 leading-tight">
              SOLVING PROBLEMS.<br />
              CREATING VALUE.<br />
              <span className="text-primary">BUILDING RELATIONSHIPS.</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Di HUCHA, kami percaya bahwa bisnis bukan sekadar menjual produk. Ini adalah tentang memahami apa yang dibutuhkan pelanggan, menemukan solusi praktis, dan menciptakan nilai yang bertahan lama.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {purposeCards.map((card) => (
              <article
                key={card.title}
                className="group relative overflow-hidden rounded-2xl bg-white border border-border shadow-sm transition-all duration-500 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/70 via-transparent to-transparent" />
                </div>
                <div className="absolute top-4 left-4 right-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/90 backdrop-blur-sm text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <card.icon className="w-6 h-6" aria-hidden="true" />
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  <h3 className="text-xl font-bold text-navy-dark group-hover:text-primary transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{card.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* OUR VISION - Zig-zag: Image Left, Text Right */}
        <section id="vision" className="scroll-mt-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-muted order-2 lg:order-1">
              <img
src="/tentang-hucha/54.png"
                alt="Peta Indonesia dengan titik distribusi HUCHA"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-navy-dark/60 via-transparent to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white p-8">
                  <MapPinIcon className="w-16 h-16 mx-auto text-primary mb-4 opacity-90" />
                  <p className="text-sm font-medium text-primary-foreground/80 mb-1">Jaringan Distribusi</p>
                  <p className="text-2xl font-heading tracking-wide">Seluruh Indonesia</p>
                </div>
              </div>
            </div>
            <div className="text-left lg:pl-8 order-1 lg:order-2">
              <span className="inline-block px-4 py-1.5 text-sm font-semibold text-primary bg-primary/10 rounded-full mb-6">
                OUR VISION
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-navy-dark mb-6 leading-tight">
                A TRUSTED AUTOMOTIVE CARE BRAND<br />
                <span className="text-primary">ACROSS INDONESIA</span>
              </h2>
              <div className="space-y-4 text-lg text-muted-foreground max-w-xl">
                <p>Ambisi kami sederhana: Menjadikan HUCHA sebagai merek perawatan otomotif terpercaya yang dapat ditemukan dan diandalkan oleh pelanggan serta mitra bisnis di seluruh Indonesia.</p>
                <p>Kami membangun HUCHA langkah demi langkah dengan memperluas portofolio produk, memperkuat kemitraan, meningkatkan kapabilitas, dan terus belajar dari kebutuhan pasar.</p>
                <p className="font-medium text-navy-dark">Tujuan kami bukan sekadar menjadi lebih besar. Tujuan kami adalah tumbuh lebih kuat, lebih terpercaya, dan memberikan nilai yang lebih berdampak bagi semua pihak yang kami layani.</p>
              </div>
            </div>
          </div>
        </section>

        {/* HUCHA PROTECT - Icon Grid */}
        <section id="values" className="scroll-mt-20">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 text-sm font-semibold text-primary bg-primary/10 rounded-full mb-6">
              HUCHA PROTECT
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-navy-dark mb-4 leading-tight">
              THE VALUES BEHIND<br />
              <span className="text-primary">HOW WE WORK</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Prinsip P-R-O-T-E-C-T mengarah pada satu tujuan: melindungi kendaraan, menciptakan nilai, dan membangun kepercayaan bersama mitra.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <article
                key={`${value.letter}-${value.title}`}
                className="group p-6 rounded-2xl bg-white border border-border shadow-sm transition-all duration-500 hover:shadow-lg hover:border-primary/30 hover:-translate-y-1 text-center"
              >
                <div className="relative mb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 mx-auto">
                    <value.icon className="w-8 h-8" aria-hidden="true" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-bold font-heading">
                    {value.letter}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-navy-dark mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{value.desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* WHAT WE PROVIDE - Product Card Grid */}
        <section id="provide" className="scroll-mt-20">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 text-sm font-semibold text-primary bg-primary/10 rounded-full mb-6">
              WHAT WE PROVIDE
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-navy-dark mb-4 leading-tight">
              AUTOMOTIVE CARE &<br />
              <span className="text-primary">MAINTENANCE SOLUTIONS</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              HUCHA menyediakan berbagai rangkaian produk yang terus berkembang untuk perawatan kendaraan sehari-hari.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <article
                key={product.category}
                className="group relative overflow-hidden rounded-2xl bg-white border border-border shadow-sm transition-all duration-500 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <img
                    src={product.image}
                    alt={product.category}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/90 backdrop-blur-sm text-primary">
                      <product.icon className="w-6 h-6" aria-hidden="true" />
                    </div>
                  </div>
                </div>
                <div className="p-5 space-y-2">
                  <h3 className="text-lg font-bold text-navy-dark group-hover:text-primary transition-colors">
                    {product.category}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{product.desc}</p>
                </div>
              </article>
            ))}
          </div>
          <p className="text-center text-muted-foreground mt-8 text-sm">
            Portofolio produk kami terus berkembang seiring mendengarkan kebutuhan pasar dan mengidentifikasi peluang baru untuk melayani pelanggan.
          </p>
        </section>

        {/* OUR PRODUCT APPROACH - Horizontal Flow Diagram */}
        <section id="approach" className="scroll-mt-20">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 text-sm font-semibold text-primary bg-primary/10 rounded-full mb-6">
              OUR PRODUCT APPROACH
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-navy-dark mb-4 leading-tight">
              PRODUCTS WITH<br />
              <span className="text-primary">A PURPOSE</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12">
              Kami percaya pengembangan produk harus dimulai dengan pertanyaan sederhana: &ldquo;What problem are we solving?&rdquo;
            </p>
          </div>
          <div className="relative">
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 -translate-y-1/2 h-0.5 bg-primary/20" />
            <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-0 relative z-10">
              <div className="text-center w-full lg:w-1/6 p-4">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary text-white mb-4 mx-auto shadow-lg">
                  <HelpCircleIcon className="w-10 h-10" aria-hidden="true" />
                </div>
                <p className="text-sm font-bold text-navy-dark uppercase tracking-wider">What problem are</p>
                <p className="text-sm font-bold text-navy-dark uppercase tracking-wider">we solving?</p>
              </div>
              {approachPillars.map((pillar, index) => (
                <div
                  key={pillar.title}
                  className="flex flex-col items-center w-full lg:w-1/6 p-4 relative"
                >
                  <div className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 w-full h-0.5 bg-primary/20 z-0" />
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                      <TargetIcon className="w-7 h-7" aria-hidden="true" />
                    </div>
                    <h3 className="text-sm font-bold text-navy-dark text-center mb-1">{pillar.title}</h3>
                    <p className="text-xs text-muted-foreground text-center max-w-xs">{pillar.desc}</p>
                  </div>
                  {index < approachPillars.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 right-0 translate-x-1/2 text-primary">
                      <ChevronRightIcon className="w-5 h-5" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* OUR PARTNERS - Zig-zag: Text Left, Image Right */}
        <section id="partners" className="scroll-mt-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="text-left lg:pr-8">
              <span className="inline-block px-4 py-1.5 text-sm font-semibold text-primary bg-primary/10 rounded-full mb-6">
                OUR PARTNERS
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-navy-dark mb-6 leading-tight">
                GROWING<br />
                <span className="text-primary">TOGETHER</span>
              </h2>
              <div className="space-y-4 text-lg text-muted-foreground max-w-xl mb-8">
                <p>Pelanggan dan pemasok kami bukan sekadar nilai transaksi bisnis semata. Mereka adalah bagian penting dari pertumbuhan HUCHA.</p>
                <p>Kami bertujuan untuk membangun kemitraan yang:</p>
              </div>
              <ul className="space-y-3 max-w-xl">
                {["TRUSTED", "RELIABLE", "MUTUALLY BENEFICIAL", "LONG-TERM"].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-navy-dark">
                    <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <CheckIcon className="w-4 h-4 text-primary" aria-hidden="true" />
                    </div>
                    <span className="font-medium">{item.toLowerCase()}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-lg text-navy-dark font-medium max-w-xl">
                Kami percaya bahwa ketika mitra kami berkembang, HUCHA tumbuh bersama mereka.
              </p>
            </div>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-muted">
              <img
                src="/tentang-hucha/57.png"
                alt="Tim HUCHA berdiskusi dengan mitra bengkel"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <p className="text-sm font-medium text-primary-foreground/80 mb-1">Building Partnerships</p>
                <p className="text-lg font-heading tracking-wide">Trusted. Reliable. Long-term.</p>
              </div>
            </div>
          </div>
        </section>

        {/* COMMITMENT - Interactive List with Icons */}
        <section id="commitment" className="scroll-mt-20">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 text-sm font-semibold text-primary bg-primary/10 rounded-full mb-6">
              OUR COMMITMENT
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-navy-dark mb-4 leading-tight">
              ALWAYS MOVING<br />
              <span className="text-primary">FORWARD</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Sebagai perusahaan yang terus berkembang, kami menyadari selalu ada ruang untuk menjadi lebih baik.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {commitments.map((commitment) => (
              <article
                key={commitment.title}
                className="group p-6 rounded-2xl bg-white border border-border shadow-sm transition-all duration-500 hover:shadow-lg hover:border-primary/30 hover:-translate-y-1"
              >
                <div className="flex items-start gap-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 flex-shrink-0">
                    <commitment.icon className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-navy-dark mb-2 group-hover:text-primary transition-colors">
                      {commitment.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{commitment.desc}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* JOURNEY - Vertical Timeline */}
        <section id="journey" className="scroll-mt-20">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 text-sm font-semibold text-primary bg-primary/10 rounded-full mb-6">
              OUR JOURNEY
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-navy-dark mb-4 leading-tight">
              FROM A SIMPLE IDEA TO A<br />
              <span className="text-primary">GROWING INDONESIAN BRAND</span>
            </h2>
          </div>
          <div className="max-w-3xl mx-auto relative">
            <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-0.5 bg-primary/20" />
            <div className="space-y-12 relative">
              {timeline.map((item, index) => (
                <div
                  key={item.year}
                  className="relative flex flex-col lg:flex-row items-start lg:items-center gap-6"
                >
                  <div className="relative z-10 w-full lg:w-1/3 text-right lg:pr-8 order-2 lg:order-1">
                    <span className="inline-block px-4 py-1.5 text-sm font-bold font-heading text-primary bg-primary/10 rounded-full mb-3">
                      {item.year}
                    </span>
                    <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                  <div className="relative z-10 flex-shrink-0 w-6 h-6 rounded-full bg-primary border-4 border-white shadow-lg lg:order-2" />
                  <div className="relative z-10 w-full lg:w-1/3 text-left lg:pl-8 order-1 lg:order-3">
                    {index % 2 === 0 && (
                      <div className="aspect-video rounded-xl bg-muted overflow-hidden shadow-lg">
                        <img
                          src={`/tentang-hucha/${index === 0 ? 58 : index === 2 ? 60 : index === 4 ? 62 : 59}.png`}
                          alt={`HUCHA Journey - ${item.year}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* OUR FUTURE - Full-width Banner */}
        <section id="future" className="scroll-mt-20 relative rounded-3xl overflow-hidden">
          <div className="relative aspect-[21/9] min-h-[400px]">
            <img
              src="/tentang-hucha/64.png"
              alt="Gudang distribusi HUCHA"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-navy-dark/95 via-navy-dark/80 to-navy/70" />
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="text-center text-white max-w-4xl relative z-10">
                <span className="inline-block px-4 py-1.5 text-sm font-semibold text-primary-foreground bg-white/20 backdrop-blur-sm rounded-full mb-6 border border-white/20">
                  OUR FUTURE
                </span>
                <h2 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-8 leading-tight font-heading">
                  BUILT TO GROW.<br />
                  <span className="text-primary-foreground">BUILT TO PROTECT.</span>
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto mb-10 text-left">
                  {futureGoals.map((goal) => (
                    <div key={goal} className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-primary-foreground flex-shrink-0 mt-1" />
                      <span className="font-medium">{goal}</span>
                    </div>
                  ))}
                </div>
                <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto italic">
                  &ldquo;Karena melindungi kendaraan adalah fungsi dari produk kami. Namun membangun kepercayaan, menciptakan nilai, dan tumbuh bersama adalah prinsip utama berdirinya HUCHA.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* LET’S GROW TOGETHER - CTA */}
        <section id="join" className="scroll-mt-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-muted">
              <img
                src="/tentang-hucha/65.png"
                alt="Kemitraan HUCHA"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/60 via-transparent to-transparent" />
            </div>
            <div className="text-left lg:pl-8">
              <span className="inline-block px-4 py-1.5 text-sm font-semibold text-primary bg-primary/10 rounded-full mb-6">
                LET’S GROW TOGETHER
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-navy-dark mb-6 leading-tight">
                LOOKING FOR A<br />
                <span className="text-primary">LONG-TERM PARTNER?</span>
              </h2>
              <div className="space-y-4 text-lg text-muted-foreground max-w-xl mb-8">
                <p>HUCHA menyambut terbuka para distributor, retailer, pemilik bengkel, mitra bisnis, dan supplier yang memiliki komitmen sama untuk membangun nilai jangka panjang.</p>
                <p>Jika Anda mencari merek otomotif yang solid untuk berkembang bersama, kami sangat senang untuk memulai pembicaraan.</p>
              </div>
              <div className="space-y-4">
                <a
                  href={siteConfig.social.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-white font-semibold rounded-xl hover:bg-navy-dark transition-colors shadow-lg hover:shadow-xl"
                >
                  <MessageCircleIcon className="w-5 h-5" aria-hidden="true" />
                  Hubungi Kami via WhatsApp
                  <ArrowRightIcon className="w-5 h-5" aria-hidden="true" />
                </a>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <span>Follow us:</span>
                  <a
                    href={siteConfig.social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 hover:text-primary transition-colors"
                  >
                    <CameraIcon className="w-5 h-5" aria-hidden="true" />
                    Instagram
                  </a>
                  <a
                    href={siteConfig.social.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 hover:text-primary transition-colors"
                  >
                    <Music2Icon className="w-5 h-5" aria-hidden="true" />
                    TikTok
                  </a>
                </div>
              </div>
              <div className="mt-10 pt-8 border-t border-border space-y-2 text-sm text-muted-foreground">
                <p className="font-bold text-navy-dark">HUCHA — Built to Protect</p>
                <p>CV. Usaha Bintang Mulia</p>
                <p>Website: {siteConfig.whatsappDisplay}</p>
                <p>Email: {siteConfig.email}</p>
                <p>Phone / WhatsApp: {siteConfig.phone}</p>
              </div>
            </div>
          </div>
        </section>

        {/* CLOSING - 4 Pillars with Shield Watermark */}
        <section id="closing" className="scroll-mt-20 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <ShieldCheckIcon className="w-full h-full text-primary mx-auto my-20" aria-hidden="true" />
          </div>
          <div className="relative z-10 py-20">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-navy-dark mb-4 leading-tight">
                CLOSING
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Prinsip dasar yang menggerakkan setiap langkah HUCHA
              </p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {[
                { title: "PROTECT THE VEHICLE", icon:   ShieldCheckIcon, desc: "Fungsi utama produk kami adalah melindungi kendaraan pelanggan." },
                { title: "CREATE VALUE", icon: LightbulbIcon, desc: "Memberikan nilai nyata dan berarti bagi setiap pelanggan." },
                { title: "BUILD TRUST", icon: HandshakeIcon, desc: "Membangun kepercayaan jangka panjang dengan semua mitra." },
                { title: "GROW TOGETHER", icon: TrendingUpIcon, desc: "Berkembang bersama mitra, pelanggan, dan tim HUCHA." },
              ].map((pillar) => (
                <article
                  key={pillar.title}
                  className="group p-6 rounded-2xl bg-white border border-border shadow-sm transition-all duration-500 hover:shadow-lg hover:border-primary/30 hover:-translate-y-1 text-center relative overflow-hidden"
                >
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <pillar.icon className="w-16 h-16 text-primary/10" aria-hidden="true" />
                  </div>
                  <div className="relative z-10">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-all duration-500 mx-auto">
                      <pillar.icon className="w-7 h-7" aria-hidden="true" />
                    </div>
                    <h3 className="text-sm font-bold text-navy-dark uppercase tracking-wider mb-2">{pillar.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{pillar.desc}</p>
                  </div>
                </article>
              ))}
            </div>
            <div className="text-center mt-16">
              <p className="text-2xl sm:text-3xl font-heading font-bold text-navy-dark italic tracking-wide">
                &ldquo;Protect the vehicle. • Create value for the customer. • Build trust with our partners. • Grow together.&rdquo;
              </p>
              <p className="mt-4 text-lg font-bold text-primary font-heading tracking-widest">
                HUCHA — Built to Protect.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
