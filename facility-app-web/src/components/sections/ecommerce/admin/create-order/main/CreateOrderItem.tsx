'use client';

import { Dispatch, SetStateAction } from 'react';
import { Box, IconButton, Link, Stack, textFieldClasses, Typography } from '@mui/material';
import useNumberFormat from 'hooks/useNumberFormat';
import paths from 'routes/paths';
import { OrderItemType } from 'types/ecommerce';
import IconifyIcon from 'components/base/IconifyIcon';
import Image from 'components/base/Image';
import QuantityButtons from 'components/sections/ecommerce/customer/common/QuantityButtons';
import ItemVariant from './ItemVariant';

interface CreateOrderItemProps {
  orderItem: OrderItemType;
  setOrderItems: Dispatch<SetStateAction<OrderItemType[]>>;
}

const CreateOrderItem = ({ orderItem, setOrderItems }: CreateOrderItemProps) => {
  const { id, images, variants, quantity, price, name, vendor } = orderItem;
  const { currencyFormat } = useNumberFormat();

  const handleQuantityChange = (quantity: number) => {
    setOrderItems((orderItems) =>
      orderItems.map((item) => {
        if (item.id === orderItem.id) {
          return {
            ...item,
            quantity,
          };
        }

        return item;
      }),
    );
  };

  return (
    <Stack direction="row" sx={{ gap: 2, justifyContent: 'space-between' }}>
      <Stack direction={{ lg: 'row' }} sx={{ gap: 3 }}>
        <Box
          sx={{
            position: 'relative',
            width: 73,
            height: 73,
            flexShrink: 0,
            bgcolor: 'background.elevation1',
            borderRadius: 4,
          }}
        >
          <Image src={images[0].src} alt="" fill sx={{ objectFit: 'contain' }} />
        </Box>

        <Stack sx={{ gap: 3 }}>
          <Stack direction={{ xl: 'row' }} sx={{ gap: 3, justifyContent: 'space-between' }}>
            <Stack sx={{ gap: 2 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  lineClamp: 2,
                }}
              >
                <Link
                  href={paths.productDetails(String(id))}
                  sx={{
                    color: 'currentcolor',
                  }}
                >
                  {name}
                </Link>
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Sold by{' '}
                <Box component="span" sx={{ fontWeight: 500, color: 'text.primary' }}>
                  {vendor}
                </Box>
              </Typography>
            </Stack>

            <Stack sx={{ gap: 2, alignItems: { xs: 'flex-start', xl: 'flex-end' } }}>
              <QuantityButtons
                defaultValue={quantity}
                handleChange={handleQuantityChange}
                sx={{
                  [`& .${textFieldClasses.root}`]: {
                    width: 56,
                  },
                }}
              />
              <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                  {currencyFormat(price.regular)}
                </Typography>
                <Typography variant="subtitle2" sx={{ color: 'text.disabled' }}>
                  x{quantity}
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {currencyFormat(price.regular * quantity)}
                </Typography>
              </Stack>
            </Stack>
          </Stack>

          <Stack direction="row" sx={{ gap: 1 }}>
            {variants?.map((variant) => (
              <ItemVariant key={variant.label} variant={variant} />
            ))}
          </Stack>
        </Stack>
      </Stack>
      <IconButton sx={{ alignSelf: 'flex-start' }}>
        <IconifyIcon icon="material-symbols:close" sx={{ fontSize: 20, color: 'neutral.dark' }} />
      </IconButton>
    </Stack>
  );
};

export default CreateOrderItem;
