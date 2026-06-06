import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CollegeDetailClient } from "@/components/colleges/CollegeDetailClient";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  const colleges = await prisma.college.findMany({ select: { slug: true } });
  return colleges.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props) {
  const college = await prisma.college.findUnique({
    where: { slug: params.slug },
  });
  if (!college) return { title: "College Not Found" };
  return {
    title: `${college.name} — Fees, Placements, Reviews | Campass`,
    description: college.overview.slice(0, 160),
  };
}

export default async function CollegeDetailPage({ params }: Props) {
  const college = await prisma.college.findUnique({
    where: { slug: params.slug },
    include: {
      courses: true,
      tags: true,
      topRecruiters: true,
      reviews: {
        include: { user: { select: { name: true, image: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!college) notFound();

  return <CollegeDetailClient college={college} />;
}
