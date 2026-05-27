'use client';

import { PropsWithChildren, Suspense } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import DefaultLoader from 'components/loading/DefaultLoader';

const DefaultAuthLayout = ({ children }: PropsWithChildren) => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left panel — property image with overlay text */}
      <div
        style={{
          display: 'none',
          flex: '0 0 62.5%',
          maxWidth: '62.5%',
          position: 'relative',
          backgroundImage: 'url(/assets/property-image.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        className="auth-left-panel"
      >
        {/* Contrast overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.50)',
          }}
        />

        {/* Content */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            padding: '56px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <p
            style={{
              color: '#fff',
              fontWeight: 800,
              fontSize: '1.75rem',
              marginBottom: '3rem',
              letterSpacing: '-0.5px',
            }}
          >
            PropertyPro
          </p>

          <div>
            <p
              style={{
                color: '#fff',
                fontWeight: 700,
                fontSize: '3rem',
                lineHeight: 1.2,
                marginBottom: '1rem',
              }}
            >
              Smart Facility
              <br />
              Management
            </p>
            <p
              style={{
                color: 'rgba(255,255,255,0.75)',
                fontWeight: 400,
                fontSize: '1.125rem',
                maxWidth: 480,
                lineHeight: 1.6,
              }}
            >
              Streamline visitor access, resident services, and property operations — all from one
              intelligent platform.
            </p>
          </div>
        </div>
      </div>

      {/* Right panel — login form */}
      <Box
        sx={{
          flex: 1,
          borderLeft: { md: '1px solid' },
          borderColor: { md: 'divider' },
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Suspense fallback={<DefaultLoader />}>{children}</Suspense>
      </Box>

      <style>{`
        @media (min-width: 900px) {
          .auth-left-panel { display: block !important; }
        }
      `}</style>
    </Box>
  );
};

export default DefaultAuthLayout;
