import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  BriefcaseIcon,
  CheckCircle2Icon,
  ClockIcon,
  MapPinIcon,
} from "lucide-react";

import { absoluteUrl, pageMetadata } from "@/lib/seo";
import { getJobBySlug, getPublicJobs } from "@/lib/public/jobs";
import { employmentTypeLabel, type EmploymentType } from "@/lib/mock/jobs";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeading } from "@/components/section-heading";
import { CareerApplicationForm } from "@/components/forms/career-application-form";
import { JsonLd } from "@/components/json-ld";
import { Breadcrumb } from "@/components/breadcrumb";

const employmentTypeSchemaOrg: Record<EmploymentType, string> = {
  full_time: "FULL_TIME",
  part_time: "PART_TIME",
  contract: "CONTRACTOR",
  internship: "INTERNSHIP",
};

interface JobDetailProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: JobDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job) {
    return {};
  }
  return pageMetadata({
    title: `${job.title} — Karir`,
    description: job.description.slice(0, 155),
    path: `/karir/${job.slug}`,
  });
}

export default async function JobDetail({ params }: JobDetailProps) {
  const { slug } = await params;
  const [job, jobs] = await Promise.all([getJobBySlug(slug), getPublicJobs()]);
  if (!job) {
    notFound();
  }

  const jobJsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    datePosted: "2026-01-01",
    description: job.description,
    hiringOrganization: {
      "@type": "Organization",
      name: "HuCha Indonesia",
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location,
        addressCountry: "ID",
      },
    },
    employmentType: employmentTypeSchemaOrg[job.employmentType],
    url: absoluteUrl(`/karir/${job.slug}`),
  };

  return (
    <>
      <section className="border-b py-12 sm:py-16">
        <div className="container space-y-6">
          <Breadcrumb
            items={[{ label: "Karir", href: "/karir" }, { label: job.title }]}
          />
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">
              {employmentTypeLabel[job.employmentType]}
            </Badge>
            <Badge variant="outline">{job.department}</Badge>
          </div>
          <h1 className="text-balance max-w-2xl text-3xl sm:text-4xl">
            {job.title}
          </h1>
          <div className="text-muted-foreground flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-1.5">
              <MapPinIcon className="size-4" aria-hidden="true" />
              {job.location}
            </span>
            <span className="flex items-center gap-1.5">
              <ClockIcon className="size-4" aria-hidden="true" />
              {employmentTypeLabel[job.employmentType]}
            </span>
          </div>
        </div>
      </section>

      <section className="bg-muted/40 py-12 sm:py-16">
        <div className="container grid gap-10 lg:grid-cols-5">
          <div className="space-y-10 lg:col-span-3">
            <div className="space-y-3">
              <h2 className="text-xl font-bold tracking-tight">
                Deskripsi Pekerjaan
              </h2>
              <p className="text-muted-foreground text-pretty text-sm leading-relaxed">
                {job.description}
              </p>
            </div>
            <div className="space-y-3">
              <h2 className="text-xl">Persyaratan</h2>
              <ul className="space-y-2">
                {job.requirements.map((requirement) => (
                  <li
                    key={requirement}
                    className="text-muted-foreground flex items-start gap-2 text-sm"
                  >
                    <CheckCircle2Icon
                      className="text-primary mt-0.5 size-4 shrink-0"
                      aria-hidden="true"
                    />
                    {requirement}
                  </li>
                ))}
              </ul>
            </div>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
                    <BriefcaseIcon className="size-5" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-base">
                    Tentang HuCha Indonesia
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  HuCha Indonesia adalah distributor suku cadang motor, cairan
                  otomotif, dan produk perawatan kendaraan. Bergabunglah untuk
                  tumbuh bersama tim yang dinamis dan berorientasi pada kepuasan
                  pelanggan.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="lg:sticky lg:top-24 gap-0">
              <CardHeader>
                <CardTitle className="text-base">Lamar Posisi Ini</CardTitle>
              </CardHeader>
              <CardContent className="py-6">
                <CareerApplicationForm job={job} />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container">
              <SectionHeading
                title="Lowongan Lainnya"
            title="Posisi Menarik Lainnya"
            link={{ label: "Semua lowongan", href: "/karir" }}
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {jobs
              .filter((item) => item.slug !== job.slug)
              .slice(0, 3)
              .map((item) => (
                <Card key={item.id} className="gap-4">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {employmentTypeLabel[item.employmentType]}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">
                      <Link
                        href={`/karir/${item.slug}`}
                        className="hover:text-primary transition-colors"
                      >
                        {item.title}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
                      <MapPinIcon className="size-4" aria-hidden="true" />
                      {item.location}
                    </p>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </section>

      <JsonLd data={jobJsonLd} />
    </>
  );
}
