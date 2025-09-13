import React, { useMemo, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  TextField,
  IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// PlansPage shows plan cards. Clicking a card flips it to reveal phone input for payment.
// When a plan is selected, other plans disappear. A back arrow lets user return to the list.
const PlansPage = () => {
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch plans from backend
  const [plans, setPlans] = useState([]);
  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/plans');
        const data = await res.json();
        const mapped = (data.plans || []).map(p => ({
          id: p.id,
          name: p.name,
          duration: `${p.duration_minutes} Minutes`,
          price: Math.round((p.price_cents || 0) / 100),
          data: p.data_cap_mb ? `${p.data_cap_mb} MB` : 'Unlimited',
          speed: p.speed_down_kbps ? `${Math.round(p.speed_down_kbps/1000)} Mbps` : 'Best Effort',
          popular: false
        }));
        setPlans(mapped);
      } catch (e) {
        setPlans([]);
      }
    })();
  }, []);

  const selectedPlan = useMemo(() => plans.find(p => p.id === selectedPlanId) || null, [plans, selectedPlanId]);

  const handleSelect = (planId) => {
    setSelectedPlanId(planId);
    setPhone('');
  };

  const handleBack = () => {
    setSelectedPlanId(null);
    setPhone('');
  };

  const handlePay = async () => {
    if (!phone || !selectedPlanId) return;
    try {
      setSubmitting(true);
      const res = await fetch('/api/payments/daraja/stk-push', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: selectedPlanId, phoneNumber: phone })
      });
      const data = await res.json();
      if (!data.success) {
        alert('Payment initiation failed');
      } else {
        // Optionally poll status or wait for callback-driven UI update
        alert('STK push sent. Complete on your phone.');
      }
    } catch (e) {
      alert('Payment error');
    } finally {
      setSubmitting(false);
    }
  };

  const CardFront = ({ plan }) => (
    <Box sx={{ p: 3 }}>
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
        variant={plan.popular ? 'contained' : 'outlined'}
        fullWidth
        size="large"
        onClick={() => handleSelect(plan.id)}
      >
        Select Plan
      </Button>
    </Box>
  );

  const CardBack = ({ plan }) => (
    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        {plan.name} — Enter Phone Number
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        We’ll send an STK push to your phone to complete payment.
      </Typography>
      <TextField
        label="Phone Number (e.g. 07XXXXXXXX)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        fullWidth
        inputMode="tel"
        sx={{ mb: 2 }}
      />
      <Box sx={{ mt: 'auto' }}>
        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={handlePay}
          disabled={!phone || submitting}
        >
          {submitting ? 'Processing…' : `Pay KES ${plan.price}`}
        </Button>
      </Box>
    </Box>
  );

  const PlanFlipCard = ({ plan }) => {
    const isSelected = selectedPlanId === plan.id;
    return (
      <Card
        sx={{
          height: 360,
          position: 'relative',
          border: plan.popular ? '2px solid' : '1px solid',
          borderColor: plan.popular ? 'primary.main' : 'divider',
          perspective: 1000,
          overflow: 'visible'
        }}
      >
        {plan.popular && !isSelected && (
          <Chip
            label="Most Popular"
            color="primary"
            sx={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', zIndex: 2 }}
          />
        )}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            transition: 'transform 0.6s',
            transformStyle: 'preserve-3d',
            transform: isSelected ? 'rotateY(180deg)' : 'none'
          }}
        >
          {/* Front */}
          <Box sx={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden' }}>
            <CardFront plan={plan} />
          </Box>
          {/* Back */}
          <Box sx={{ position: 'absolute', inset: 0, transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}>
            <CardBack plan={plan} />
          </Box>
        </Box>
      </Card>
    );
  };

  const visiblePlans = selectedPlan ? [selectedPlan] : plans;

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {selectedPlan && (
            <IconButton aria-label="Back" onClick={handleBack} sx={{ mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
          )}
          <Typography variant="h3" component="h1" gutterBottom textAlign={selectedPlan ? 'left' : 'center'} sx={{ flex: 1 }}>
            {selectedPlan ? 'Confirm & Pay' : 'Choose Your Plan'}
          </Typography>
        </Box>
        {!selectedPlan && (
          <Typography variant="body1" color="text.secondary" paragraph textAlign="center">
            Select the perfect plan for your internet needs
          </Typography>
        )}

        <Grid container spacing={4} sx={{ mt: 2 }}>
          {visiblePlans.map((plan) => (
            <Grid item xs={12} md={selectedPlan ? 6 : 4} lg={selectedPlan ? 5 : 4} key={plan.id} sx={{ mx: selectedPlan ? 'auto' : 0 }}>
              <PlanFlipCard plan={plan} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default PlansPage;
