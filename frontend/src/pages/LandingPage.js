import React from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Paper,
  Divider,
} from '@mui/material';
import {
  Wifi as WifiIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <WifiIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'High-Speed Internet',
      description: 'Enjoy blazing fast WiFi speeds for all your needs'
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Secure Connection',
      description: 'Enterprise-grade security to protect your data'
    },
    {
      icon: <PaymentIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Easy Payment',
      description: 'Pay with M-Pesa or KCB Buni for instant access'
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Instant Access',
      description: 'Get connected immediately after payment'
    },
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h2" component="h1" gutterBottom>
            Welcome to WiFi Billing
          </Typography>
          <Typography variant="h6" color="text.secondary" paragraph>
            Get connected with our secure, high-speed internet access
          </Typography>
        </Box>

        {/* Features Grid */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                {feature.icon}
                <Typography variant="h6" component="h3" sx={{ mt: 2, mb: 1 }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Main Action Card */}
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h4" component="h2" gutterBottom>
              Ready to Get Connected?
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Choose from our flexible data plans and get instant internet access
            </Typography>
            
            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/plans')}
                sx={{ mr: 2, mb: { xs: 2, sm: 0 } }}
              >
                View Plans
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom textAlign="center">
            How It Works
          </Typography>
          
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography 
                  variant="h3" 
                  component="div" 
                  color="primary.main" 
                  sx={{ fontWeight: 'bold', mb: 2 }}
                >
                  1
                </Typography>
                <Typography variant="h6" gutterBottom>
                  Choose Your Plan
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Select from our variety of data packages that suit your needs
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography 
                  variant="h3" 
                  component="div" 
                  color="primary.main" 
                  sx={{ fontWeight: 'bold', mb: 2 }}
                >
                  2
                </Typography>
                <Typography variant="h6" gutterBottom>
                  Make Payment
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pay securely using M-Pesa STK Push or KCB Buni mobile banking
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography 
                  variant="h3" 
                  component="div" 
                  color="primary.main" 
                  sx={{ fontWeight: 'bold', mb: 2 }}
                >
                  3
                </Typography>
                <Typography variant="h6" gutterBottom>
                  Get Connected
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Enjoy instant internet access once payment is confirmed
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
};

export default LandingPage;
