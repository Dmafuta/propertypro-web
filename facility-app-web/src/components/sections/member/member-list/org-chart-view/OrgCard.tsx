import { Avatar, ButtonBase, ButtonBaseProps, Stack, Typography, styled } from '@mui/material';
import { MemberData } from 'data/member/member-list';

interface OrgCardProps {
  data: MemberData;
}

const OrgCard = ({ data }: OrgCardProps) => {
  return (
    <OrgCardWrapper>
      <Stack direction="row" sx={{ gap: 2, alignItems: 'center' }}>
        <Avatar src={data.avatar} sx={{ width: 56, height: 56 }} />
        <Stack sx={{ alignItems: 'flex-start' }}>
          <Typography
            variant="caption"
            sx={{ fontWeight: 500, color: 'text.disabled', textWrap: 'nowrap' }}
          >
            {data.idNo}
          </Typography>
          <Stack sx={{ alignItems: 'flex-start' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, textWrap: 'nowrap' }}>
              {data.name}
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 300, textWrap: 'nowrap' }}>
              {data.jobTitle}
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </OrgCardWrapper>
  );
};

const OrgCardWrapper = styled((props: ButtonBaseProps) => (
  <ButtonBase component="div" {...props} />
))(({ theme }) => ({
  outline: 0,
  position: 'relative',
  borderRadius: Number(theme.shape.borderRadius) * 6,
  padding: theme.spacing(2),
  display: 'inline-flex',
  backgroundColor: theme.vars.palette.background.elevation2,
  cursor: 'pointer',
  transition: theme.transitions.create(['background-color'], {
    duration: theme.transitions.duration.enteringScreen,
    easing: theme.transitions.easing.easeInOut,
  }),
  '&:hover': {
    backgroundColor: theme.vars.palette.background.elevation3,
  },
  ...(theme.direction === 'rtl' && { direction: 'ltr' }),
}));

export default OrgCard;
