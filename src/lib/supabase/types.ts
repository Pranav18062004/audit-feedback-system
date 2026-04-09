export type Store = {
  id: string;
  name: string;
  code: string;
  region: string | null;
  is_active: boolean;
  created_at: string;
};

export type Question = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type AllowedUserRole = "admin" | "user";

export type AllowedUser = {
  id: string;
  email: string;
  role: AllowedUserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type StoreMetricRow = {
  store_id: string;
  metric_date: string;
  feedback_count: number;
  comments_count: number;
  rating_sums: Record<string, number>;
  rating_counts: Record<string, number>;
};

export type RawFeedbackRow = {
  id: string;
  store_id: string;
  created_at: string;
  comments: string | null;
  submitted_by_email: string;
  feedback_ratings: Array<{
    rating: number;
    questions: Pick<Question, "id" | "slug" | "title"> | null;
  }> | null;
  stores: Pick<Store, "name" | "code"> | null;
};

export type StoreSummary = {
  storeId: string;
  storeName: string;
  storeCode: string;
  region: string | null;
  feedbackCount: number;
  commentsCount: number;
  overallAverage: number;
  averages: Record<string, number>;
};

export type TrendPoint = {
  date: string;
  feedbackCount: number;
  overall: number;
  averages: Record<string, number>;
};

export type FeedbackSubmission = {
  storeId: string;
  comments?: string;
  ratings: Array<{
    questionId: string;
    rating: number;
  }>;
};
