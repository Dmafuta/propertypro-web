'use client';

import { ReactNode } from 'react';
import { Paper } from '@mui/material';
import { conversations } from 'data/chat';
import { useNavContext } from 'layouts/main-layout/NavProvider';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import ChatProvider from 'providers/ChatProvider';
import ChatSidebar from 'components/sections/chat/sidebar/ChatSidebar';

const ChatLayout = ({ children }: { children: ReactNode }) => {
  const { topbarHeight } = useNavContext();
  const { up } = useBreakpoints();
  const upSm = up('sm');

  return (
    <ChatProvider conversations={conversations}>
      <Paper
        sx={({ mixins }) => ({
          display: 'flex',
          height: mixins.contentHeight(
            topbarHeight,
            (upSm ? mixins.footer.sm : mixins.footer.xs) + 1,
          ),
        })}
      >
        <ChatSidebar />

        {children}
      </Paper>
    </ChatProvider>
  );
};

export default ChatLayout;
