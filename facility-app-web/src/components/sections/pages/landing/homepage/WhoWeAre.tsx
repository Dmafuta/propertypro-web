import Box from '@mui/material/Box';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';
import bg from 'assets/images/background/2.webp';
import { cssVarRgba } from 'lib/utils';
import RevealItems from '../common/RevealItems';

const backgroundImageSrc = typeof bg === 'string' ? bg : bg.src;

const WhoWeAre = () => {
  return (
    <Box sx={{ pt: 5, pb: { xs: 5, sm: 8 } }}>
      <Box
        sx={{
          position: 'relative',
          width: 1,
          py: 12,
          px: { xs: 3, md: 5 },
          zIndex: 1,

          '&:after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            pointerEvents: 'none',
            background: ({ vars }) => `url(${backgroundImageSrc}) no-repeat, linear-gradient(
              to top,
              ${cssVarRgba(vars.palette.background.defaultChannel, 1)} -330.11%,
              ${cssVarRgba(vars.palette.background.defaultChannel, 0.9)} 85.3%,
              ${cssVarRgba(vars.palette.background.defaultChannel, 0.5)} 158.61%
            )`,
            backgroundPositionX: '50%',
            backgroundPositionY: '50%',
            backgroundBlendMode: 'overlay',
            filter: 'opacity(1) grayscale(0.5)',
            zoom: 0.675,
          },
        }}
      >
        <RevealItems
          component={Box}
          sx={{
            position: 'relative',
            zIndex: 1,
            textAlign: 'center',
            width: 1,
          }}
        >
          <Typography
            component="p"
            variant="overline"
            sx={{ fontWeight: 700, mb: 3, color: 'text.secondary' }}
          >
            Who are we
          </Typography>

          <Typography
            variant="h6"
            sx={{
              fontWeight: 500,
              mb: 0.5,
            }}
          >
            We are a team of professionals with an aim to
          </Typography>

          <Typography
            variant="h2"
            sx={{
              fontStyle: 'italic',
              color: 'primary.main',
            }}
          >
            make your life faster{' '}
            <Box
              component="span"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexWrap: 'nowrap',
                gap: 1,
              }}
            >
              <SvgIcon
                width="29"
                height="19"
                viewBox="0 0 29 19"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M5.5 6H17.5" stroke="#3385F0" strokeWidth="2" strokeLinecap="round" />
                <path d="M3.75 12H27.75" stroke="#3385F0" strokeWidth="2" strokeLinecap="round" />
                <path d="M1.5 18H20.5" stroke="#3385F0" strokeWidth="2" strokeLinecap="round" />
              </SvgIcon>
            </Box>
          </Typography>
        </RevealItems>
      </Box>
    </Box>
  );
};

export default WhoWeAre;
