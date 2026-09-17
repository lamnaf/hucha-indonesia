import Link from "next/link";
import { getSiteConfig } from "@/lib/public/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Tentang Kami",
  description:
    "Kenali HuCha Indonesia (CV Usaha Bintang Mulia) — distributor suku cadang motor, cairan otomotif, dan produk perawatan kendaraan yang terpercaya di Indonesia.",
  path: "/tentang-kami",
});

export default async function About() {
  const siteConfig = await getSiteConfig();

  const sections = [
    {
      id: "about",
      title: "01 — ABOUT HUCHA",
      subtitle: "Built to Protect. Made to Grow.",
      content: (
        <div className="space-y-4">
          <p>HUCHA adalah merek perawatan otomotif Indonesia yang berfokus pada penyediaan solusi praktis untuk pemeliharaan dan perlindungan kendaraan.</p>
          <p>Kami mengembangkan dan menyediakan produk yang dirancang untuk mendukung perawatan kendaraan sehari-hari mulai dari cooling system, brake system, lubrication, battery care, hingga kebutuhan sepeda motor dan otomotif lainnya.</p>
          <p>Kami percaya bahwa produk otomotif yang baik harus melakukan lebih dari sekadar menjalankan fungsinya. Produk tersebut harus mampu memberikan solusi masalah, memberikan nilai nyata (real value), dan memberikan rasa percaya diri kepada pelanggan terhadap kendaraan mereka.</p>
          <p>HUCHA terus berkembang dengan memperluas portofolio produk kami, meningkatkan layanan kepada para mitra, serta membangun hubungan jangka panjang dengan pelanggan dan pemasok di seluruh Indonesia.</p>
        </div>
      ),
    },
    {
      id: "purpose",
      title: "02 — OUR PURPOSE",
      subtitle: "SOLVING PROBLEMS. CREATING VALUE. BUILDING RELATIONSHIPS.",
      content: (
        <div className="space-y-4">
          <p>Di HUCHA, kami percaya bahwa bisnis bukan sekadar menjual produk. Ini adalah tentang memahami apa yang dibutuhkan pelanggan, menemukan solusi praktis, dan menciptakan nilai yang bertahan lama.</p>
          <p>Setiap produk yang kami hadirkan memiliki tujuan: 1. Membantu masyarakat merawat, melindungi, dan memaksimalkan performa kendaraan mereka.</p>
          <p>Dan setiap hubungan kerja sama yang kami bangun memegang prinsip yang sama: • Saling percaya, saling menguntungkan, dan tumbuh bersama dalam jangka panjang (Mutual trust, mutual benefit, and long-term growth).</p>
        </div>
      ),
    },
    {
      id: "vision",
      title: "03 — OUR VISION",
      subtitle: "A TRUSTED AUTOMOTIVE CARE BRAND ACROSS INDONESIA",
      content: (
        <div className="space-y-4">
          <p>Ambisi kami sederhana: Menjadikan HUCHA sebagai merek perawatan otomotif terpercaya yang dapat ditemukan dan diandalkan oleh pelanggan serta mitra bisnis di seluruh Indonesia.</p>
          <p>Kami membangun HUCHA langkah demi langkah dengan memperluas portofolio produk, memperkuat kemitraan, meningkatkan kapabilitas, dan terus belajar dari kebutuhan pasar.</p>
          <p>Tujuan kami bukan sekadar menjadi lebih besar. Tujuan kami adalah tumbuh lebih kuat, lebih terpercaya, dan memberikan nilai yang lebih berdampak bagi semua pihak yang kami layani.</p>
        </div>
      ),
    },
    {
      id: "values",
      title: "04 — HUCHA PROTECT",
      subtitle: "THE VALUES BEHIND HOW WE WORK",
      content: (
        <ul className="space-y-3">
          <li><strong>P — PARTNERSHIP:</strong> Kami percaya bahwa pertumbuhan yang berkelanjutan dibangun secara bersama-sama. Kami mengembangkan hubungan dengan pelanggan, pemasok, dan mitra bisnis berdasarkan kepercayaan, rasa hormat, manfaat bersama, serta komitmen jangka panjang.</li>
          <li><strong>R — RESPONSIBILITY:</strong> Kami bertanggung jawab penuh atas pekerjaan, keputusan, dan komitmen kami. Setiap anggota tim HUCHA memiliki tanggung jawab untuk memberikan kontribusi terbaik dan mendorong kemajuan perusahaan.</li>
          <li><strong>O — OPPORTUNITY:</strong> Kami terus mencari peluang untuk melakukan perbaikan, belajar, berinovasi, dan berkembang. Tantangan adalah kesempatan bagi kami untuk menjadi lebih baik.</li>
          <li><strong>T — TRUST:</strong> Kepercayaan adalah fondasi dari setiap hubungan kami. Kami menjunjung tinggi kejujuran, konsistensi, transparansi, dan komitmen yang tepat janji.</li>
          <li><strong>E — EXCELLENCE:</strong> Kami terus meningkatkan kualitas produk, layanan, sistem, dan cara kerja kami. Kami mungkin belum sempurna, tetapi kami selalu berusaha untuk memberikan yang terbaik.</li>
          <li><strong>C — CUSTOMER SOLUTIONS:</strong> Kami tidak sekadar menjual produk. Kami berusaha memahami permasalahan dan memberikan solusi praktis yang memberikan nilai nyata bagi pelanggan kami.</li>
          <li><strong>T — TOGETHER:</strong> HUCHA berkembang melalui kerja sama tim. Kami saling menghormati, mendukung satu sama lain, dan percaya bahwa keberhasilan perusahaan adalah tanggung jawab bersama.</li>
        </ul>
      ),
    },
    {
      id: "provide",
      title: "05 — WHAT WE PROVIDE",
      subtitle: "AUTOMOTIVE CARE & MAINTENANCE SOLUTIONS",
      content: (
        <div className="space-y-4">
          <p>HUCHA menyediakan berbagai rangkaian produk yang terus berkembang untuk perawatan kendaraan sehari-hari:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>COOLING SYSTEM:</strong> Produk yang dirancang untuk mendukung pemeliharaan dan perlindungan sistem pendingin kendaraan.</li>
            <li><strong>BRAKE SYSTEM:</strong> Produk pendukung perawatan sistem pengereman dan keselamatan kendaraan sehari-hari.</li>
            <li><strong>LUBRICATION:</strong> Solusi pelumasan untuk berbagai komponen dan aplikasi sepeda motor.</li>
            <li><strong>BATTERY CARE:</strong> Produk pendukung perawatan dan pemeliharaan aki sepeda motor.</li>
            <li><strong>MOTORCYCLE MAINTENANCE:</strong> Produk praktis untuk pemeliharaan dan servis berkala sepeda motor.</li>
            <li><strong>MOTORCYCLE PARTS:</strong> Komponen dan suku cadang sepeda motor pilihan yang dikembangkan untuk memenuhi kebutuhan pasar sehari-hari.</li>
          </ul>
          <p>Portofolio produk kami terus berkembang seiring mendengarkan kebutuhan pasar dan mengidentifikasi peluang baru untuk melayani pelanggan.</p>
        </div>
      ),
    },
    {
      id: "approach",
      title: "06 — OUR PRODUCT APPROACH",
      subtitle: "PRODUCTS WITH A PURPOSE",
      content: (
        <div className="space-y-4">
          <p>Kami percaya bahwa pengembangan produk harus dimulai dengan pertanyaan sederhana: &quot;What problem are we solving?&quot; (Masalah apa yang sedang kita selesaikan?)</p>
          <p>Kami mendengarkan pelanggan, pemilik bengkel, retailer, distributor, dan dinamika pasar untuk memahami apa yang benar-benar dibutuhkan masyarakat. Dari sana, kami berfokus pada:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>FUNCTION:</strong> Produk harus dapat menjalankan fungsi dan peruntukannya secara optimal.</li>
            <li><strong>VALUE:</strong> Produk harus memberikan nilai yang berarti bagi pelanggan dan mitra bisnis.</li>
            <li><strong>PRACTICALITY:</strong> Produk harus praktis dan cocok untuk penggunaan sehari-hari di dunia nyata.</li>
            <li><strong>CONSISTENCY:</strong> Kami terus bekerja untuk menjaga dan meningkatkan konsistensi kualitas produk serta layanan.</li>
            <li><strong>IMPROVEMENT:</strong> Masukan dan umpan balik dari pelanggan menjadi bagian penting dari proses pengembangan berkelanjutan kami.</li>
          </ul>
        </div>
      ),
    },
    {
      id: "partners",
      title: "07 — OUR PARTNERS",
      subtitle: "GROWING TOGETHER",
      content: (
        <div className="space-y-4">
          <p>Pelanggan dan pemasok kami bukan sekadar nilai transaksi bisnis semata. Mereka adalah bagian penting dari pertumbuhan HUCHA.</p>
          <p>Kami bertujuan untuk membangun kemitraan yang:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>TRUSTED:</strong> Komunikasi yang terbuka dan jujur.</li>
            <li><strong>RELIABLE:</strong> Komitmen yang konsisten terhadap tanggung jawab kami.</li>
            <li><strong>MUTUALLY BENEFICIAL:</strong> Menciptakan nilai tambah dan manfaat bagi kedua belah pihak.</li>
            <li><strong>LONG-TERM:</strong> Membangun hubungan berkelanjutan yang melampaui sekadar transaksi individual.</li>
          </ul>
          <p>Kami percaya bahwa ketika mitra kami berkembang, HUCHA tumbuh bersama mereka.</p>
        </div>
      ),
    },
    {
      id: "commitment",
      title: "08 — OUR COMMITMENT",
      subtitle: "ALWAYS MOVING FORWARD",
      content: (
        <div className="space-y-4">
          <p>Sebagai perusahaan yang terus berkembang, kami menyadari selalu ada ruang untuk menjadi lebih baik. Kami berkomitmen untuk terus mengembangkan:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>OUR PRODUCTS:</strong> Memperluas dan meningkatkan portofolio produk berdasarkan kebutuhan nyata di pasar.</li>
            <li><strong>OUR SERVICE:</strong> Selalu responsif dan memberikan dukungan penuh kepada pelanggan serta mitra bisnis.</li>
            <li><strong>OUR PEOPLE:</strong> Membangun tim yang saling menghormati, bertanggung jawab, dan terus belajar.</li>
            <li><strong>OUR SYSTEM:</strong> Meningkatkan proses operasional agar menjadi lebih konsisten dan handal.</li>
            <li><strong>OUR REACH:</strong> Memperluas jangkauan HUCHA dan membangun jaringan distribusi yang lebih kuat di seluruh Indonesia.</li>
          </ul>
        </div>
      ),
    },
    {
      id: "journey",
      title: "09 — OUR JOURNEY",
      subtitle: "FROM A SIMPLE IDEA TO A GROWING INDONESIAN BRAND",
      content: (
        <div className="space-y-4">
          <p>HUCHA berawal dari tujuan sederhana: Menyediakan produk-produk praktis yang membantu masyarakat merawat kendaraan mereka dengan lebih baik.</p>
          <p>Dari awal yang sederhana, HUCHA terus mengembangkan produknya, memahami dinamika pasar, dan membangun hubungan yang erat dengan pelanggan serta pemasok.</p>
          <p>Hari ini, kami melanjutkan perjalanan tersebut dengan ambisi yang lebih besar: TO BRING HUCHA CLOSER TO CUSTOMERS ACROSS INDONESIA.</p>
          <p>Perjalanan kami masih terus ditulis, dan kami percaya bagian terbaik masih ada di depan.</p>
        </div>
      ),
    },
    {
      id: "future",
      title: "10 — OUR FUTURE",
      subtitle: "BUILT TO GROW. BUILT TO PROTECT.",
      content: (
        <div className="space-y-4">
          <p>HUCHA sedang membangun masa depan di mana produk-produk kami dapat dijangkau dengan mudah oleh pelanggan di seluruh Indonesia.</p>
          <p>Kami akan terus: Mendengarkan kebutuhan pasar, Menyelesaikan masalah nyata, Mengembangkan produk yang lebih baik, Membangun kemitraan yang lebih kuat, Mengembangkan kualitas tim kami, Memperluas jangkauan distribusi.</p>
          <p>Karena melindungi kendaraan adalah fungsi dari produk kami. Namun membangun kepercayaan, menciptakan nilai, dan tumbuh bersama adalah prinsip utama berdirinya HUCHA.</p>
        </div>
      ),
    },
    {
      id: "join",
      title: "11 — LET'S GROW TOGETHER",
      subtitle: "LOOKING FOR A LONG-TERM PARTNER?",
      content: (
        <div className="space-y-4">
          <p>HUCHA menyambut terbuka para distributor, retailer, pemilik bengkel, mitra bisnis, dan supplier yang memiliki komitmen sama untuk membangun nilai jangka panjang.</p>
          <p>Jika Anda mencari merek otomotif yang solid untuk berkembang bersama, kami sangat senang untuk memulai pembicaraan.</p>
          <p><strong>HUCHA — Built to Protect</strong><br />
          CV. Usaha Bintang Mulia<br />
          Website: {siteConfig.whatsappDisplay}<br />
          Email: {siteConfig.email}<br />
          Phone / WhatsApp: {siteConfig.phone}<br />
          Social Media: <Link href={siteConfig.social.instagram} className="text-primary hover:underline">Instagram</Link> / <Link href={siteConfig.social.tiktok} className="text-primary hover:underline">TikTok</Link></p>
        </div>
      ),
    },
    {
      id: "closing",
      title: "12 — CLOSING",
      subtitle: "HUCHA — BUILT TO PROTECT.",
      content: (
        <p className="italic">Protect the vehicle. • Create value for the customer. • Build trust with our partners. • Grow together. HUCHA — Built to Protect.</p>
      ),
    },
  ];

  return (
    <>
      <div className="container py-16 sm:py-20 space-y-16">
        {sections.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-20 text-center">
            <div className="mx-auto max-w-3xl space-y-8">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-primary mb-2">{section.title}</h2>
                <h3 className="text-xl font-semibold">{section.subtitle}</h3>
              </div>
              <div className="prose prose-primary max-w-none text-center">
                {section.content}
              </div>
            </div>
          </section>
        ))}
</div>
    </>
  );
}
