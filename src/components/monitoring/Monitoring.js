import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { 
  Box, Typography, Paper, Grid, Card, CardContent, CardHeader, 
  Divider, Tabs, Tab, Alert, IconButton, Chip, List, ListItem, 
  ListItemText, ListItemIcon
} from '@mui/material';
import { 
  TrendingUp, TrendingDown, Notifications, 
  Warning, CheckCircle, Info, Delete
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, 
  LineElement, Title, Tooltip, Legend 
} from 'chart.js';

// Import the SocialMediaMonitoring component
import SocialMediaMonitoring from './SocialMediaMonitoring';

// Register ChartJS components
ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend
);

const Monitoring = () => {
  const [tabValue, setTabValue] = useState(0);
  const { user } = useSelector((state) => state.auth);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Sample data for performance chart
  const performanceData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Portfolio Performance',
        data: [10000, 10500, 10300, 11000, 10800, 11500, 12000, 12300, 12100, 12800, 13200, 13500],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Market Index',
        data: [10000, 10200, 10400, 10600, 10500, 11000, 11200, 11500, 11400, 11800, 12000, 12200],
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Sample alerts data
  const alerts = [
    { 
      id: 1, 
      type: 'warning', 
      title: 'Unusual Activity Detected', 
      message: 'Unusual trading activity detected in your Tesla stock holdings.',
      date: '2023-06-15',
      icon: <Warning color="warning" />
    },
    { 
      id: 2, 
      type: 'danger', 
      title: 'Price Drop Alert', 
      message: 'Bitcoin has dropped by more than 10% in the last 24 hours.',
      date: '2023-06-14',
      icon: <TrendingDown color="error" />
    },
    { 
      id: 3, 
      type: 'info', 
      title: 'New Investment Opportunity', 
      message: 'Based on your profile, a new ETF might be of interest to you.',
      date: '2023-06-10',
      icon: <Info color="info" />
    },
    { 
      id: 4, 
      type: 'success', 
      title: 'Investment Goal Reached', 
      message: 'Your Apple stock investment has reached your target price of $180.',
      date: '2023-06-05',
      icon: <CheckCircle color="success" />
    },
  ];

  // Sample monitored investments
  const monitoredInvestments = [
    { 
      name: 'Apple Inc.', 
      ticker: 'AAPL', 
      currentPrice: 182.63, 
      change: '+1.25%', 
      alerts: 0,
      status: 'stable'
    },
    { 
      name: 'Tesla Inc.', 
      ticker: 'TSLA', 
      currentPrice: 735.72, 
      change: '-2.15%', 
      alerts: 1,
      status: 'warning'
    },
    { 
      name: 'Bitcoin', 
      ticker: 'BTC', 
      currentPrice: 29345.18, 
      change: '-8.73%', 
      alerts: 1,
      status: 'danger'
    },
    { 
      name: 'US Treasury Bonds', 
      ticker: 'GOVT', 
      currentPrice: 24.32, 
      change: '+0.45%', 
      alerts: 0,
      status: 'stable'
    },
    { 
      name: 'Vanguard S&P 500 ETF', 
      ticker: 'VOO', 
      currentPrice: 412.86, 
      change: '+0.87%', 
      alerts: 0,
      status: 'stable'
    },
  ];

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom component="div">
        Investment Monitoring
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="monitoring tabs">
          <Tab label="Overview" />
          <Tab label="Alerts" />
          <Tab label="Monitored Investments" />
          <Tab label="Social Media" />
        </Tabs>
      </Box>

      {/* Overview Tab */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Alert severity="info" sx={{ mb: 3 }}>
              Your portfolio is being actively monitored for suspicious activities and market changes.
            </Alert>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Performance Monitoring</Typography>
              <Box sx={{ height: 400 }}>
                <Line 
                  data={performanceData} 
                  options={{ 
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: false,
                        title: {
                          display: true,
                          text: 'Value ($)'
                        }
                      },
                      x: {
                        title: {
                          display: true,
                          text: 'Month'
                        }
                      }
                    }
                  }} 
                />
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>Monitoring Status</Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Real-time Price Monitoring" 
                    secondary="Active - Checking every 15 minutes" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Fraud Detection" 
                    secondary="Active - Continuous monitoring" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Market News Analysis" 
                    secondary="Active - Updated hourly" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Risk Assessment" 
                    secondary="Active - Updated daily" 
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Alerts Tab */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Recent Alerts</Typography>
            {alerts.map((alert) => (
              <Paper 
                key={alert.id} 
                elevation={2} 
                sx={{ 
                  p: 2, 
                  mb: 2, 
                  borderLeft: 6, 
                  borderColor: 
                    alert.type === 'warning' ? 'warning.main' : 
                    alert.type === 'danger' ? 'error.main' : 
                    alert.type === 'success' ? 'success.main' : 'info.main' 
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {alert.icon}
                    <Box sx={{ ml: 2 }}>
                      <Typography variant="h6">{alert.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {alert.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        {alert.date}
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton size="small">
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              </Paper>
            ))}
          </Grid>
        </Grid>
      )}

      {/* Social Media Monitoring Tab */}
      {tabValue === 3 && (
        <SocialMediaMonitoring userId={user?.uid} />
      )}

      {/* Monitored Investments Tab */}
      {tabValue === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Monitored Investments" />
              <Divider />
              <CardContent>
                <Grid container sx={{ fontWeight: 'bold', pb: 2 }}>
                  <Grid item xs={3}>
                    <Typography variant="subtitle1">Name</Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography variant="subtitle1">Ticker</Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography variant="subtitle1">Current Price</Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography variant="subtitle1">Change</Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="subtitle1">Status</Typography>
                  </Grid>
                </Grid>
                <Divider />
                {monitoredInvestments.map((investment, index) => (
                  <React.Fragment key={index}>
                    <Grid container sx={{ py: 2 }}>
                      <Grid item xs={3}>
                        <Typography variant="body1">{investment.name}</Typography>
                      </Grid>
                      <Grid item xs={2}>
                        <Typography variant="body1">{investment.ticker}</Typography>
                      </Grid>
                      <Grid item xs={2}>
                        <Typography variant="body1">${investment.currentPrice.toLocaleString()}</Typography>
                      </Grid>
                      <Grid item xs={2}>
                        <Typography 
                          variant="body1" 
                          color={investment.change.startsWith('+') ? 'success.main' : 'error.main'}
                          sx={{ display: 'flex', alignItems: 'center' }}
                        >
                          {investment.change.startsWith('+') ? 
                            <TrendingUp fontSize="small" sx={{ mr: 0.5 }} /> : 
                            <TrendingDown fontSize="small" sx={{ mr: 0.5 }} />
                          }
                          {investment.change}
                        </Typography>
                      </Grid>
                      <Grid item xs={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Chip 
                            label={investment.status.charAt(0).toUpperCase() + investment.status.slice(1)} 
                            color={
                              investment.status === 'stable' ? 'success' : 
                              investment.status === 'warning' ? 'warning' : 'error'
                            }
                            size="small"
                            sx={{ mr: 1 }}
                          />
                          {investment.alerts > 0 && (
                            <Chip 
                              icon={<Notifications fontSize="small" />} 
                              label={`${investment.alerts} Alert${investment.alerts > 1 ? 's' : ''}`} 
                              color="default" 
                              size="small" 
                            />
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                    {index < monitoredInvestments.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Monitoring;