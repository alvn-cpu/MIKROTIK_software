import React from 'react';
import { Container, Typography, Box, TextField, Button } from '@mui/material';
import { AuthContext } from '../contexts/AuthContext';

const RegisterPage = () => {
  const { register } = React.useContext(AuthContext);
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try { await register(email, phone, password); window.location.href = '/'; }
    catch (e) { alert('Register failed'); }
    finally { setSubmitting(false); }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom>
          Register
        </Typography>
        <Box component="form" onSubmit={handle} sx={{ mt: 2 }}>
          <TextField fullWidth label="Email" value={email} onChange={(e)=>setEmail(e.target.value)} sx={{ mb:2 }} />
          <TextField fullWidth label="Phone" value={phone} onChange={(e)=>setPhone(e.target.value)} sx={{ mb:2 }} />
          <TextField fullWidth label="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} sx={{ mb:2 }} />
          <Button type="submit" variant="contained" disabled={submitting} fullWidth>Create Account</Button>
        </Box>
      </Box>
    </Container>
  );
};

export default RegisterPage;
