import Link from "next/link";
import { ArrowRightIcon, BriefcaseIcon, MapPinIcon } from "lucide-react";

import { pageMetadata } from "@/lib/seo";
import { getPublicJobs } from "@/lib/public/jobs";
import { employmentTypeLabel } from "@/lib/mock/jobs";

import { Hero } from "@/components/hero";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeading } from "@/components/section-heading";
import { EmptyState } from "@/components/empty-state";

export const metadata = pageMetadata({
  title: "Karir",
  description:
    "Gabung bersama tim HuCha Indonesia. Lihat lowongan kerja terbaru dan kirim lamaran Anda melalui halaman karir kami.",
  path: "/karir",
});

export default async function Career() {
  const jobs = await getPublicJobs();

  return (
    <>
      <Hero
        align="center"
        badge="Karir"
        title="Bergabunglah dengan Tim Kami"
        description="Kami selalu terbuka untuk talenta yang ingin tumbuh bersama industri otomotif Indonesia."
        actions={
          <Button asChild size="lg">
            <Link href="#lowongan">Lihat Lowongan</Link>
          </Button>
        }
      />

      <section
        id="lowongan"
        className="scroll-mt-20 border-t bg-muted/40 py-16 sm:py-20"
      >
        <div className="container">
          <SectionHeading
            eyebrow="Lowongan Terbuka"
            title="Posisi yang Sedang Kami Cari"
            description="Temukan peran yang sesuai dengan keahlian Anda."
          />
          {jobs.length === 0 ? (
            <EmptyState
              icon={<BriefcaseIcon />}
              title="Belum ada lowongan"
              description="Saat ini belum ada posisi terbuka. Pantau terus halaman ini atau kirim lamaran spontan melalui kontak kami."
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (
                <Card key={job.id} className="gap-4">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {employmentTypeLabel[job.employmentType]}
                      </Badge>
                      <Badge variant="outline">{job.department}</Badge>
                    </div>
                    <CardTitle className="text-lg">
                      <Link
                        href={`/karir/${job.slug}`}
                        className="hover:text-primary transition-colors"
                      >
                        {job.title}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col gap-4">
                    <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
                      <MapPinIcon className="size-4" aria-hidden="true" />
                      {job.location}
                    </p>
                    <p className="text-muted-foreground text-sm line-clamp-3">
                      {job.description}
                    </p>
                    <Button asChild variant="outline" className="mt-auto w-fit">
                      <Link href={`/karir/${job.slug}`}>
                        Lihat Detail & Lamar
                        <ArrowRightIcon className="size-4" aria-hidden="true" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container flex flex-col items-center gap-4 text-center">
          <BriefcaseIcon
            className="text-muted-foreground size-8"
            aria-hidden="true"
          />
          <h2 className="text-2xl">
            Tidak menemukan posisi yang cocok?
          </h2>
          <p className="text-muted-foreground max-w-xl">
            Kirimkan lamaran spontan beserta CV Anda, dan kami akan menyimpannya
            untuk peluang di masa mendatang.
          </p>
          <Button asChild>
            <Link href="/kontak">Hubungi Kami</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
