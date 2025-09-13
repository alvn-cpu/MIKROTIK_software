import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const LoginPage = () => {
  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom>
          Login
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Login functionality - to be implemented
        </Typography>
      </Box>
    </Container>
  );
};

export default LoginPage;