'use client';

import { FormProvider, SubmitHandler } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Box, Container, Paper, Stack, Typography } from '@mui/material';
import paths from 'routes/paths';
import PageBreadcrumb from 'components/sections/common/PageBreadcrumb';
import CreateInvoiceContainer from './CreateInvoiceContainer';
import { CreateInvoiceFormSchemaValues, useCreateInvoiceForm } from './useCreateInvoiceForm';

const CreateInvoice = () => {
  const router = useRouter();
  const { methods } = useCreateInvoiceForm();

  const { handleSubmit, reset } = methods;

  const onSubmit: SubmitHandler<CreateInvoiceFormSchemaValues> = (data) => {
    console.log(data);
    router.push(paths.invoicePreview);
    reset();
  };

  return (
    <>
      <Paper sx={{ px: 5, py: 3, flex: 1 }}>
        <Box>
          <PageBreadcrumb
            items={[
              { label: 'Home', url: '/' },
              { label: 'Invoice', url: paths.createInvoice },
              { label: 'New Invoice', active: true },
            ]}
            sx={{
              mb: 2,
            }}
          />
          <Typography variant="h4">Create invoice</Typography>
        </Box>
      </Paper>
      <FormProvider {...methods}>
        <Stack
          component="form"
          direction="row"
          id="createInvoiceFrom"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ py: { xs: 3, md: 5 } }}
        >
          <Container maxWidth={false} sx={{ maxWidth: 900 }}>
            <CreateInvoiceContainer />
          </Container>
        </Stack>
      </FormProvider>
    </>
  );
};

export default CreateInvoice;
