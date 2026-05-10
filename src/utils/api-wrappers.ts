/**
 * API wrapper utilities for type-safe API calls
 * Addresses issues in generated API clients (which are gitignored and auto-generated):
 *
 * Issues addressed:
 * 1. proposalDetail has misleading first 'id' param that's ignored
 *    - Path uses only proposalId, so id is dead
 *    - Original: proposalDetail(id: string, proposalId: string, params?)
 *    - Fixed: pass only proposalId (id is silently ignored by backend anyway)
 *
 * 2. proposalFilterList uses string for page/pageSize, inconsistent with other APIs
 *    - Original: page: string, pageSize: string
 *    - Fixed: use number type
 *
 * 3. likeCreate parameter semantics unclear
 *    - likeId is TARGET entity ID (proposal/comment), NOT a "like record ID"
 */

// Import constants
import { PROPOSAL_PAGE_SIZE_DEFAULT } from './constants';

/**
 * Target types for like operation
 * Clarifies that targetType '1' = proposal, '2' = comment
 */
export const LIKE_TARGET = {
  PROPOSAL: '1',
  COMMENT: '2'
} as const;
export type LikeTargetType = typeof LIKE_TARGET[keyof typeof LIKE_TARGET];

/**
 * Creates properly typed like request body
 * @param targetId - The target entity ID (proposal or comment ID), NOT a like record ID
 * @param targetType - '1' for proposal, '2' for comment (use LIKE_TARGET constants)
 */
export function createLikeRequest(
  targetId: string,
  targetType: LikeTargetType
): { likeId: string; targetType: string } {
  return { likeId: targetId, targetType };
}

/**
 * Creates properly typed proposal filter params
 * Fixes string -> number type issue for page/pageSize
 */
export interface ProposalFilterParams {
  status: string;
  campus: string;
  page: number;
  pageSize: number;
}

export function createProposalFilterParams(
  status: string,
  campus: string,
  page: number,
  pageSize: number = PROPOSAL_PAGE_SIZE_DEFAULT
): ProposalFilterParams {
  return { status, campus, page, pageSize };
}

/**
 * API endpoint paths as constants (for documentation and consistency)
 */
export const API_PATHS = {
  PROPOSAL_DETAIL: (id: string) => `/api/proposal/${id}`,
  PROPOSAL_SUGGEST: '/api/proposal/suggest',
  SEARCH: '/api/search',
  SEARCH_SUGGEST: '/api/search/suggest',
  SEARCH_RECENT: '/api/search/recent',
} as const;