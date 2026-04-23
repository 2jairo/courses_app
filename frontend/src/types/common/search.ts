export const SEARCH_MODE = ["fts", "ai"] as const;
export type SearchMode = typeof SEARCH_MODE[number];

export const FACETABLE_FIELDS = ["lectureAccesibility", "language", "tags", "author"] as const;
export type FacetableFields = typeof FACETABLE_FIELDS[number];

export const SORT_BY_FIELDS = ["updatedAt", "discountedPrice", "discountPercent", "avgRating", "totalReviews", "trending"] as const;
export type SortByFields = typeof SORT_BY_FIELDS[number];