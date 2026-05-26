import {
  Box,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Link,
  Stack,
  SxProps,
  Typography,
} from '@mui/material';
import { organizerEventType } from 'types/events';
import IconifyIcon from 'components/base/IconifyIcon';
import Image from 'components/base/Image';

interface EventCardProps {
  event: organizerEventType;
  sx?: SxProps;
}

const EventCard = ({ event, sx }: EventCardProps) => {
  const { title, image, priceRange, date, time, location } = event;

  return (
    <Link href="#!">
      <Card sx={{ outline: 'none', bgcolor: 'background.elevation1', ...sx }}>
        <CardMedia>
          <Image
            src={image}
            alt={title}
            height={200}
            width={300}
            sx={{ objectFit: 'cover', width: 1, borderRadius: 6 }}
          />
        </CardMedia>

        <CardContent sx={{ p: 3 }}>
          <Stack sx={{ gap: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {priceRange}
            </Typography>
            <Typography
              sx={{
                color: 'text.secondary',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: '2',
                WebkitBoxOrient: 'vertical',
              }}
            >
              {title}
            </Typography>

            <Stack direction="row" sx={{ alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <div>
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: 'warning.main',
                      mb: 1,
                    }}
                  >
                    {date}
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: 'warning.main',
                    }}
                  >
                    {time}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  <IconifyIcon
                    icon="material-symbols:location-on-outline"
                    fontSize={20}
                    color="primary.dark"
                  />
                  {location}
                </Typography>
              </div>
              <IconButton edge="start" aria-label="favourite">
                <IconifyIcon
                  icon="material-symbols:favorite-outline-rounded"
                  width={20}
                  height={20}
                />
              </IconButton>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Link>
  );
};

export default EventCard;
