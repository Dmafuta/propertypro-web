'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

type TimerState = 'stopped' | 'running' | 'paused';

const AttendanceCounter = () => {
  const [seconds, setSeconds] = useState(0);
  const [state, setState] = useState<TimerState>('stopped');
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (state === 'running')
      intervalRef.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [state]);

  const handleCheckIn = () => {
    if (state !== 'stopped') {
      setState('stopped');
      setSeconds(0);
      return;
    }

    setSeconds(0);
    setState('running');
  };

  const handleBreak = () => {
    if (state === 'stopped') return;

    setState((s) => (s === 'running' ? 'paused' : 'running'));
  };

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const format = (n: number) => String(n).padStart(2, '0');
  return (
    <Fragment>
      <Stack direction="row" sx={{ gap: 1, mb: 2, alignItems: 'center' }}>
        <CounterBox>{format(hours)}</CounterBox>
        <Typography variant="h6">:</Typography>
        <CounterBox>{format(minutes)}</CounterBox>
        <Typography variant="h6">:</Typography>
        <CounterBox>{format(secs)}</CounterBox>
      </Stack>
      <Stack direction="row" sx={{ gap: 0.75 }}>
        <Button
          fullWidth
          variant={state === 'stopped' ? 'contained' : 'soft'}
          onClick={handleCheckIn}
        >
          Check {state === 'stopped' ? 'In' : 'Out'}
        </Button>
        <Button
          fullWidth
          variant="soft"
          color="neutral"
          disabled={state === 'stopped'}
          onClick={handleBreak}
        >
          {state === 'paused' ? 'Resume' : 'Break'}
        </Button>
      </Stack>
    </Fragment>
  );
};

const CounterBox = styled('span')(({ theme }) => ({
  backgroundColor: theme.vars.palette.background.elevation1,
  width: '100%',
  borderRadius: Number(theme.shape.borderRadius) * 2,
  padding: `${theme.spacing(2.25)} ${theme.spacing(2.75)}`,
  typography: theme.typography.subtitle1,
  textAlign: 'center',
  fontWeight: 600,
}));

export default AttendanceCounter;
