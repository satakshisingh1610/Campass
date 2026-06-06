import type { College, Course, CollegeTag, TopRecruiter, Review, User } from "@prisma/client";

export type CollegeWithDetails = College & {
  courses: Course[];
  tags: CollegeTag[];
  topRecruiters: TopRecruiter[];
  reviews: (Review & {
    user: Pick<User, "name" | "image">;
  })[];
};

export type CollegeWithTags = College & {
  tags: CollegeTag[];
};

export interface CollegeFilters {
  search: string;
  type: string;
  stream: string;
  fees: string;
  sortBy: string;
  page: number;
}

export interface PaginatedColleges {
  colleges: CollegeWithTags[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface PredictionResult {
  college: CollegeWithTags;
  chance: number;
  admissionType: "Safe" | "Moderate" | "Reach";
}
