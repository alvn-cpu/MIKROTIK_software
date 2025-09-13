import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const PaymentPage = () => {
  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom>
          Payment
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Payment functionality - to be implemented
        </Typography>
      </Box>
    </Container>
  );
};

export default PaymentPage;