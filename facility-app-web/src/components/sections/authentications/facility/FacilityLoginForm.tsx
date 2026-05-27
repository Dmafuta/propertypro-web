'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Alert,
  Box,
  Button,
  Divider,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import PasswordTextField from 'components/common/PasswordTextField';

type Mode = 'staff' | 'resident' | 'superadmin';

interface FacilityLoginFormProps {
  slug: string;
  mode: Mode;
}

interface LoginFormValues {
  email: string;
  password: string;
}

const schema = yup.object({
  email:    yup.string().email('Please enter a valid email.').required('Email is required.'),
  password: yup.string().required('Password is required.'),
});

const labels: Record<Mode, { title: string; subtitle: string }> = {
  staff:      { title: 'Staff Login',      subtitle: 'Sign in to manage your facility' },
  resident:   { title: 'Resident Portal',  subtitle: 'Sign in to your resident account' },
  superadmin: { title: 'Platform Admin',   subtitle: 'Sign in to manage all tenants' },
};

export default function FacilityLoginForm({ slug, mode }: FacilityLoginFormProps) {
  const router = useRouter();
  const { title, subtitle } = labels[mode];

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: yupResolver(schema) });

  const onSubmit = async (data: LoginFormValues) => {
    const tenantSlug = mode === 'superadmin' ? 'platform' : slug;
    const staffOnly  = mode === 'staff' ? 'true' : 'false';

    const res = await signIn('credentials', {
      email:      data.email,
      password:   data.password,
      tenantSlug,
      staffOnly,
      redirect:   false,
    });

    if (!res) return;

    // 2FA required — save temp token and redirect
    if (res.error?.startsWith('2FA_REQUIRED|')) {
      const parts = res.error.split('|');
      sessionStorage.setItem('2fa_temp_token',   parts[1] ?? '');
      sessionStorage.setItem('2fa_masked_phone',  parts[2] ?? '');
      sessionStorage.setItem('2fa_tenant_slug',   tenantSlug);
      router.push(mode === 'superadmin' ? '/superadmin/2fa' : `/${slug}/2fa`);
      return;
    }

    if (res.error) {
      const msg =
        res.error === 'CredentialsSignin'
          ? 'Invalid email or password.'
          : res.error;
      setError('root.credential', { type: 'manual', message: msg });
      return;
    }

    if (res.ok) {
      if (mode === 'superadmin') {
        router.push('/superadmin/dashboard');
      } else if (mode === 'resident') {
        router.push(`/${slug}/resident/dashboard`);
      } else {
        router.push(`/${slug}/dashboard`);
      }
      router.refresh();
    }
  };

  return (
    <Stack sx={{ height: 1, alignItems: 'center', justifyContent: 'center', py: 8 }}>
      <Grid
        container
        sx={{ maxWidth: '35rem', width: '100%', rowGap: 4, p: { xs: 3, sm: 5 } }}
      >
        <Grid size={12}>
          <Stack sx={{ gap: 0.5 }}>
            <Typography variant="h4">{title}</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {subtitle}
            </Typography>
          </Stack>
        </Grid>

        <Grid size={12}>
          <Divider />
        </Grid>

        <Grid size={12}>
          <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
            {errors.root?.credential?.message && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {errors.root.credential.message}
              </Alert>
            )}

            <Grid container rowSpacing={3}>
              <Grid size={12}>
                <TextField
                  fullWidth
                  size="large"
                  label="Email"
                  type="email"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  {...register('email')}
                />
              </Grid>

              <Grid size={12}>
                <PasswordTextField
                  fullWidth
                  size="large"
                  label="Password"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  {...register('password')}
                />
              </Grid>

              {mode !== 'superadmin' && (
                <Grid size={12} sx={{ textAlign: 'right' }}>
                  <Link
                    href={
                      mode === 'resident'
                        ? `/${slug}/resident/forgot-password`
                        : `/${slug}/forgot-password`
                    }
                    variant="body2"
                  >
                    Forgot password?
                  </Link>
                </Grid>
              )}

              <Grid size={12}>
                <Button
                  fullWidth
                  type="submit"
                  size="large"
                  variant="contained"
                  loading={isSubmitting}
                >
                  Sign in
                </Button>
              </Grid>

              {mode === 'resident' && (
                <Grid size={12} sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Don&apos;t have an account?{' '}
                    <Link href={`/${slug}/resident/register`}>Register</Link>
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </Stack>
  );
}
