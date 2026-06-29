export type ReviewComment = {
  id: number;
  body: string;
  author_name: string;
  author_role: 'guest' | 'business';
  author_type?: string | null;
  author_id?: number | null;
  author_avatar_url?: string | null;
  parent_id?: number | null;
  created_at?: string;
  updated_at?: string;
  deletable?: boolean;
  editable?: boolean;
  likes_count?: number;
  dislikes_count?: number;
  user_vote?: 1 | -1 | null;
};

export type NestedReviewComment = ReviewComment & {
  depth: number;
  isLastSibling: boolean;
  /** Per ancestor gutter: draw a vertical continuation line when true. */
  threadLines: boolean[];
};

export type ReviewWithThread = {
  id?: number;
  comments?: ReviewComment[];
  admin_reply?: string | null;
  admin_reply_by?: string | null;
};

export const REVIEW_PREVIEW_MAX_CHARS = 220;
export const NEST_INDENT_PX = 28;
export const ROOT_AVATAR = 40;
export const NESTED_AVATAR = 32;
export const AVATAR_GAP = 12;

/** @deprecated YouTube-style constants — kept for any legacy references */
export const YT_ROOT_AVATAR = ROOT_AVATAR;
export const YT_REPLY_AVATAR = NESTED_AVATAR;
export const YT_GAP = AVATAR_GAP;
export const YT_REPLY_ROW_GAP = 12;
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

/** Normalize parent_id from API (number | string | null). */
export function normalizeParentId(parentId: number | string | null | undefined): number | null {
  if (parentId == null || parentId === '') return null;
  const n = Number(parentId);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function normalizeCommentId(id: number | string): number {
  return Number(id);
}

export function reviewComments(review: ReviewWithThread): ReviewComment[] {
  const fromApi = review.comments ?? [];
  if (fromApi.length) return fromApi;

  if (review.admin_reply) {
    return [{
      id: -1,
      body: review.admin_reply,
      author_name: review.admin_reply_by || '',
      author_role: 'business',
      parent_id: null,
    }];
  }
  return [];
}

/** Drop comments whose parent (or ancestor) is missing — e.g. after a parent delete on the client. */
export function visibleReviewComments(comments: ReviewComment[]): ReviewComment[] {
  const ids = new Set(comments.map((c) => normalizeCommentId(c.id)));
  return comments.filter((comment) => {
    let parentId = normalizeParentId(comment.parent_id);
    while (parentId) {
      if (!ids.has(parentId)) return false;
      const parent = comments.find((c) => normalizeCommentId(c.id) === parentId);
      parentId = parent ? normalizeParentId(parent.parent_id) : null;
    }
    return true;
  });
}

/** Remove a comment and any descendants (matches server dependent: :destroy). */
export function commentsAfterRemoval(comments: ReviewComment[], removedId: number): ReviewComment[] {
  const ids = new Set<number>([removedId]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const comment of comments) {
      if (comment.parent_id && ids.has(comment.parent_id) && !ids.has(comment.id)) {
        ids.add(comment.id);
        changed = true;
      }
    }
  }
  return comments.filter((c) => !ids.has(c.id));
}

export function nestedReviewComments(review: ReviewWithThread): NestedReviewComment[] {
  const comments = visibleReviewComments(reviewComments(review));
  const byParent = new Map<number | null, ReviewComment[]>();

  for (const comment of comments) {
    const parentKey = comment.parent_id && comment.parent_id > 0 ? comment.parent_id : null;
    const group = byParent.get(parentKey) ?? [];
    group.push(comment);
    byParent.set(parentKey, group);
  }

  for (const group of byParent.values()) {
    group.sort((a, b) => {
      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
      return aTime - bTime;
    });
  }

  const ordered: NestedReviewComment[] = [];
  const walk = (parentId: number | null, depth: number, ancestorsLast: boolean[]) => {
    const children = byParent.get(parentId) ?? [];
    children.forEach((comment, index) => {
      const isLastSibling = index === children.length - 1;
      ordered.push({
        ...comment,
        depth,
        isLastSibling,
        threadLines: ancestorsLast.map((last) => !last),
      });
      if (comment.id > 0) walk(comment.id, depth + 1, [...ancestorsLast, isLastSibling]);
    });
  };

  walk(null, 1, []);
  return ordered;
}

export function shouldTruncateReview(content: string, maxChars = REVIEW_PREVIEW_MAX_CHARS): boolean {
  return content.trim().length > maxChars;
}

export function truncateReview(content: string, maxChars = REVIEW_PREVIEW_MAX_CHARS): string {
  const trimmed = content.trim();
  if (trimmed.length <= maxChars) return trimmed;
  return `${trimmed.slice(0, maxChars).trimEnd()}…`;
}

export function isRealComment(comment: ReviewComment): boolean {
  return comment.id > 0;
}

export function parseApiError(data: unknown, fallback: string): string {
  if (!data || typeof data !== 'object') return fallback;
  const payload = data as Record<string, unknown>;
  if (typeof payload.error === 'string') return payload.error;
  if (Array.isArray(payload.error)) {
    const first = payload.error[0];
    if (typeof first === 'string') return first;
    if (first && typeof first === 'object' && 'message' in first) {
      return String((first as { message: unknown }).message);
    }
  }
  if (typeof payload.message === 'string') return payload.message;
  if (Array.isArray(payload.errors) && payload.errors[0]) return String(payload.errors[0]);
  return fallback;
}

export function isCommentDeletable(comment: ReviewComment): boolean {
  if (!isRealComment(comment)) return false;
  if (typeof comment.deletable === 'boolean') return comment.deletable;
  if (!comment.created_at) return false;
  return Date.now() - new Date(comment.created_at).getTime() < TWENTY_FOUR_HOURS_MS;
}

export function isCommentEditable(comment: ReviewComment): boolean {
  if (!isRealComment(comment)) return false;
  if (typeof comment.editable === 'boolean') return comment.editable;
  return isCommentDeletable(comment);
}

export function isReviewDeletable(review: {
  deletable?: boolean;
  created_at?: string;
  date?: string;
}): boolean {
  if (typeof review.deletable === 'boolean') return review.deletable;
  const created = review.created_at ?? review.date;
  if (!created) return false;
  const ts = new Date(created).getTime();
  if (Number.isNaN(ts)) return false;
  return Date.now() - ts < TWENTY_FOUR_HOURS_MS;
}

export function isOwnGuestComment(comment: ReviewComment, accountId?: number | null): boolean {
  return comment.author_role === 'guest' &&
    comment.author_type === 'Account' &&
    accountId != null &&
    comment.author_id === accountId;
}

export function canReplyToThread(_review: ReviewWithThread, canReplyToReviews = false): boolean {
  return canReplyToReviews;
}

export function replyParentId(comment: ReviewComment): number | null {
  return isRealComment(comment) ? comment.id : null;
}

/** Strip HTML/markdown links — URLs stay visible as plain text (never hyperlinked). */
export function replyToAuthorName(comments: ReviewComment[], comment: ReviewComment): string | null {
  const parentId = normalizeParentId(comment.parent_id);
  if (!parentId) return null;
  return visibleReviewComments(comments).find((c) => normalizeCommentId(c.id) === parentId)?.author_name ?? null;
}

export function childComments(comments: ReviewComment[], parentId: number | null): ReviewComment[] {
  const visible = visibleReviewComments(comments);
  const normalizedParent = parentId != null && parentId > 0 ? parentId : null;
  return visible
    .filter((c) => normalizeParentId(c.parent_id) === normalizedParent)
    .sort((a, b) => {
      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
      return aTime - bTime;
    });
}

export function commentHasChildren(comments: ReviewComment[], commentId: number): boolean {
  return childComments(comments, commentId).length > 0;
}

export function authorHandle(name: string): string {
  const part = name.trim().split(/\s+/)[0] || 'user';
  return part.replace(/[^a-zA-Z0-9._-]/g, '') || 'user';
}

/** Full display name from API (e.g. "Festus D.") — not a shortened handle. */
export function displayAuthorName(name: string): string {
  const trimmed = name.trim();
  return trimmed || 'Guest';
}

/** Negative key so review-level collapse never collides with comment ids. */
export function reviewCollapseKey(reviewId: number): number {
  return -Math.abs(reviewId);
}

export function countReplyTree(comments: ReviewComment[], parentId: number): number {
  let count = 0;
  const walk = (pid: number) => {
    for (const child of childComments(comments, pid)) {
      count += 1;
      walk(normalizeCommentId(child.id));
    }
  };
  walk(parentId);
  return count;
}

/** @deprecated Flat list — use recursive childComments nesting in UI instead. */
export function flattenReplyThread(comments: ReviewComment[], rootId: number): ReviewComment[] {
  const ordered: ReviewComment[] = [];
  const walk = (pid: number) => {
    for (const child of childComments(comments, pid)) {
      ordered.push(child);
      walk(normalizeCommentId(child.id));
    }
  };
  walk(rootId);
  return ordered;
}

/** Strip a leading @mention when the reply-to pill already shows the parent name. */
export function commentBodyDisplay(text: string, replyToName: string | null): string {
  const plain = plainCommentBody(text);
  if (!replyToName) return plain;
  const handle = replyToName.trim().split(/\s+/)[0];
  if (!handle) return plain;
  const stripped = plain.replace(new RegExp(`^@${handle}\\S*\\s*`, 'i'), '').trim();
  return stripped || plain;
}

export function plainCommentBody(text: string): string {
  if (!text) return '';
  return text
    .replace(/<[^>]+>/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .trim();
}

export function commentInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'G';
  return parts.map((p) => p[0]).join('').toUpperCase().slice(0, 2);
}

export function formatCommentTime(created_at?: string): string | null {
  if (!created_at) return null;
  const diff = Date.now() - new Date(created_at).getTime();
  if (Number.isNaN(diff)) return null;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  const weeks = Math.floor(days / 7);
  if (days < 30) return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
  const months = Math.floor(days / 30);
  if (days < 365) return `${months} month${months === 1 ? '' : 's'} ago`;
  const years = Math.floor(days / 365);
  return `${years} year${years === 1 ? '' : 's'} ago`;
}
