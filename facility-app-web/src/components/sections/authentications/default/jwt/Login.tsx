'use client';

import { signIn as nextAuthSignIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { defaultJwtAuthCredentials } from 'config';
import paths from 'routes/paths';
import LoginForm, { LoginFormValues } from 'components/sections/authentications/default/LoginForm';

const Login = () => {
  const router = useRouter();

  const handleLogin = async (data: LoginFormValues) => {
    const res = await nextAuthSignIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    // 2FA required — save state and redirect to OTP page
    if (res?.error?.startsWith('2FA_REQUIRED|')) {
      const parts = res.error.split('|');
      sessionStorage.setItem('2fa_temp_token', parts[1] ?? '');
      sessionStorage.setItem('2fa_masked_phone', parts[2] ?? '');
      router.push(paths.defaultJwt2FA);
      return undefined; // prevent LoginForm from showing the raw error
    }

    return res;
  };

  return (
    <LoginForm
      handleLogin={handleLogin}
      signUpLink={paths.defaultJwtSignup}
      forgotPasswordLink={paths.defaultJwtForgotPassword}
      defaultCredential={defaultJwtAuthCredentials}
    />
  );
};

export default Login;
