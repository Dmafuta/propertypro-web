import { ChangeEvent, MouseEvent, ReactNode } from 'react';
import Button from '@mui/material/Button';
import Grid, { GridProps } from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import { SxProps, Theme } from '@mui/material/styles';
import IconifyIcon from 'components/base/IconifyIcon';
import SearchTextField from 'components/common/SearchTextField';

export interface SearchFilterActionBarProps extends GridProps {
  searchPlaceholder: string;
  searchId?: string;
  onSearchChange?: (_: ChangeEvent<HTMLInputElement>) => void;
  onFilterClick?: (_: MouseEvent<HTMLButtonElement>) => void;
  actionComponent?: ReactNode;
  searchSx?: SxProps<Theme>;
}

const SearchFilterActionBar = ({
  searchPlaceholder,
  searchId,
  onSearchChange,
  onFilterClick,
  actionComponent,
  searchSx,
  sx,
  ...rest
}: SearchFilterActionBarProps) => {
  return (
    <Grid
      container
      spacing={2}
      {...rest}
      sx={{
        width: { xs: 1, md: 'auto' },
        justifyContent: { xs: 'flex-start', md: 'flex-end' },
        ...sx,
      }}
    >
      <Grid size={{ xs: 12, sm: 'grow' }}>
        <Stack direction="row" sx={{ gap: 1, alignItems: 'center', width: 1, minWidth: 0 }}>
          <SearchTextField
            placeholder={searchPlaceholder}
            fullWidth
            id={searchId}
            onChange={onSearchChange}
            sx={{
              flex: 1,
              minWidth: 0,
              maxWidth: { sm: 350 },
              ml: { md: 'auto' },
              ...searchSx,
            }}
          />
          <Button
            variant="soft"
            color="neutral"
            startIcon={<IconifyIcon icon="material-symbols:filter-alt-outline" />}
            onClick={onFilterClick}
            sx={{ textWrap: 'nowrap', flexShrink: 0 }}
          >
            Filter
          </Button>
        </Stack>
      </Grid>
      {actionComponent != null ? (
        <Grid size={{ xs: 12, sm: 'auto' }}>{actionComponent}</Grid>
      ) : null}
    </Grid>
  );
};

export default SearchFilterActionBar;
