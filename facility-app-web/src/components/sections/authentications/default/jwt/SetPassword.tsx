'use client';

import { useResetPassword } from 'services/swr/api-hooks/useAuthApi';
import SetPasswordForm, {
  SetPasswordFormValues,
} from 'components/sections/authentications/default/SetPassworForm';

const SetPassword = () => {
  const { trigger: resetPassword } = useResetPassword();

  const handleSetPassword = async (data: SetPasswordFormValues) => {
    const response = await resetPassword({
      email: data.email,
      token: data.token,
      newPassword: data.password,
    }).catch((error) => {
      throw new Error(error?.data?.error || error?.data?.message || 'Reset failed');
    });
    return response as { message: string };
  };

  return <SetPasswordForm handleSetPassword={handleSetPassword} />;
};

export default SetPassword;
