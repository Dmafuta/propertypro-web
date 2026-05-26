import { Components, Theme } from '@mui/material';

const Stack: Components<Omit<Theme, 'components'>>['MuiStack'] = {
  defaultProps: {
    useFlexGap: true,
  },
};

export default Stack;
