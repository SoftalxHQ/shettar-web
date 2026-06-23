'use client';

import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Button, Form, Modal, Dropdown } from 'react-bootstrap';
import {
  BsHandThumbsUp,
  BsHandThumbsDown,
  BsCheckCircleFill,
  BsChevronDown,
  BsChevronUp,
  BsPinAngleFill,
  BsThreeDotsVertical,
  BsTrash,
  BsSend,
  BsPencilSquare,
} from 'react-icons/bs';
import {
  reviewComments,
  childComments,
  replyToAuthorName,
  isOwnGuestComment,
  isCommentDeletable,
  isCommentEditable,
  canReplyToThread,
  replyParentId,
  commentBodyDisplay,
  commentInitials,
  formatCommentTime,
  displayAuthorName,
  countReplyTree,
  reviewCollapseKey,
  ROOT_AVATAR,
  NESTED_AVATAR,
  AVATAR_GAP,
  NEST_INDENT_PX,
  type ReviewComment,
  type ReviewWithThread,
} from '@/app/helpers/review-thread';

type Props = {
  review: ReviewWithThread & { id: number };
  accountId?: number | null;
  isAuthenticated?: boolean;
  showThread?: boolean;
  /** When set, the review itself is the thread anchor — reply + hide-replies apply to all comments below. */
  reviewRoot?: { reviewId: number };
  onReply: (reviewId: number, body: string, parentId?: number | null) => Promise<void>;
  onUpdateComment: (reviewId: number, commentId: number, body: string) => Promise<void>;
  onDeleteComment: (reviewId: number, commentId: number) => Promise<void>;
  onVoteComment?: (reviewId: number, commentId: number, value: 1 | -1) => Promise<void>;
  readOnlyVotes?: boolean;
};

type SharedHandlers = {
  reviewId: number;
  allComments: ReviewComment[];
  accountId?: number | null;
  isAuthenticated: boolean;
  canReply: boolean;
  openReplyKey: string | null;
  replyDrafts: Record<string, string>;
  replyingKey: string | null;
  editingCommentId: number | null;
  editDrafts: Record<number, string>;
  savingCommentId: number | null;
  replyKey: (parentId: number | null) => string;
  onToggleReply: (parentId: number | null) => void;
  onSubmitReply: () => void;
  onSaveEdit: (commentId: number) => void;
  onStartEdit: (commentId: number, body: string) => void;
  onCancelEdit: () => void;
  onDelete: (commentId: number) => void;
  onEditDraftChange: (commentId: number, value: string) => void;
  onReplyDraftChange: (key: string, value: string) => void;
  onVoteComment?: (reviewId: number, commentId: number, value: 1 | -1) => Promise<void>;
  votingCommentId: number | null;
  readOnlyVotes: boolean;
  businessName: string;
  isPinned?: boolean;
};

function ReplyComposer({
  value,
  onChange,
  onSubmit,
  submitting,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  submitting: boolean;
}) {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="d-flex gap-2 align-items-start mt-2 mb-2">
      <div className="rounded-circle bg-secondary bg-opacity-10 flex-shrink-0" style={{ width: NESTED_AVATAR, height: NESTED_AVATAR }} />
      <div className="flex-grow-1 d-flex gap-2 align-items-end">
        <Form.Control
          ref={inputRef}
          as="textarea"
          rows={2}
          placeholder="Add a reply..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="small"
        />
        <Button
          size="sm"
          variant="primary"
          className="d-flex align-items-center justify-content-center p-0 flex-shrink-0"
          style={{ width: 32, height: 32 }}
          onClick={onSubmit}
          disabled={submitting}
          aria-label="Send reply"
        >
          {submitting ? <span className="spinner-border spinner-border-sm" role="status" /> : <BsSend size={14} />}
        </Button>
      </div>
    </div>
  );
}

function CommentAvatar({
  name,
  avatarUrl,
  isBusiness,
  size,
}: {
  name: string;
  avatarUrl?: string | null;
  isBusiness: boolean;
  size: number;
}) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt=""
        className="rounded-circle flex-shrink-0 object-fit-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 fw-semibold ${
        isBusiness ? 'bg-dark text-white' : 'bg-secondary bg-opacity-25 text-secondary'
      }`}
      style={{ width: size, height: size, fontSize: size <= NESTED_AVATAR ? 10 : 13 }}
    >
      {commentInitials(name)}
    </div>
  );
}

function ReplyToBadge({ name }: { name: string }) {
  return (
    <span className="me-1 fw-normal" style={{ fontSize: 14, color: 'var(--yt-link-color, #065fd4)' }}>
      @{displayAuthorName(name)}
    </span>
  );
}

function OwnerBadge({ name }: { name: string }) {
  const label = displayAuthorName(name);
  if (!label) return null;

  return (
    <span
      className="d-inline-flex align-items-center gap-1 rounded-pill px-2 py-0.5 fw-bold bg-secondary bg-opacity-25 text-body-emphasis border border-secondary border-opacity-25"
      style={{ fontSize: 13 }}
    >
      {label}
      <BsCheckCircleFill size={11} className="text-primary" />
    </span>
  );
}

function CommentContent({
  comment,
  isRoot,
  handlers,
}: {
  comment: ReviewComment;
  isRoot: boolean;
  handlers: SharedHandlers;
}) {
  const {
    allComments,
    accountId,
    isAuthenticated,
    canReply,
    openReplyKey,
    replyDrafts,
    replyingKey,
    editingCommentId,
    editDrafts,
    savingCommentId,
    replyKey,
    onToggleReply,
    onSubmitReply,
    onSaveEdit,
    onStartEdit,
    onCancelEdit,
    onDelete,
    onEditDraftChange,
    onReplyDraftChange,
    onVoteComment,
    votingCommentId,
    readOnlyVotes,
    businessName,
    isPinned,
    reviewId,
  } = handlers;

  const isBusiness = comment.author_role === 'business';
  const isEditing = editingCommentId === comment.id;
  const parentId = replyParentId(comment);
  const replyToName = replyToAuthorName(allComments, comment);
  const timeLabel = formatCommentTime(comment.created_at);
  const bodyText = commentBodyDisplay(comment.body, replyToName);
  const composerKey = replyKey(parentId);
  const showComposer = isAuthenticated && canReply && openReplyKey === composerKey;
  const showDropdown =
    isOwnGuestComment(comment, accountId) &&
    (isCommentEditable(comment) || isCommentDeletable(comment));
  const likesCount = comment.likes_count ?? 0;
  const dislikesCount = comment.dislikes_count ?? 0;
  const userVote = comment.user_vote ?? null;
  const canVote =
    !readOnlyVotes &&
    isAuthenticated &&
    Boolean(onVoteComment);
  const isVoting = votingCommentId === comment.id;

  const handleVote = async (value: 1 | -1) => {
    if (!canVote || !onVoteComment || isVoting) return;
    try {
      await onVoteComment(reviewId, comment.id, value);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save vote');
    }
  };

  return (
    <div className="flex-grow-1 min-width-0 position-relative pb-1">
      {isPinned && businessName && (
        <div className="d-flex align-items-center gap-1 text-muted mb-1" style={{ fontSize: 12, fontWeight: 500 }}>
          <BsPinAngleFill size={13} className="opacity-75" />
          <span>Pinned by {displayAuthorName(businessName)}</span>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-start mb-1 pe-4">
        <div className="d-flex align-items-center gap-2 flex-wrap">
          {isBusiness && displayAuthorName(comment.author_name) ? (
            <OwnerBadge name={comment.author_name} />
          ) : (
            <span className="fw-semibold text-body" style={{ fontSize: 13 }}>
              {displayAuthorName(comment.author_name)}
            </span>
          )}
          {timeLabel && <span className="text-muted" style={{ fontSize: 12 }}>{timeLabel}</span>}
        </div>
        {showDropdown && (
          <Dropdown align="end" className="position-absolute end-0 top-0">
            <Dropdown.Toggle as="button" className="btn btn-link btn-sm p-1 text-muted border-0 bg-transparent no-caret">
              <BsThreeDotsVertical size={16} />
            </Dropdown.Toggle>
            <Dropdown.Menu className="shadow border-0 py-1" style={{ fontSize: 13, minWidth: '7.5rem' }}>
              {isCommentEditable(comment) && (
                <Dropdown.Item onClick={() => onStartEdit(comment.id, comment.body)} className="d-flex align-items-center gap-2 py-2">
                  <BsPencilSquare size={14} />
                  Edit
                </Dropdown.Item>
              )}
              {isCommentDeletable(comment) && (
                <Dropdown.Item className="text-danger d-flex align-items-center gap-2 py-2" onClick={() => onDelete(comment.id)}>
                  <BsTrash size={14} />
                  Delete
                </Dropdown.Item>
              )}
            </Dropdown.Menu>
          </Dropdown>
        )}
      </div>

      {isEditing ? (
        <div className="d-flex flex-column gap-2 mb-2">
          <Form.Control
            as="textarea"
            rows={2}
            value={editDrafts[comment.id] || ''}
            onChange={(e) => onEditDraftChange(comment.id, e.target.value)}
            className="small"
          />
          <div className="d-flex gap-2">
            <Button size="sm" variant="primary" disabled={savingCommentId === comment.id} onClick={() => onSaveEdit(comment.id)}>
              Save
            </Button>
            <Button size="sm" variant="light" onClick={onCancelEdit}>Cancel</Button>
          </div>
        </div>
      ) : (
        <p className="mb-2" style={{ fontSize: 14, lineHeight: '20px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {replyToName && !isRoot && <ReplyToBadge name={replyToName} />}
          {bodyText}
        </p>
      )}

      {!isEditing && (canVote || readOnlyVotes || likesCount > 0 || dislikesCount > 0 || (isAuthenticated && canReply)) && (
        <div className="d-flex align-items-center gap-1 mb-1">
          {(canVote || readOnlyVotes || likesCount > 0) && (
            <button
              type="button"
              className={`btn btn-link btn-sm p-1 rounded-circle d-inline-flex align-items-center gap-1 ${
                userVote === 1 ? 'text-primary' : 'text-muted'
              }`}
              aria-label="Like"
              style={{ height: 32 }}
              disabled={!canVote || isVoting}
              onClick={() => handleVote(1)}
            >
              <BsHandThumbsUp size={14} />
              {likesCount > 0 && <span style={{ fontSize: 12, fontWeight: 600 }}>{likesCount}</span>}
            </button>
          )}
          {(canVote || readOnlyVotes || dislikesCount > 0) && (
            <button
              type="button"
              className={`btn btn-link btn-sm p-1 rounded-circle d-inline-flex align-items-center gap-1 ${
                userVote === -1 ? 'text-primary' : 'text-muted'
              }`}
              aria-label="Dislike"
              style={{ height: 32 }}
              disabled={!canVote || isVoting}
              onClick={() => handleVote(-1)}
            >
              <BsHandThumbsDown size={14} />
              {dislikesCount > 0 && <span style={{ fontSize: 12, fontWeight: 600 }}>{dislikesCount}</span>}
            </button>
          )}
          {isAuthenticated && canReply && (
            <button
              type="button"
              className="btn btn-link btn-sm px-3 py-1 text-muted text-decoration-none fw-bold"
              style={{ fontSize: 12 }}
              onClick={() => onToggleReply(parentId)}
            >
              Reply
            </button>
          )}
        </div>
      )}

      {showComposer && (
        <ReplyComposer
          value={replyDrafts[composerKey] || ''}
          onChange={(v) => onReplyDraftChange(composerKey, v)}
          onSubmit={onSubmitReply}
          submitting={replyingKey === composerKey}
        />
      )}
    </div>
  );
}

/** Recursive nested thread — each depth indents further based on parent_id. */
function CommentNode({
  comment,
  depth,
  handlers,
  collapsedIds,
  onToggleCollapse,
}: {
  comment: ReviewComment;
  depth: number;
  handlers: SharedHandlers;
  collapsedIds: Set<number>;
  onToggleCollapse: (id: number) => void;
}) {
  const { allComments, businessName } = handlers;
  const children = childComments(allComments, comment.id);
  const hasReplies = children.length > 0;
  const collapsed = collapsedIds.has(comment.id);
  const replyCount = countReplyTree(allComments, comment.id);
  const isBusiness = comment.author_role === 'business';
  const isPinned = depth === 0 && comment.id === allComments[0]?.id && comment.author_role === 'business';
  const avatarSize = depth === 0 ? ROOT_AVATAR : NESTED_AVATAR;
  const indent = depth * NEST_INDENT_PX;

  return (
    <div style={{ marginBottom: depth === 0 ? 16 : 10 }}>
      <div className="d-flex align-items-start" style={{ marginLeft: indent }}>
        <div className="flex-shrink-0" style={{ width: avatarSize, marginRight: AVATAR_GAP }}>
          <CommentAvatar
            name={comment.author_name}
            avatarUrl={comment.author_avatar_url}
            isBusiness={isBusiness}
            size={avatarSize}
          />
        </div>
        <CommentContent
          comment={comment}
          isRoot={depth === 0}
          handlers={{ ...handlers, isPinned, businessName }}
        />
      </div>

      {hasReplies && !collapsed &&
        children.map((child) => (
          <CommentNode
            key={child.id}
            comment={child}
            depth={depth + 1}
            handlers={handlers}
            collapsedIds={collapsedIds}
            onToggleCollapse={onToggleCollapse}
          />
        ))}

      {hasReplies && (
        <button
          type="button"
          className="btn btn-link btn-sm p-0 text-decoration-none fw-bold d-inline-flex align-items-center gap-2 mt-1"
          style={{ fontSize: 13, color: 'var(--yt-link-color, #065fd4)', marginLeft: indent + avatarSize + AVATAR_GAP }}
          onClick={() => onToggleCollapse(comment.id)}
        >
          {collapsed ? (
            <>
              <BsChevronDown size={14} />
              <span>{replyCount} {replyCount === 1 ? 'reply' : 'replies'}</span>
            </>
          ) : (
            <>
              <BsChevronUp size={14} />
              <span>Hide replies</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}

export default function ReviewCommentThread({
  review,
  accountId,
  isAuthenticated = false,
  showThread = true,
  reviewRoot,
  onReply,
  onUpdateComment,
  onDeleteComment,
  onVoteComment,
  readOnlyVotes = false,
}: Props) {
  const [openReplyKey, setOpenReplyKey] = useState<string | null>(null);
  const [replyParentIdState, setReplyParentIdState] = useState<number | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [replyingKey, setReplyingKey] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editDrafts, setEditDrafts] = useState<Record<number, string>>({});
  const [savingCommentId, setSavingCommentId] = useState<number | null>(null);
  const [votingCommentId, setVotingCommentId] = useState<number | null>(null);
  const [deleteCommentId, setDeleteCommentId] = useState<number | null>(null);
  const [isDeletingComment, setIsDeletingComment] = useState(false);
  const [collapsedIds, setCollapsedIds] = useState<Set<number>>(new Set());

  if (!showThread) return null;

  const allComments = reviewComments(review);
  const roots = childComments(allComments, null);
  if (!roots.length && !reviewRoot) return null;

  const replyKey = (parentId: number | null) => `${review.id}-${parentId ?? 'root'}`;

  const useReviewAnchor = Boolean(reviewRoot);
  const reviewCollapsed = useReviewAnchor && collapsedIds.has(reviewCollapseKey(reviewRoot!.reviewId));
  const totalReplies = allComments.filter((c) => c.id > 0).length;
  const reviewComposerKey = replyKey(null);
  const canReply = canReplyToThread(review);
  const showReviewComposer = useReviewAnchor && isAuthenticated && canReply && openReplyKey === reviewComposerKey;

  const businessComment = allComments.find((c) => c.author_role === 'business');
  const businessName = businessComment?.author_name || review.admin_reply_by || '';

  const toggleReply = (parentId: number | null) => {
    const key = replyKey(parentId);
    setOpenReplyKey((prev) => (prev === key ? null : key));
    setReplyParentIdState(parentId);
  };

  const toggleCollapse = (id: number) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const submitReply = async () => {
    const key = openReplyKey;
    if (!key) return;
    const body = (replyDrafts[key] || '').trim();
    if (!body) return;
    setReplyingKey(key);
    try {
      await onReply(review.id, body, replyParentIdState);
      setReplyDrafts((prev) => ({ ...prev, [key]: '' }));
      setOpenReplyKey(null);
      setReplyParentIdState(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to post reply');
    } finally {
      setReplyingKey(null);
    }
  };

  const saveEdit = async (commentId: number) => {
    const body = (editDrafts[commentId] || '').trim();
    if (!body) return;
    setSavingCommentId(commentId);
    try {
      await onUpdateComment(review.id, commentId, body);
      setEditingCommentId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update reply');
    } finally {
      setSavingCommentId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteCommentId) return;
    setIsDeletingComment(true);
    try {
      await onDeleteComment(review.id, deleteCommentId);
      setDeleteCommentId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete reply');
    } finally {
      setIsDeletingComment(false);
    }
  };

  const handleVoteComment = async (reviewId: number, commentId: number, value: 1 | -1) => {
    if (!onVoteComment) return;
    setVotingCommentId(commentId);
    try {
      await onVoteComment(reviewId, commentId, value);
    } finally {
      setVotingCommentId(null);
    }
  };

  const handlers: SharedHandlers = {
    reviewId: review.id,
    allComments,
    accountId,
    isAuthenticated,
    canReply,
    openReplyKey,
    replyDrafts,
    replyingKey,
    editingCommentId,
    editDrafts,
    savingCommentId,
    replyKey,
    onToggleReply: toggleReply,
    onSubmitReply: submitReply,
    onSaveEdit: saveEdit,
    onStartEdit: (id, body) => {
      setEditingCommentId(id);
      setEditDrafts((prev) => ({ ...prev, [id]: body }));
    },
    onCancelEdit: () => setEditingCommentId(null),
    onDelete: setDeleteCommentId,
    onEditDraftChange: (id, value) => setEditDrafts((prev) => ({ ...prev, [id]: value })),
    onReplyDraftChange: (key, value) => setReplyDrafts((prev) => ({ ...prev, [key]: value })),
    onVoteComment: onVoteComment ? handleVoteComment : undefined,
    votingCommentId,
    readOnlyVotes,
    businessName,
  };

  return (
    <>
      <div className="mt-3 mb-2">
        {useReviewAnchor && isAuthenticated && canReply && (
          <div className="d-flex align-items-center gap-1 mb-2">
            <button
              type="button"
              className="btn btn-link btn-sm px-3 py-1 text-muted text-decoration-none fw-bold"
              style={{ fontSize: 12 }}
              onClick={() => toggleReply(null)}
            >
              Reply
            </button>
          </div>
        )}

        {showReviewComposer && (
          <ReplyComposer
            value={replyDrafts[reviewComposerKey] || ''}
            onChange={(v) => handlers.onReplyDraftChange(reviewComposerKey, v)}
            onSubmit={submitReply}
            submitting={replyingKey === reviewComposerKey}
          />
        )}

        {!reviewCollapsed &&
          roots.map((comment) => (
            <CommentNode
              key={comment.id}
              comment={comment}
              depth={0}
              handlers={handlers}
              collapsedIds={collapsedIds}
              onToggleCollapse={toggleCollapse}
            />
          ))}

        {useReviewAnchor && totalReplies > 0 && (
          <button
            type="button"
            className="btn btn-link btn-sm p-0 text-decoration-none fw-bold d-inline-flex align-items-center gap-2 mt-1"
            style={{ fontSize: 13, color: 'var(--yt-link-color, #065fd4)' }}
            onClick={() => toggleCollapse(reviewCollapseKey(reviewRoot!.reviewId))}
          >
            {reviewCollapsed ? (
              <>
                <BsChevronDown size={14} />
                <span>{totalReplies} {totalReplies === 1 ? 'reply' : 'replies'}</span>
              </>
            ) : (
              <>
                <BsChevronUp size={14} />
                <span>Hide replies</span>
              </>
            )}
          </button>
        )}
      </div>

      <Modal show={deleteCommentId !== null} onHide={() => !isDeletingComment && setDeleteCommentId(null)} centered>
        <Modal.Header closeButton className="border-0 pb-0" />
        <Modal.Body className="text-center pb-4 px-4">
          <div className="bg-danger bg-opacity-10 text-danger rounded-circle mx-auto d-flex align-items-center justify-content-center mb-3" style={{ width: 64, height: 64 }}>
            <BsTrash className="fs-3" />
          </div>
          <h4 className="mb-2">Delete this reply?</h4>
          <p className="text-secondary mb-0">
            Are you sure you want to delete this reply? Replies can only be removed within 24 hours of posting.
          </p>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 justify-content-center pb-4">
          <Button variant="light" onClick={() => setDeleteCommentId(null)} disabled={isDeletingComment}>Keep Reply</Button>
          <Button variant="danger" onClick={confirmDelete} disabled={isDeletingComment}>
            {isDeletingComment ? 'Deleting...' : 'Yes, delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
