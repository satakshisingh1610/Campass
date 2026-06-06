import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;

  const saved = await prisma.savedCollege.findMany({
    where: { userId },
    include: {
      college: { include: { tags: true } },
    },
    orderBy: { savedAt: "desc" },
  });

  return NextResponse.json({ saved });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;
  const { collegeId } = await req.json();

  try {
    const saved = await prisma.savedCollege.create({
      data: { userId, collegeId },
    });
    return NextResponse.json({ saved }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Already saved" }, { status: 409 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;
  const { searchParams } = req.nextUrl;
  const collegeId = searchParams.get("collegeId");

  if (!collegeId) {
    return NextResponse.json({ error: "Missing collegeId" }, { status: 400 });
  }

  await prisma.savedCollege.deleteMany({ where: { userId, collegeId } });
  return NextResponse.json({ ok: true });
}
