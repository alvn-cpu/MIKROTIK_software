import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const DashboardPage = () => {
  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom>
          User Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          User dashboard functionality - to be implemented
        </Typography>
      </Box>
    </Container>
  );
};

export default DashboardPage;