'use client';

import { useState } from 'react';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import StyledTextField from 'components/styled/StyledTextField';
import RevealItems from '../common/RevealItems';
import RevealText from '../common/RevealText';
import { StripedBackground } from '../common/StripedBackground';

const Newsletter = () => {
  const [email, setEmail]         = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  };

  return (
    <StripedBackground
      fadeWidth="0"
      sx={{
        px: { xs: 4, sm: 10 },
        py: { xs: 5, sm: 11 },
        bgcolor: 'background.elevation1',
        zIndex: 1,

        '&::before': {
          maskImage: `linear-gradient(
            to right,
            transparent 0%,
            black 30%,
            transparent 60%
          )`,
        },
      }}
    >
      <Container maxWidth={false} sx={{ position: 'relative', maxWidth: 1048, px: { xs: 0 } }}>
        <Stack
          direction={{ md: 'row' }}
          sx={{ gap: { xs: 4, md: 0 }, alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Stack sx={{ gap: 1, height: 1 }}>
            <RevealText>
              <Typography variant="h4">Want to stay updated?</Typography>
            </RevealText>
            <RevealText>
              <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400 }}>
                Get product updates and facility management tips.
              </Typography>
            </RevealText>
          </Stack>

          <RevealItems
            component={Box}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: 1 }}
          >
            {submitted ? (
              <Stack sx={{ gap: 0.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  You&apos;re on the list!
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Thanks for subscribing. We&apos;ll be in touch soon.
                </Typography>
              </Stack>
            ) : (
              <>
                <Stack
                  direction="row"
                  component="form"
                  onSubmit={handleSubmit}
                  sx={{ gap: 1 }}
                >
                  <StyledTextField
                    type="email"
                    placeholder="Enter your email"
                    fullWidth
                    sx={{ maxWidth: 291 }}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Button type="submit" variant="contained">
                    Subscribe
                  </Button>
                </Stack>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 400, color: 'text.secondary', px: '10.5px' }}
                >
                  No spam. Unsubscribe anytime.
                </Typography>
              </>
            )}
          </RevealItems>
        </Stack>
      </Container>
    </StripedBackground>
  );
};

export default Newsletter;
