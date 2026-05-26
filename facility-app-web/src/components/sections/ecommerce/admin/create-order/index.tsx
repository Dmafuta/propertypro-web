'use client';

import { Button, Stack } from '@mui/material';
import paths from 'routes/paths';
import DashboardMenu from 'components/common/DashboardMenu';
import PageHeader from 'components/sections/ecommerce/admin/common/PageHeader';
import BottomBar from 'components/sections/ecommerce/admin/create-order/BottomBar';
import CreateOrderAside from 'components/sections/ecommerce/admin/create-order/aside';
import CreateOrderContainer from 'components/sections/ecommerce/admin/create-order/main';

const CreateOrder = () => {
  return (
    <Stack>
      <PageHeader
        title="Create Order"
        breadcrumb={[
          { label: 'Order list', url: paths.adminOrderList },
          { label: 'Create Order', active: true },
        ]}
        actionComponent={
          <Stack direction="row" sx={{ gap: 1 }}>
            <Button variant="soft" color="neutral">
              Clear form
            </Button>
            <DashboardMenu size="medium" variant="soft" />
          </Stack>
        }
      />

      <Stack direction={{ xs: 'column-reverse', sm: 'row' }}>
        <CreateOrderContainer />
        <CreateOrderAside />
      </Stack>
      <BottomBar />
    </Stack>
  );
};

export default CreateOrder;
