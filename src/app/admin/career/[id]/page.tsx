import type { Metadata } from "next";

import { requireAdmin } from "@/domain/auth/guards";
import { JobRepository } from "@/domain/jobs/job.repository";
import { NotFoundError } from "@/domain/errors";
import { JobForm } from "../job-form";

export const metadata: Metadata = {
  title: "Edit Lowongan",
  robots: { index: false, follow: false },
};

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;
  const jobId = Number(id);
  if (!Number.isInteger(jobId)) {
    throw new NotFoundError("Lowongan tidak ditemukan");
  }

  const job = await new JobRepository().findById(jobId);
  if (!job) {
    throw new NotFoundError(`Lowongan #${jobId} tidak ditemukan`);
  }

  return (
    <JobForm
      initial={{
        id: job.id,
        title: job.title,
        slug: job.slug,
        department: job.department,
        location: job.location,
        employmentType: job.employmentType,
        description: job.description,
        requirements: job.requirements,
        status: job.status,
      }}
    />
  );
}
