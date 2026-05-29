import Grid from '@mui/material/Grid';
import SuperAdminGreeting from './SuperAdminGreeting';

const SuperAdminDashboard = () => {
  return (
    <Grid container>
      <Grid size={12}>
        <SuperAdminGreeting />
      </Grid>
    </Grid>
  );
};

export default SuperAdminDashboard;
