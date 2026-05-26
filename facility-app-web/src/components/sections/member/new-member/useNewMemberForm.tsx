'use client';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { AddressFormValues, addressSchema } from './steps/Address';
import { JobInformationFormValues, jobInformationSchema } from './steps/JobInformation';
import {
  PersonalInformationFormValues,
  personalInformationSchema,
} from './steps/PersonalInformation';

export interface NewMemberFormValues
  extends PersonalInformationFormValues, JobInformationFormValues, AddressFormValues {}

const newMemberFormSchema = [
  personalInformationSchema,
  jobInformationSchema,
  addressSchema,
] as yup.ObjectSchema<NewMemberFormValues>[];

function useNewMemberForm(activeStep: number) {
  return useForm<NewMemberFormValues>({
    resolver: newMemberFormSchema[activeStep]
      ? yupResolver(newMemberFormSchema[activeStep])
      : undefined,
    defaultValues: {
      permanent: {
        country: '',
        state: '',
        city: '',
        street: '',
        zip: '',
      },
      present: {
        country: '',
        state: '',
        city: '',
        street: '',
        zip: '',
      },
      isSameAddress: false,
    },
  });
}

export default useNewMemberForm;

// Default values
