'use client';

import { useGSAP } from '@gsap/react';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import DashedLine from '../common/DashedLine';
import { Dot } from '../common/PageHeader';
import RevealItems from '../common/RevealItems';
import { StripedBackground } from '../common/StripedBackground';

gsap.registerPlugin(SplitText);

const Hero = () => {
  const router = useRouter();
  const { up } = useBreakpoints();
  const slidesListRef = useRef<HTMLElement>(null);
  const [orgCode, setOrgCode] = useState('');
  const [error, setError] = useState('');

  const upLg = up('lg');
  const words = ['visitor access', 'resident services', 'parking', 'deliveries'];

  useGSAP(() => {
    const container = slidesListRef.current;
    if (!container) return;

    const slides = Array.from(container.children) as HTMLElement[];
    const tl = gsap.timeline({ repeat: -1 });

    const splitTexts = slides.map((slide, i) => {
      const split = new SplitText(slide, { type: 'chars' });
      gsap.set(split.chars, { y: i === 0 ? 0 : 53 });
      return split;
    });

    splitTexts.forEach((split, i) => {
      tl.to(container, { duration: 0.3, y: i * -53 }, i * 2)
        .fromTo(
          split.chars,
          { y: 53 },
          { duration: 0.3, y: 0, stagger: 0.03, ease: 'power2.out' },
          i * 2,
        )
        .to({}, { duration: 1.7 });
    });

    return () => splitTexts.forEach((split) => split.revert());
  }, []);

  const handleAccessPortal = () => {
    const slug = orgCode.trim().toLowerCase();
    if (!slug) {
      setError('Please enter your organization code.');
      return;
    }
    router.push(`/${slug}/login`);
  };

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        mt: { sm: 7 },
        pt: 10.5,
        pb: { xs: 5, sm: 10.5 },
        px: { xs: 3, md: 5 },
      }}
    >
      <Container
        maxWidth={false}
        sx={{
          maxWidth: 1400,
          position: 'relative',
          px: { xs: 0 },
          textAlign: 'center',
          bgcolor: 'background.paper',

          '&::after': {
            content: '""',
            position: 'absolute',
            width: 260,
            height: 96,
            bottom: -96,
            left: -260,
            background: (theme) =>
              `linear-gradient(to bottom left, ${theme.vars.palette.background.paper} 0%, transparent 50%)`,
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            width: 260,
            height: 96,
            top: -96,
            right: -260,
            background: (theme) =>
              `linear-gradient(to top right, ${theme.vars.palette.background.paper} 0%, transparent 50%)`,
          },
        }}
      >
        <DashedLine
          orientation="vertical"
          sx={{ zIndex: 10, position: 'absolute', left: 0, top: -72, bottom: -72 }}
        />
        <DashedLine
          orientation="vertical"
          sx={{ zIndex: 10, position: 'absolute', right: 0, top: -72, bottom: -72 }}
        />
        {upLg && (
          <DashedLine
            orientation="vertical"
            sx={{ zIndex: 10, position: 'absolute', left: '50%', top: -72, bottom: -72 }}
          />
        )}
        <DashedLine
          sx={{
            width: '100vw',
            zIndex: 20,
            position: 'absolute',
            left: '50%',
            transform: 'translate(-50%)',
            top: 0,
          }}
        />
        <DashedLine
          sx={{ width: 200, position: 'absolute', left: -200, zIndex: 10, bottom: 0 }}
        />
        <DashedLine
          sx={{ width: 200, position: 'absolute', right: -200, zIndex: 10, bottom: 0 }}
        />

        <Stack
          direction={{ lg: 'row' }}
          sx={{ '&> *': { flex: '1 1 50%', minWidth: 0 } }}
        >
          {/* Left — text + gateway */}
          <StripedBackground
            fadeWidth="0"
            sx={{ p: { xs: 3, sm: 6, md: 10 }, position: 'relative' }}
          >
            <Dot placement="top-left" />
            <Dot placement="top-right" />
            <Dot placement="bottom-right" />
            <Dot placement="bottom-left" />

            <RevealItems
              component={Box}
              sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', maxWidth: 600 }}
            >
              <Typography
                variant="h2"
                sx={{ textAlign: 'left', lineHeight: 1.2, mb: 2 }}
              >
                Smart facility management for{' '}
                <Box
                  component="span"
                  sx={{ whiteSpace: { sm: 'nowrap' } }}
                >
                  <Box
                    component="span"
                    sx={{
                      color: 'primary.main',
                      position: 'relative',
                      display: 'inline-block',
                      overflow: 'hidden',
                      height: 53,
                      verticalAlign: 'top',
                    }}
                  >
                    <Box
                      ref={slidesListRef}
                      sx={{ position: 'relative', display: 'block' }}
                    >
                      {words.map((word) => (
                        <Box
                          key={word}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            height: 53,
                            flexDirection: ({ direction }) =>
                              direction === 'rtl' ? 'row-reverse' : 'row',
                            justifyContent: ({ direction }) =>
                              direction === 'rtl' ? 'flex-end' : 'flex-start',
                            lineHeight: 1.5,
                          }}
                        >
                          {word}.
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>
              </Typography>

              <Typography
                variant="h5"
                sx={{ textAlign: 'left', fontWeight: 500, mb: 4, color: 'text.secondary' }}
              >
                One platform for visitors, residents, staff, and property operations.
              </Typography>

              {/* Tenant Gateway */}
              <Box sx={{ width: 1, mb: 3 }}>
                <Typography
                  variant="body2"
                  sx={{ mb: 1.5, fontWeight: 600, textAlign: 'left', color: 'text.primary' }}
                >
                  Already have a property account?
                </Typography>
                <Stack direction="row" sx={{ gap: 1, alignItems: 'flex-start' }}>
                  <TextField
                    size="small"
                    placeholder="e.g. greenfield"
                    value={orgCode}
                    onChange={(e) => {
                      setOrgCode(e.target.value);
                      if (error) setError('');
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleAccessPortal()}
                    error={!!error}
                    helperText={error || ' '}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                              propertypro.com/
                            </Typography>
                          </InputAdornment>
                        ),
                      },
                    }}
                    sx={{ flex: 1 }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleAccessPortal}
                    sx={{ height: 40, flexShrink: 0 }}
                  >
                    Access Portal
                  </Button>
                </Stack>
              </Box>

              <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'left' }}>
                New to PropertyPro?{' '}
                <Box
                  component="a"
                  href="mailto:hello@propertypro.com"
                  sx={{ color: 'primary.main', textDecoration: 'none', fontWeight: 600 }}
                >
                  Contact us to get started
                </Box>
              </Typography>
            </RevealItems>

            <DashedLine
              gradientOrientation="none"
              sx={{ width: 1, position: 'absolute', zIndex: 10, bottom: 0, left: 0 }}
            />
          </StripedBackground>

          {/* Right — property image */}
          <Box
            sx={{
              position: 'relative',
              width: 1,
              overflow: 'hidden',
              display: { xs: 'none', lg: 'block' },
            }}
          >
            <Dot placement="top-right" />
            <Dot placement="bottom-right" />
            <Dot placement="bottom-left" />
            <Box
              component="img"
              src="/assets/property-image.jpg"
              alt="Property management"
              sx={{
                width: 1,
                height: '100%',
                minHeight: 480,
                objectFit: 'cover',
                objectPosition: 'center',
                maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
              }}
            />
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default Hero;
