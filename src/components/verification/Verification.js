import React, { useState } from 'react';
import {
  Box, Typography, Paper, Grid, TextField, Button, Stepper,
  Step, StepLabel, Card, CardContent, CardHeader, Divider,
  List, ListItem, ListItemText, ListItemIcon, Alert, CircularProgress,
  Tabs, Tab
} from '@mui/material';
import {
  CheckCircle, Cancel, VerifiedUser,
  Security, Gavel, AccountBalance, AttachMoney
} from '@mui/icons-material';
import CorporateAnnouncementVerification from './CorporateAnnouncementVerification';

const Verification = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [investmentDetails, setInvestmentDetails] = useState({
    name: '',
    type: '',
    provider: '',
    website: '',
    regulatoryInfo: '',
    description: ''
  });
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const steps = ['Enter Details', 'Verify Information', 'Results'];

  const handleNext = () => {
    if (activeStep === 0) {
      // Validate form
      if (!investmentDetails.name || !investmentDetails.type || !investmentDetails.provider) {
        alert('Please fill in all required fields');
        return;
      }
    }
    
    if (activeStep === 1) {
      // Simulate verification process
      setLoading(true);
      setTimeout(() => {
        // For demo purposes, we'll randomly determine if it's legitimate or suspicious
        const isLegitimate = Math.random() > 0.3;
        setVerificationStatus(isLegitimate ? 'legitimate' : 'suspicious');
        setLoading(false);
        setActiveStep(activeStep + 1);
      }, 2000);
      return;
    }
    
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setInvestmentDetails({
      name: '',
      type: '',
      provider: '',
      website: '',
      regulatoryInfo: '',
      description: ''
    });
    setVerificationStatus(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInvestmentDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Sample verified investments
  const verifiedInvestments = [
    {
      name: 'Vanguard Total Stock Market ETF',
      type: 'ETF',
      provider: 'Vanguard',
      status: 'legitimate',
      date: '2023-05-20'
    },
    {
      name: 'Fidelity Blue Chip Growth Fund',
      type: 'Mutual Fund',
      provider: 'Fidelity',
      status: 'legitimate',
      date: '2023-05-15'
    },
    {
      name: 'CryptoMax Investment Fund',
      type: 'Cryptocurrency',
      provider: 'CryptoMax LLC',
      status: 'suspicious',
      date: '2023-05-10'
    },
    {
      name: 'Global Real Estate Opportunity',
      type: 'Real Estate',
      provider: 'Global Investments Inc',
      status: 'legitimate',
      date: '2023-05-05'
    },
  ];

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom component="div">
        Verification Center
      </Typography>
      
      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Investment Verification" />
        <Tab label="Corporate Announcements" />
      </Tabs>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3 }}>
            {tabValue === 0 ? (
              <>
                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                  {steps.map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>

            {activeStep === 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Enter Investment Details
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Provide information about the investment opportunity you want to verify.
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="Investment Name"
                      name="name"
                      value={investmentDetails.name}
                      onChange={handleChange}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="Investment Type"
                      name="type"
                      value={investmentDetails.type}
                      onChange={handleChange}
                      margin="normal"
                      placeholder="e.g., Stock, Bond, ETF, Cryptocurrency"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="Provider/Company"
                      name="provider"
                      value={investmentDetails.provider}
                      onChange={handleChange}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Website"
                      name="website"
                      value={investmentDetails.website}
                      onChange={handleChange}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Regulatory Information (if available)"
                      name="regulatoryInfo"
                      value={investmentDetails.regulatoryInfo}
                      onChange={handleChange}
                      margin="normal"
                      placeholder="e.g., SEC registration number, license information"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      name="description"
                      value={investmentDetails.description}
                      onChange={handleChange}
                      margin="normal"
                      multiline
                      rows={4}
                      placeholder="Provide any additional details about the investment opportunity"
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {activeStep === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Verify Investment Information
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Please review the information below and confirm it's correct before proceeding with verification.
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Investment Name:</Typography>
                    <Typography variant="body1" paragraph>{investmentDetails.name}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Investment Type:</Typography>
                    <Typography variant="body1" paragraph>{investmentDetails.type}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Provider/Company:</Typography>
                    <Typography variant="body1" paragraph>{investmentDetails.provider}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Website:</Typography>
                    <Typography variant="body1" paragraph>{investmentDetails.website || 'Not provided'}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Regulatory Information:</Typography>
                    <Typography variant="body1" paragraph>{investmentDetails.regulatoryInfo || 'Not provided'}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Description:</Typography>
                    <Typography variant="body1" paragraph>{investmentDetails.description || 'Not provided'}</Typography>
                  </Grid>
                </Grid>

                <Alert severity="info" sx={{ mt: 2 }}>
                  Clicking "Verify" will check this investment against our database of known scams, regulatory information, and market data.
                </Alert>
              </Box>
            )}

            {activeStep === 2 && (
              <Box sx={{ textAlign: 'center' }}>
                {loading ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <CircularProgress size={60} sx={{ mb: 2 }} />
                    <Typography variant="h6">Verifying investment...</Typography>
                    <Typography variant="body2" color="text.secondary">
                      This may take a moment as we check multiple data sources.
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Verification Results
                    </Typography>
                    
                    {verificationStatus === 'legitimate' ? (
                      <Box>
                        <VerifiedUser sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                        <Typography variant="h5" color="success.main" gutterBottom>
                          Legitimate Investment
                        </Typography>
                        <Typography variant="body1" paragraph>
                          This investment appears to be legitimate based on our verification process.
                        </Typography>
                        <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
                          We've verified the regulatory status and found no red flags associated with this investment.
                        </Alert>
                      </Box>
                    ) : (
                      <Box>
                        <Cancel sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
                        <Typography variant="h5" color="error.main" gutterBottom>
                          Suspicious Investment - Exercise Caution
                        </Typography>
                        <Typography variant="body1" paragraph>
                          Our verification process has identified potential concerns with this investment.
                        </Typography>
                        <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
                          We recommend conducting further research or consulting with a financial advisor before proceeding.
                        </Alert>
                      </Box>
                    )}
                    
                    <Box sx={{ mt: 4 }}>
                      <Typography variant="h6" gutterBottom>Verification Checks Performed:</Typography>
                      <List>
                        <ListItem>
                          <ListItemIcon>
                            <Security color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Regulatory Compliance Check" 
                            secondary="Verified against financial regulatory databases" 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <Gavel color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Legal Status Verification" 
                            secondary="Checked for legal issues or pending litigation" 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <AccountBalance color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Company Background Analysis" 
                            secondary="Reviewed company history and reputation" 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <AttachMoney color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Financial Performance Review" 
                            secondary="Analyzed historical returns and financial stability" 
                          />
                        </ListItem>
                      </List>
                    </Box>
                  </Box>
                )}
              </Box>
            )}

            {tabValue === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  disabled={activeStep === 0 || loading}
                  onClick={handleBack}
                  variant="outlined"
                >
                  Back
                </Button>
                <Box>
                  {activeStep === steps.length - 1 ? (
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={handleReset}
                      disabled={loading}
                    >
                      Verify Another Investment
                    </Button>
                  ) : (
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={handleNext}
                      disabled={loading}
                    >
                      {activeStep === 1 ? 'Verify' : 'Next'}
                    </Button>
                  )}
                </Box>
              </Box>
            ) : (
              <CorporateAnnouncementVerification />
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Recently Verified Investments" />
            <Divider />
            <CardContent>
              <List>
                {verifiedInvestments.map((investment, index) => (
                  <React.Fragment key={index}>
                    <ListItem alignItems="flex-start">
                      <ListItemIcon>
                        {investment.status === 'legitimate' ? 
                          <CheckCircle color="success" /> : 
                          <Cancel color="error" />
                        }
                      </ListItemIcon>
                      <ListItemText
                        primary={investment.name}
                        secondary={
                          <React.Fragment>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              {investment.type} by {investment.provider}
                            </Typography>
                            {` — Verified on ${investment.date}`}
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                    {index < verifiedInvestments.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Verification;