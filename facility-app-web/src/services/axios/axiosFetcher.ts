import { AxiosRequestConfig } from 'axios';
import axiosInstance from './axiosInstance';

const axiosFetcher = async <ExtraArg = unknown>(
  args: string | [string, AxiosRequestConfig],
  extraArg?: {
    arg: ExtraArg;
  },
): Promise<any> => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosInstance({
    url,
    method: config?.method || 'get',
    data: extraArg?.arg,
    ...config,
  });

  return res;
};

export default axiosFetcher;
