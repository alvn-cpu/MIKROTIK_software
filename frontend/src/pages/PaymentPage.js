import React from 'react';
import { Container, Typography, Box, Card, CardContent, Button, Grid } from '@mui/material';
import { AuthContext } from '../contexts/AuthContext';

const PaymentPage = () => {
  const { user } = React.useContext(AuthContext);
  const [plans, setPlans] = React.useState([]);

  React.useEffect(() => {
    // Fetch available billing plans
    fetch('/api/billing/plans')
      .then(res => res.json())
      .then(data => setPlans(data))
      .catch(err => console.error('Failed to fetch plans:', err));
  }, []);

  const handlePurchase = async (planId) => {
    try {
      const response = await fetch('/api/billing/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId })
      });
      
      if (response.ok) {
        alert('Payment successful! You now have internet access.');
        window.location.href = '/dashboard';
      } else {
        alert('Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    }
  };

  if (!user) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Please log in to view payment options
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h3" gutterBottom align="center">
          Choose Your Plan
        </Typography>
        <Typography variant="body1" align="center" sx={{ mb: 4 }}>
          Select a plan to get internet access
        </Typography>
        
        <Grid container spacing={3}>
          {plans.map((plan) => (
            <Grid item xs={12} sm={6} md={4} key={plan.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {plan.name}
                  </Typography>
                  <Typography variant="h6" color="primary" gutterBottom>
                    ${plan.price}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Duration: {plan.duration_hours} hours
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Data Limit: {plan.data_limit_mb ? `${plan.data_limit_mb} MB` : 'Unlimited'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {plan.description}
                  </Typography>
                </CardContent>
                <Box sx={{ p: 2 }}>
                  <Button 
                    variant="contained" 
                    fullWidth
                    onClick={() => handlePurchase(plan.id)}
                  >
                    Purchase
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default PaymentPage;
