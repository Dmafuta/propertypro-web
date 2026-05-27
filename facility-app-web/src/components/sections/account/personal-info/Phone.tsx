'use client';

import { ChangeEvent, Fragment, KeyboardEvent, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
  dialogClasses,
  inputBaseClasses,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import axiosInstance from 'services/axios/axiosInstance';
import IconifyIcon from 'components/base/IconifyIcon';
import InfoCard from '../common/InfoCard';
import InfoCardAttribute from '../common/InfoCardAttribute';

const TOTAL_DIGITS = 6;

type Step = 'phone' | 'otp';

interface PhoneStatus {
  phoneNumber: string | null;
  phoneNumberConfirmed: boolean;
  twoFactorEnabled: boolean;
}

const Phone = () => {
  const { enqueueSnackbar } = useSnackbar();

  // Phone status from API
  const [status, setStatus] = useState<PhoneStatus | null>(null);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('phone');
  const [phoneInput, setPhoneInput] = useState('');
  const [maskedPhone, setMaskedPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // OTP digit refs
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Fetch phone status on mount
  useEffect(() => {
    axiosInstance
      .get('/auth/me/phone')
      .then((data: any) => setStatus(data))
      .catch(() => setStatus(null))
      .finally(() => setLoading(false));
  }, []);

  const resetDialog = () => {
    setStep('phone');
    setPhoneInput(status?.phoneNumber ?? '');
    setMaskedPhone('');
    setOtp('');
    setError('');
    // clear OTP inputs
    inputRefs.current.forEach((el) => {
      if (el) el.value = '';
    });
  };

  const openDialog = (prefilledPhone?: string) => {
    setPhoneInput(prefilledPhone ?? status?.phoneNumber ?? '');
    setStep('phone');
    setMaskedPhone('');
    setOtp('');
    setError('');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    resetDialog();
  };

  // ── Step 1: send verification code ────────────────────────────────────────
  const handleSendCode = async () => {
    if (!phoneInput.trim()) {
      setError('Please enter a phone number.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const data: any = await axiosInstance.post('/auth/send-phone-verification', {
        phoneNumber: phoneInput.trim(),
      });
      setMaskedPhone(data.maskedPhone ?? phoneInput);
      setOtp('');
      inputRefs.current.forEach((el) => {
        if (el) el.value = '';
      });
      setStep('otp');
    } catch (e: any) {
      setError(e?.data?.error ?? 'Failed to send code. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── OTP input handlers ─────────────────────────────────────────────────────
  const handleOtpChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
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

  const handleOtpKeydown = (e: KeyboardEvent, index: number) => {
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

  // ── Step 2: verify OTP ────────────────────────────────────────────────────
  const handleVerify = async () => {
    if (otp.length < TOTAL_DIGITS || submitting) return;
    setError('');
    setSubmitting(true);
    try {
      await axiosInstance.post('/auth/verify-phone', {
        phoneNumber: phoneInput.trim(),
        code: otp,
      });
      setStatus({
        phoneNumber: phoneInput.trim(),
        phoneNumberConfirmed: true,
        twoFactorEnabled: status?.twoFactorEnabled ?? false,
      });
      setOpen(false);
      enqueueSnackbar('Phone number verified successfully!', {
        variant: 'success',
        autoHideDuration: 3000,
      });
    } catch (e: any) {
      setError(e?.data?.error ?? 'Invalid or expired code. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Derived display values ────────────────────────────────────────────────
  const displayPhone = status?.phoneNumber ?? 'Not set';
  const isVerified = status?.phoneNumberConfirmed ?? false;

  return (
    <>
      {/* Info card */}
      <InfoCard setOpen={() => openDialog()} sx={{ mb: 2 }}>
        <Stack sx={{ gap: { xs: 2, sm: 1 } }}>
          {loading ? (
            <CircularProgress size={16} />
          ) : (
            <Stack direction="row" sx={{ alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <InfoCardAttribute label="Number" value={displayPhone} />
              {status?.phoneNumber && (
                <Chip
                  label={isVerified ? 'Verified' : 'Unverified'}
                  color={isVerified ? 'success' : 'warning'}
                  size="small"
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
              )}
            </Stack>
          )}
        </Stack>
        <IconifyIcon
          icon="material-symbols-light:edit-outline"
          sx={{ fontSize: 20, color: 'neutral.dark', visibility: 'hidden' }}
        />
      </InfoCard>

      {/* Confirm link (shown when unverified or no phone) */}
      {!loading && !isVerified && (
        <Stack sx={{ gap: 1, alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', textWrap: 'pretty' }}>
            {status?.phoneNumber
              ? 'Your phone number has not been verified yet.'
              : 'Add and verify a phone number to enable two-factor authentication.'}
          </Typography>
          <Link
            component="button"
            onClick={() => openDialog(status?.phoneNumber ?? '')}
            sx={{ display: 'flex', alignItems: 'center', fontSize: 'body2.fontSize' }}
          >
            {status?.phoneNumber ? 'Verify your number' : 'Add a phone number'}{' '}
            <IconifyIcon icon="material-symbols:chevron-right" sx={{ fontSize: 20 }} />
          </Link>
        </Stack>
      )}

      {/* 2-step dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth={false}
        sx={{
          [`& .${dialogClasses.paper}`]: {
            borderRadius: 6,
            overflow: 'visible',
            maxWidth: 463,
            width: '100%',
          },
        }}
      >
        <DialogTitle
          component="h6"
          sx={{ pt: 3, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          {step === 'phone' ? 'Phone Number' : 'Enter Verification Code'}
          <IconButton onClick={handleClose}>
            <IconifyIcon icon="material-symbols:close" sx={{ fontSize: 20, color: 'neutral.dark' }} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pb: 3 }}>
          <DialogContentText variant="body2" sx={{ color: 'text.secondary', mb: 2, textWrap: 'pretty' }}>
            {step === 'phone'
              ? 'Enter your phone number in international format (e.g. +254712345678). A verification code will be sent via SMS.'
              : `A 6-digit code was sent to ${maskedPhone}. Enter it below to confirm your number.`}
          </DialogContentText>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {step === 'phone' ? (
            <TextField
              fullWidth
              label="Phone number"
              placeholder="+254712345678"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendCode();
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconifyIcon icon="material-symbols:call-outline" sx={{ fontSize: 18 }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
          ) : (
            <Box>
              <Stack direction="row" sx={{ gap: 1, mb: 2, flexWrap: 'wrap' }}>
                {Array(TOTAL_DIGITS)
                  .fill('')
                  .map((_, index) => (
                    <Fragment key={index}>
                      <TextField
                        inputRef={(el: HTMLInputElement) => {
                          inputRefs.current[index] = el;
                        }}
                        type="number"
                        sx={{
                          width: '42px',
                          [`& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button`]: {
                            display: 'none',
                          },
                          [`& input[type=number]`]: { MozAppearance: 'textfield' },
                        }}
                        slotProps={{
                          input: {
                            sx: {
                              [`& .${inputBaseClasses.input}`]: {
                                textAlign: 'center',
                                px: '8px !important',
                              },
                            },
                          },
                        }}
                        onClick={() => inputRefs.current[index]?.select()}
                        onFocus={() => inputRefs.current[index]?.select()}
                        onKeyDown={(e) => handleOtpKeydown(e, index)}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleOtpChange(e, index)}
                      />
                      {index === TOTAL_DIGITS / 2 - 1 && (
                        <Box sx={{ lineHeight: '42px', px: '2px' }}>-</Box>
                      )}
                    </Fragment>
                  ))}
              </Stack>
              <Link
                component="button"
                variant="body2"
                onClick={() => setStep('phone')}
                sx={{ fontSize: 'body2.fontSize' }}
              >
                Change phone number
              </Link>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0, justifyContent: 'flex-start' }}>
          <Button
            variant="soft"
            color="neutral"
            onClick={handleClose}
            sx={{ ml: 'auto !important' }}
          >
            Cancel
          </Button>
          {step === 'phone' ? (
            <Button
              variant="contained"
              color="primary"
              loading={submitting}
              disabled={!phoneInput.trim()}
              onClick={handleSendCode}
            >
              Send Code
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              loading={submitting}
              disabled={otp.length < TOTAL_DIGITS}
              onClick={handleVerify}
            >
              Verify
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Phone;
