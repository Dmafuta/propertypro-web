'use client';

import { signIn } from 'next-auth/react';
import { ChangeEvent, Fragment, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  inputBaseClasses,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import dayjs from 'dayjs';
import useCountdown from 'hooks/useCountdown';
import paths from 'routes/paths';
import axiosInstance from 'services/axios/axiosInstance';
import StyledTextField from 'components/styled/StyledTextField';

const TOTAL_DIGITS = 6;

const TwoFAForm = () => {
  const router = useRouter();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [otp, setOtp] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [maskedPhone, setMaskedPhone] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(true);

  const { time, startTimer } = useCountdown();

  // On mount: read state stored by Login.tsx, redirect back if missing
  useEffect(() => {
    const token = sessionStorage.getItem('2fa_temp_token');
    const phone = sessionStorage.getItem('2fa_masked_phone');

    if (!token) {
      router.replace(paths.defaultJwtLogin);
      return;
    }

    setTempToken(token);
    setMaskedPhone(phone ?? '');

    // OTP was already sent during login — start 30s cooldown for resend
    setResendDisabled(true);
    startTimer(30, () => setResendDisabled(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const { value } = e.target;
    if (!value) return;
    [...value].slice(0, TOTAL_DIGITS).forEach((char, i) => {
      const ref = inputRefs.current[index + i];
      if (ref) {
        ref.value = char;
        inputRefs.current[index + i + 1]?.focus();
      }
    });
    setOtp(inputRefs.current.reduce((acc, el) => acc + (el?.value ?? ''), ''));
  };

  const handleKeydown = (e: KeyboardEvent, index: number) => {
    if (e.key === 'Backspace') {
      inputRefs.current[index]!.value = '';
      inputRefs.current[index - 1]?.focus();
      inputRefs.current[index - 1]?.select();
      setOtp(inputRefs.current.reduce((acc, el) => acc + (el?.value ?? ''), ''));
    }
    if (e.key === 'ArrowLeft') {
      inputRefs.current[index - 1]?.focus();
      inputRefs.current[index - 1]?.select();
    }
    if (e.key === 'ArrowRight') {
      inputRefs.current[index + 1]?.focus();
      inputRefs.current[index + 1]?.select();
    }
  };

  const handleResend = async () => {
    setError('');
    setResendDisabled(true);
    startTimer(30, () => setResendDisabled(false));
    try {
      await axiosInstance.post('/auth/send-2fa', { tempToken });
    } catch (e: any) {
      setError(e?.data?.error ?? 'Failed to resend code. Please try again.');
    }
  };

  const handleVerify = async () => {
    if (otp.length < TOTAL_DIGITS || isVerifying) return;
    setError('');
    setIsVerifying(true);

    try {
      const data: any = await axiosInstance.post('/auth/verify-2fa', {
        tempToken,
        code: otp,
      });

      // Clean up session state
      sessionStorage.removeItem('2fa_temp_token');
      sessionStorage.removeItem('2fa_masked_phone');

      // Complete sign-in through next-auth using the verified tokens
      const res = await signIn('verified-token', {
        redirect: false,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        userData: JSON.stringify(data.user),
      });

      if (res?.ok) {
        router.push('/');
        router.refresh();
      } else {
        setError('Sign-in failed. Please try again.');
      }
    } catch (e: any) {
      setError(e?.data?.error ?? 'Invalid or expired code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Stack
      sx={{
        flex: 1,
        height: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        pt: { md: 10 },
        pb: 10,
      }}
    >
      <Box sx={{ display: { xs: 'none', md: 'block' } }} />

      <Grid
        container
        sx={{
          maxWidth: '35rem',
          rowGap: 4,
          p: { xs: 3, sm: 5 },
          mb: 5,
        }}
      >
        <Grid size={12}>
          <Typography variant="h4" sx={{ mb: 2 }}>
            Verify your identity
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            A 6-digit code has been sent to{' '}
            <Typography component="span" sx={{ fontWeight: 600 }}>
              {maskedPhone || '*** *** ****'}
            </Typography>
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', fontWeight: 'medium' }}
          >
            Didn&apos;t receive the code?{' '}
            <Link
              variant="caption"
              component="button"
              underline={resendDisabled ? 'none' : 'always'}
              disabled={resendDisabled}
              onClick={handleResend}
              sx={{ fontWeight: 'medium', ml: 0.5 }}
            >
              Send again{' '}
              {resendDisabled && time > 0 && <>in {dayjs(time * 1000).format('m:ss')}</>}
            </Link>
          </Typography>
        </Grid>

        <Grid size={12}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box
            component="form"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              handleVerify();
            }}
          >
            <Grid container>
              {/* OTP digit inputs */}
              <Grid size={12} sx={{ mb: 2.5 }}>
                <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ alignItems: 'center' }}>
                  {Array(TOTAL_DIGITS)
                    .fill('')
                    .map((_, index) => (
                      <Fragment key={index}>
                        <Grid>
                          <StyledTextField
                            inputRef={(el: HTMLInputElement) => {
                              inputRefs.current[index] = el;
                            }}
                            type="number"
                            disabledSpinButton
                            sx={{ width: '42px' }}
                            slotProps={{
                              input: {
                                sx: {
                                  [`& .${inputBaseClasses.input}`]: {
                                    textAlign: 'center',
                                    px: '12px !important',
                                  },
                                },
                              },
                            }}
                            onClick={() => inputRefs.current[index]?.select()}
                            onFocus={() => inputRefs.current[index]?.select()}
                            onKeyUp={(e) => handleKeydown(e, index)}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              handleChange(e, index)
                            }
                            size="large"
                          />
                        </Grid>
                        {index === TOTAL_DIGITS / 2 - 1 && (
                          <Grid sx={{ lineHeight: '32px', marginX: '4px' }}>-</Grid>
                        )}
                      </Fragment>
                    ))}
                </Grid>
              </Grid>

              {/* Remember device */}
              <Grid size={12} sx={{ mb: 4 }}>
                <FormControlLabel
                  control={<Checkbox name="remember" size="small" />}
                  label={
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                      Remember this device
                    </Typography>
                  }
                />
              </Grid>

              {/* Verify button */}
              <Grid size={12} sx={{ mb: 2 }}>
                <Button
                  fullWidth
                  type="submit"
                  color="primary"
                  size="large"
                  variant="contained"
                  disabled={otp.length < TOTAL_DIGITS}
                  loading={isVerifying}
                >
                  Verify
                </Button>
              </Grid>

              {/* Back to login */}
              <Grid size={12} sx={{ textAlign: 'center' }}>
                <Link href={paths.defaultJwtLogin} variant="subtitle2">
                  Back to login
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>

      <Link href="#!" variant="subtitle2">
        Trouble signing in?
      </Link>
    </Stack>
  );
};

export default TwoFAForm;
