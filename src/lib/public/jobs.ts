import { JobRepository } from "@/domain/jobs/job.repository";
import type { EmploymentType, MockJob } from "@/lib/mock/jobs";

const EMPLOYMENT_TYPES: EmploymentType[] = [
  "full_time",
  "part_time",
  "contract",
  "internship",
];

type PublicJob = Awaited<ReturnType<JobRepository["listOpen"]>>[number];

function normalizeEmploymentType(value: string | null): EmploymentType {
  return EMPLOYMENT_TYPES.includes(value as EmploymentType)
    ? (value as EmploymentType)
    : "full_time";
}

function toMockJob(job: PublicJob): MockJob {
  return {
    id: job.id,
    title: job.title,
    slug: job.slug,
    department: job.department ?? "Umum",
    location: job.location ?? "Indonesia",
    employmentType: normalizeEmploymentType(job.employmentType),
    description: job.description ?? "",
    requirements: (job.requirements ?? "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
  };
}

export async function getPublicJobs(): Promise<MockJob[]> {
  try {
    const jobs = await new JobRepository().listOpen();
    return jobs.map(toMockJob);
  } catch (err) {
    console.error("[jobs] getPublicJobs failed:", err);
    return [];
  }
}

export async function getJobBySlug(
  slug: string
): Promise<MockJob | undefined> {
  try {
    const job = await new JobRepository().findBySlug(slug);
    return job ? toMockJob(job) : undefined;
  } catch (err) {
    console.error(`[jobs] getJobBySlug failed for "${slug}":`, err);
    return undefined;
  }
}
