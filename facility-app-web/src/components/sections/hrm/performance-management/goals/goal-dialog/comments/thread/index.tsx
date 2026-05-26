import { useState } from 'react';
import { Box, Collapse } from '@mui/material';
import { type CommentItem as CommentItemData } from 'data/hrm/performance-management/goals';
import ReplyThread from './ReplyThread';
import ThreadConnector from './ThreadConnector';
import ThreadInput from './ThreadInput';
import ContentBlock from './content-block';

const CommentThread = ({ comments }: { comments: CommentItemData[] }) => {
  return (
    <>
      <Box sx={{ position: 'relative' }}>
        {comments.map((comment, index) => {
          const isLast = index === comments.length - 1;
          return <CommentThreadItem key={comment.id} comment={comment} isLast={isLast} />;
        })}
      </Box>
    </>
  );
};

const CommentThreadItem = ({ comment, isLast }: { comment: CommentItemData; isLast: boolean }) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const toggleReply = () => setShowReplyInput((prev) => !prev);

  return (
    <div>
      <Box sx={{ position: 'relative' }}>
        {comment.replies.length > 0 && (
          <>
            {((comment.replies && comment.replies.length > 0) || showReplyInput) && (
              <ThreadConnector offsetLeft={16} sx={{ height: 'calc(100% - 56px)', bottom: 0 }} />
            )}
          </>
        )}
        <ContentBlock content={comment} toggleThreadInput={toggleReply} />
      </Box>

      <Collapse in={showReplyInput} mountOnEnter unmountOnExit>
        <Box sx={{ position: 'relative', pl: 5 }}>
          {comment.replies.length > 0 && <ThreadConnector offsetLeft={16} />}
          <ThreadInput placeholder="Reply to this comment..." toggleThreadInput={toggleReply} />
        </Box>
      </Collapse>

      <ReplyThread
        replies={comment.replies ?? []}
        isLastComment={isLast}
        toggleThreadInput={toggleReply}
      />
    </div>
  );
};

export default CommentThread;
