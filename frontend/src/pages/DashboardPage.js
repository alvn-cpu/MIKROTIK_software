import React from 'react';
import { Container, Typography, Box, Card, CardContent, Grid, Button, Chip } from '@mui/material';
import { AuthContext } from '../contexts/AuthContext';

const DashboardPage = () => {
  const { user, logout } = React.useContext(AuthContext);
  const [sessionStatus, setSessionStatus] = React.useState(null);
  const [usage, setUsage] = React.useState(null);

  React.useEffect(() => {
    if (user) {
      // Fetch current session status
      fetch('/api/sessions/status')
        .then(res => res.json())
        .then(data => setSessionStatus(data))
        .catch(err => console.error('Failed to fetch session status:', err));

      // Fetch usage statistics
      fetch('/api/users/usage')
        .then(res => res.json())
        .then(data => setUsage(data))
        .catch(err => console.error('Failed to fetch usage:', err));
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  if (!user) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Please log in to view your dashboard
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h3" gutterBottom>
          Welcome, {user.email}!
        </Typography>
        
        <Grid container spacing={3}>
          {/* Session Status Card */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Connection Status
                </Typography>
                {sessionStatus ? (
                  <>
                    <Chip 
                      label={sessionStatus.active ? 'Connected' : 'Disconnected'} 
                      color={sessionStatus.active ? 'success' : 'error'}
                      sx={{ mb: 2 }}
                    />
                    {sessionStatus.active && (
                      <>
                        <Typography variant="body2" color="text.secondary">
                          Time Remaining: {Math.floor(sessionStatus.time_remaining / 60)} minutes
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Data Used: {sessionStatus.data_used} MB
                        </Typography>
                      </>
                    )}
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Loading status...
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Usage Statistics Card */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Usage Statistics
                </Typography>
                {usage ? (
                  <>
                    <Typography variant="body2" color="text.secondary">
                      Total Sessions: {usage.total_sessions}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Data Used: {usage.total_data_mb} MB
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Account Balance: ${usage.balance || 0}
                    </Typography>
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Loading usage data...
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Actions Card */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button 
                    variant="contained" 
                    onClick={() => window.location.href = '/payment'}
                  >
                    Buy More Time
                  </Button>
                  <Button 
                    variant="outlined" 
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default DashboardPage;
