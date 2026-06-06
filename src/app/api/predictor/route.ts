import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const EXAM_CUTOFFS: Record<
  string,
  Record<string, { colleges: string[]; type: "IIT" | "NIT" | "DEEMED" | "PRIVATE" | "CENTRAL" }[]>
> = {
  "JEE Main": {
    General: [
      { colleges: ["iit-bombay", "iit-delhi", "iit-madras", "iit-kharagpur"], type: "IIT" },
      { colleges: ["nit-trichy", "nit-warangal"], type: "NIT" },
      { colleges: ["vit-vellore", "manipal-institute"], type: "PRIVATE" },
    ],
  },
  "JEE Advanced": {
    General: [
      { colleges: ["iit-bombay", "iit-delhi", "iit-madras", "iit-kharagpur"], type: "IIT" },
    ],
  },
  CAT: {
    General: [
      { colleges: ["iim-ahmedabad"], type: "DEEMED" },
    ],
  },
  NEET: {
    General: [
      { colleges: ["aiims-delhi"], type: "CENTRAL" },
      { colleges: ["manipal-institute"], type: "DEEMED" },
    ],
  },
  BITSAT: {
    General: [
      { colleges: ["bits-pilani"], type: "DEEMED" },
    ],
  },
};

// Rank ranges → admission chance (0-100)
function calculateChance(
  exam: string,
  rank: number,
  category: string,
  collegeSlug: string
): number {
  const categoryMultiplier = category === "SC" || category === "ST" ? 2.5 : category === "OBC" ? 1.5 : category === "EWS" ? 1.3 : 1;
  const adjustedRank = Math.round(rank / categoryMultiplier);

  const chanceMap: Record<string, Record<string, number>> = {
    "JEE Advanced": {
      "iit-bombay": adjustedRank <= 100 ? 95 : adjustedRank <= 300 ? 75 : adjustedRank <= 500 ? 40 : adjustedRank <= 1000 ? 15 : 5,
      "iit-delhi": adjustedRank <= 200 ? 95 : adjustedRank <= 500 ? 78 : adjustedRank <= 800 ? 45 : adjustedRank <= 1500 ? 20 : 5,
      "iit-madras": adjustedRank <= 150 ? 95 : adjustedRank <= 400 ? 80 : adjustedRank <= 700 ? 50 : adjustedRank <= 1200 ? 22 : 5,
      "iit-kharagpur": adjustedRank <= 500 ? 90 : adjustedRank <= 1500 ? 72 : adjustedRank <= 3000 ? 45 : adjustedRank <= 5000 ? 25 : 8,
    },
    "JEE Main": {
      "nit-trichy": adjustedRank <= 5000 ? 92 : adjustedRank <= 15000 ? 75 : adjustedRank <= 30000 ? 50 : adjustedRank <= 60000 ? 25 : 8,
      "nit-warangal": adjustedRank <= 8000 ? 90 : adjustedRank <= 20000 ? 78 : adjustedRank <= 40000 ? 55 : adjustedRank <= 80000 ? 30 : 10,
      "vit-vellore": adjustedRank <= 50000 ? 88 : adjustedRank <= 150000 ? 72 : adjustedRank <= 300000 ? 55 : 35,
      "manipal-institute": adjustedRank <= 100000 ? 85 : adjustedRank <= 300000 ? 68 : 45,
      "iit-bombay": adjustedRank <= 1000 ? 60 : adjustedRank <= 3000 ? 25 : adjustedRank <= 5000 ? 10 : 3,
      "iit-delhi": adjustedRank <= 1500 ? 55 : adjustedRank <= 4000 ? 22 : adjustedRank <= 6000 ? 8 : 2,
    },
    CAT: {
      "iim-ahmedabad": adjustedRank <= 200 ? 85 : adjustedRank <= 500 ? 55 : adjustedRank <= 1000 ? 25 : adjustedRank <= 2000 ? 10 : 3,
    },
    NEET: {
      "aiims-delhi": adjustedRank <= 50 ? 90 : adjustedRank <= 100 ? 60 : adjustedRank <= 200 ? 20 : 5,
      "manipal-institute": adjustedRank <= 10000 ? 88 : adjustedRank <= 30000 ? 70 : adjustedRank <= 80000 ? 50 : 25,
    },
    BITSAT: {
      "bits-pilani": adjustedRank <= 500 ? 92 : adjustedRank <= 1500 ? 72 : adjustedRank <= 3000 ? 45 : adjustedRank <= 5000 ? 20 : 5,
    },
  };

  return chanceMap[exam]?.[collegeSlug] ?? Math.max(5, 50 - rank / 10000);
}

function getAdmissionType(chance: number): "Safe" | "Moderate" | "Reach" {
  if (chance >= 70) return "Safe";
  if (chance >= 40) return "Moderate";
  return "Reach";
}

export async function POST(req: NextRequest) {
  try {
    const { exam, rank, category, stream } = await req.json();

    if (!exam || !rank) {
      return NextResponse.json({ error: "Exam and rank are required" }, { status: 400 });
    }

    const rankNum = parseInt(rank);

    // Get all colleges from DB
    const colleges = await prisma.college.findMany({
      include: { tags: true, topRecruiters: true },
    });

    // Build predictions
    const predictions = colleges
      .map((college) => {
        const chance = calculateChance(exam, rankNum, category || "General", college.slug);
        return {
          college,
          chance: Math.round(chance),
          admissionType: getAdmissionType(chance),
        };
      })
      .filter((p) => p.chance >= 3)
      .sort((a, b) => b.chance - a.chance)
      .slice(0, 8);

    // Build summary
    const topChance = predictions[0]?.chance || 0;
    const safeCount = predictions.filter((p) => p.admissionType === "Safe").length;
    const reachCount = predictions.filter((p) => p.admissionType === "Reach").length;

    let summary = `With ${exam} Rank ${rankNum} (${category}), `;
    if (topChance >= 70) {
      summary += `you have strong admission chances at ${safeCount} college(s). `;
    } else if (topChance >= 40) {
      summary += `you have moderate chances at several good colleges. `;
    } else {
      summary += `admission will be competitive — aim for these target colleges. `;
    }
    summary += `${reachCount} reach options are included — strong academics/extracurriculars could tip the scales. Results are based on historical cutoffs and may vary.`;

    // Cache in DB
    await prisma.predictorQuery.create({
      data: {
        exam,
        rank: rankNum,
        category: category || "General",
        stream: stream || null,
        results: predictions.map((p) => ({
          collegeId: p.college.id,
          collegeName: p.college.name,
          chance: p.chance,
          admissionType: p.admissionType,
        })),
      },
    });

    return NextResponse.json({ predictions, summary });
  } catch (err) {
    console.error("[PREDICTOR]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
