import { apiEndpoints } from 'routes/paths';
import useSWRMutation from 'swr/mutation';
import axiosFetcher from 'services/axios/axiosFetcher';
import { ForgotPasswordFormValues } from 'components/sections/authentications/common/ForgotPasswordForm';

export interface User {
  id: number | string;
  name: string;
  email: string;
  avatar: null | string;
  type?: string;
  designation?: string;
}

type PostKey = [string, { method: string }];

export const useSendPasswordResetLink = () => {
  const mutation = useSWRMutation<{ message: string }, Error, PostKey, ForgotPasswordFormValues>(
    [apiEndpoints.forgotPassword, { method: 'post' }],
    axiosFetcher,
  );
  return mutation;
};

export const useResetPassword = () => {
  const mutation = useSWRMutation<
    { message: string },
    Error,
    PostKey,
    { email: string; token: string; newPassword: string }
  >([apiEndpoints.resetPassword, { method: 'post' }], axiosFetcher);
  return mutation;
};
