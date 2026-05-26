import { Controller, useFormContext } from 'react-hook-form';
import { Box, Paper, Stack, Tab, Tabs, Typography, tabsClasses } from '@mui/material';
import { ThemePreset } from 'config';
import { useThemeMode } from 'hooks/useThemeMode';
import { basic, grey } from 'theme/colors/base';
import IconifyIcon from 'components/base/IconifyIcon';
import { AccessibilityFormValues } from './AccessibilityTabPanel';

const ThemeSwitcher = () => {
  const { setThemePreset, isDark } = useThemeMode();
  const { control } = useFormContext<AccessibilityFormValues>();

  return (
    <>
      <Controller
        control={control}
        name="contrast"
        render={({ field }) => (
          <Tabs
            sx={{
              [`& .${tabsClasses.indicator}`]: { display: 'none' },
              [`& .${tabsClasses.list}`]: { gap: 2 },
            }}
            value={field.value === 'dark' ? 'default-dark' : 'default-light'}
            onBlur={field.onBlur}
            onChange={(_event, newValue: ThemePreset) => {
              const contrastValue = newValue === 'default-dark' ? 'dark' : 'light';
              field.onChange(contrastValue);
              setThemePreset(newValue);
            }}
          >
            <Tab
              value="default-light"
              disableRipple
              sx={(theme) => ({
                flexDirection: 'row',
                gap: 2,
                borderRadius: 2,
                bgcolor: basic.white,
                border: '1px solid',
                ...theme.applyStyles('dark', { border: 0 }),
              })}
              label={
                <>
                  <Typography variant="h6" sx={{ color: grey[800] }}>
                    Aa
                  </Typography>
                  <Paper
                    background={2}
                    variant="elevation"
                    elevation={0}
                    sx={{
                      alignItems: 'center',
                      width: 64,
                      height: 72,
                      p: 1,
                      border: '0 !important',
                      boxShadow: 'none !important',
                      bgcolor: `${grey[100]} !important`,
                    }}
                  >
                    <Box
                      sx={{ width: 23, height: 8, bgcolor: 'primary.main', borderRadius: 0.5 }}
                    />
                  </Paper>

                  {!isDark && (
                    <IconifyIcon
                      icon="material-symbols:check-circle-rounded"
                      sx={{
                        color: 'primary.main',
                        fontSize: 24,
                        position: 'absolute',
                        top: 5,
                        right: 5,
                      }}
                    />
                  )}
                </>
              }
            />
            <Tab
              value="default-dark"
              disableRipple
              sx={(theme) => ({
                flexDirection: 'row',
                gap: 2,
                bgcolor: grey[950],
                borderRadius: 2,
                border: 0,
                ...theme.applyStyles('dark', { border: '1px solid' }),
              })}
              label={
                <>
                  <Typography variant="h6" sx={{ color: grey[100] }}>
                    Aa
                  </Typography>
                  <Paper
                    background={2}
                    variant="elevation"
                    elevation={0}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column-reverse',
                      alignItems: 'center',
                      width: 64,
                      height: 72,
                      p: 1,
                      bgcolor: `${grey[800]} !important`,
                    }}
                  >
                    <Box
                      sx={{ width: 23, height: 8, bgcolor: 'primary.main', borderRadius: 0.5 }}
                    />
                  </Paper>

                  {isDark && (
                    <IconifyIcon
                      icon="material-symbols:check-circle-rounded"
                      sx={{
                        color: 'primary.main',
                        fontSize: 24,
                        position: 'absolute',
                        top: 5,
                        right: 5,
                      }}
                    />
                  )}
                </>
              }
            />
          </Tabs>
        )}
      />
      <Stack direction="row" sx={{ gap: 2 }}>
        <Typography
          variant="subtitle2"
          sx={{ minWidth: 116, fontWeight: 400, color: 'text.secondary' }}
        >
          Light
        </Typography>
        <Typography
          variant="subtitle2"
          sx={{ minWidth: 116, fontWeight: 400, color: 'text.secondary' }}
        >
          Dark
        </Typography>
      </Stack>
    </>
  );
};

export default ThemeSwitcher;
