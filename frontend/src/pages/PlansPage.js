import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const PlansPage = () => {
  const navigate = useNavigate();
  
  const plans = [
    {
      id: 1,
      name: 'Basic',
      duration: '1 Hour',
      price: 50,
      data: '1 GB',
      speed: '10 Mbps',
      popular: false
    },
    {
      id: 2,
      name: 'Standard',
      duration: '6 Hours',
      price: 200,
      data: '5 GB',
      speed: '20 Mbps',
      popular: true
    },
    {
      id: 3,
      name: 'Premium',
      duration: '24 Hours',
      price: 500,
      data: 'Unlimited',
      speed: '50 Mbps',
      popular: false
    }
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom textAlign="center">
          Choose Your Plan
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph textAlign="center">
          Select the perfect plan for your internet needs
        </Typography>

        <Grid container spacing={4} sx={{ mt: 4 }}>
          {plans.map((plan) => (
            <Grid item xs={12} md={4} key={plan.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  border: plan.popular ? '2px solid' : '1px solid',
                  borderColor: plan.popular ? 'primary.main' : 'divider'
                }}
              >
                {plan.popular && (
                  <Chip
                    label="Most Popular"
                    color="primary"
                    sx={{
                      position: 'absolute',
                      top: -12,
                      left: '50%',
                      transform: 'translateX(-50%)'
                    }}
                  />
                )}
                
                <CardContent sx={{ p: 3, flexGrow: 1 }}>
                  <Typography variant="h5" component="h3" gutterBottom>
                    {plan.name}
                  </Typography>
                  
                  <Typography variant="h3" color="primary.main" gutterBottom>
                    KES {plan.price}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Valid for {plan.duration}
                  </Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      📊 Data: <strong>{plan.data}</strong>
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      ⚡ Speed: <strong>{plan.speed}</strong>
                    </Typography>
                    <Typography variant="body1">
                      ⏱️ Duration: <strong>{plan.duration}</strong>
                    </Typography>
                  </Box>
                  
                  <Button
                    variant={plan.popular ? "contained" : "outlined"}
                    fullWidth
                    size="large"
                    onClick={() => navigate(`/payment?plan=${plan.id}`)}
                  >
                    Select Plan
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default PlansPage;