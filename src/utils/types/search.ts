/**
 * Type definitions for search-related components
 * Addresses remaining `any` types in find components
 */

import type { DtoSearchHistoryVO, DtoSearchSuggestionsVO, DtoCourseVO, DtoProposalVO } from "@/api/data-contracts";

// Search result item types
export type SuggestItem = DtoSearchSuggestionsVO;

export type HistoryItem = DtoSearchHistoryVO;

// Hot recommendation item
export interface HotRecommendation {
  keyword: string;
  tag: string;
}

// MixedResult - unified result type for course/teacher/proposal search
export type ResultType = 'course' | 'teacher' | 'proposal';

export type MixedResult = DtoCourseVO & {
  resultType?: ResultType;
  matchScore?: number;
  depart?: string;
  position?: string;
  avatar?: string;
  category?: string;
  department?: string;
  link?: string[][];
  point?: number;
  describe?: string;
  teachers?: string[];
  teacherList?: DtoCourseVO['teachers'];
  campuses?: string[];
  tagCount?: Record<string, number>;
  reason?: string;
  agreeCount?: number;
  campus?: string;
  title?: string;
};

// Click handler parameter types
export interface ClickProposalItem extends DtoProposalVO {
  resultType?: 'proposal';
}

export interface ClickCourseItem extends DtoCourseVO {
  resultType?: 'course' | 'teacher';
}

export type ClickResultItem = MixedResult | ClickProposalItem;

// Suggestion click item (from fuzzy search)
export type SuggestClickItem = SuggestItem & { name: string };

// Grouped results for display
export interface GroupedRows {
  courses: MixedResult[];
  proposals: MixedResult[];
}