import { Avatar, Link, Stack } from '@mui/material';
import { CommentItem } from 'data/hrm/performance-management/goals';
import Actions from './Actions';
import Attachments from './Attachments';
import AuthorInfo from './AuthorInfo';
import TextContent from './TextContent';

interface ContentBlockProps {
  content: CommentItem;
  toggleThreadInput: () => void;
}

const ContentBlock = ({ content, toggleThreadInput }: ContentBlockProps) => {
  return (
    <Stack direction="row" sx={{ gap: 2, pb: 2, pt: 1, alignItems: 'flex-start' }}>
      <Avatar
        component={Link}
        href="#!"
        src={content.author.avatar}
        alt="content-author-avatar"
        sx={{
          width: 32,
          height: 32,
          color: 'unset',
        }}
      />

      <Stack sx={{ minWidth: 0 }}>
        <Stack sx={{ gap: 1 }}>
          <AuthorInfo author={content.author.name} createdAt={content.createdAt} />

          {content.message.text && <TextContent content={content.message.text} />}
          {content.message.attachments && (
            <Attachments
              attachments={content.message.attachments}
              sx={{
                '& img, & video': {
                  width: 1,
                  height: 1,
                  objectFit: 'cover',
                  aspectRatio: 1,
                },
              }}
            />
          )}

          <Actions engagement={content.engagement} toggleThreadInput={toggleThreadInput} />
        </Stack>
      </Stack>
    </Stack>
  );
};

export default ContentBlock;
