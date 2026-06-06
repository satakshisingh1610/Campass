import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const ids = searchParams.getAll("id");

  if (!ids.length || ids.length > 3) {
    return NextResponse.json(
      { error: "Provide 1–3 college IDs" },
      { status: 400 }
    );
  }

  const colleges = await prisma.college.findMany({
    where: { id: { in: ids } },
    include: {
      tags: true,
      courses: true,
      topRecruiters: true,
    },
  });

  return NextResponse.json({ colleges });
}
