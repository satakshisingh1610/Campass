import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;

    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "All";
    const stream = searchParams.get("stream") || "All";
    const fees = searchParams.get("fees") || "All";
    const sortBy = searchParams.get("sortBy") || "rating";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(20, parseInt(searchParams.get("limit") || "12"));

    const where: Prisma.CollegeWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        { state: { contains: search, mode: "insensitive" } },
        { stream: { contains: search, mode: "insensitive" } },
      ];
    }

    if (type !== "All") {
      where.type = type.toUpperCase() as Prisma.EnumCollegeTypeFilter;
    }

    if (stream !== "All") {
      where.stream = { contains: stream, mode: "insensitive" };
    }

    if (fees === "low") {
      where.annualFees = { lte: 200000 };
    } else if (fees === "mid") {
      where.annualFees = { gte: 200000, lte: 800000 };
    } else if (fees === "high") {
      where.annualFees = { gte: 800000 };
    }

    const orderBy: Prisma.CollegeOrderByWithRelationInput =
      sortBy === "fees_asc"
        ? { annualFees: "asc" }
        : sortBy === "fees_desc"
        ? { annualFees: "desc" }
        : sortBy === "placement"
        ? { avgPackage: "desc" }
        : sortBy === "nirf"
        ? { nirfRank: "asc" }
        : { rating: "desc" };

    const [colleges, total] = await Promise.all([
      prisma.college.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          tags: { select: { label: true } },
        },
      }),
      prisma.college.count({ where }),
    ]);

    return NextResponse.json({
      colleges,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("[COLLEGES_LIST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
