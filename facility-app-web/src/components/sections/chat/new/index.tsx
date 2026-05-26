'use client';

import { useState } from 'react';
import { Paper } from '@mui/material';
import { User } from 'types/users';
import ContentFooter from 'components/sections/chat/conversation/main/content-footer/ContentFooter';
import NewChatHeader from 'components/sections/chat/new/NewChatHeader';

const NewChat = () => {
  const [selectedRecipients, setSelectedRecipients] = useState<User[]>([]);

  const handleRecipientsChange = (recipients: User[]) => {
    setSelectedRecipients(recipients);
  };

  return (
    <Paper
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: 1,
        width: 1,
        position: 'relative',
      }}
    >
      <NewChatHeader
        selectedRecipients={selectedRecipients}
        onRecipientsChange={handleRecipientsChange}
      />
      <ContentFooter recipients={selectedRecipients} />
    </Paper>
  );
};

export default NewChat;
