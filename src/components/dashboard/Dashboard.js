import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Card, CardContent, CardHeader,
  Divider, IconButton, Tooltip, Button, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  List, ListItem, ListItemText, ListItemIcon, Chip, Avatar
} from '@mui/material';
import {
  Refresh, TrendingUp, TrendingDown, Warning, CheckCircle,
  NotificationsActive, VerifiedUser, Public, Assessment, Flag,
  Timeline, Visibility, BarChart, PieChart, ShowChart, Info
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

// Import services
import { getAnnouncements } from '../../services/corporateAnnouncementService';
import { getSocialMediaTips, getMarketActivity as getMarketActivities } from '../../services/socialMediaMonitoringService';

// Chart components (placeholder - would use a library like recharts or chart.js)
const LineChart = () => (
  <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <ShowChart sx={{ fontSize: 100, color: 'text.secondary', opacity: 0.5 }} />
  </Box>
);

const PieChartComponent = () => (
  <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <PieChart sx={{ fontSize: 100, color: 'text.secondary', opacity: 0.5 }} />
  </Box>
);

const BarChartComponent = () => (
  <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <BarChart sx={{ fontSize: 100, color: 'text.secondary', opacity: 0.5 }} />
  </Box>
);

const Dashboard = () => {
  const [loading, setLoading] = useState({
    announcements: false,
    socialMediaTips: false,
    marketActivities: false
  });
  const [data, setData] = useState({
    announcements: [],
    socialMediaTips: [],
    marketActivities: []
  });
  const [stats, setStats] = useState({
    totalAnnouncements: 0,
    fraudulentAnnouncements: 0,
    verifiedAnnouncements: 0,
    pendingAnnouncements: 0,
    totalSocialMediaTips: 0,
    highRiskTips: 0,
    mediumRiskTips: 0,
    lowRiskTips: 0,
    unusualMarketActivities: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    // Fetch announcements
    setLoading(prev => ({ ...prev, announcements: true }));
    try {
      const fetchedAnnouncements = await getAnnouncements();
      setData(prev => ({ ...prev, announcements: fetchedAnnouncements }));
      
      // Calculate announcement stats
      const fraudulent = fetchedAnnouncements.filter(a => a.verificationStatus === 'fraudulent').length;
      const verified = fetchedAnnouncements.filter(a => a.verificationStatus === 'verified').length;
      const pending = fetchedAnnouncements.filter(a => a.verificationStatus === 'pending' || !a.verificationStatus).length;
      
      setStats(prev => ({
        ...prev,
        totalAnnouncements: fetchedAnnouncements.length,
        fraudulentAnnouncements: fraudulent,
        verifiedAnnouncements: verified,
        pendingAnnouncements: pending
      }));
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(prev => ({ ...prev, announcements: false }));
    }

    // Fetch social media tips
    setLoading(prev => ({ ...prev, socialMediaTips: true }));
    try {
      const fetchedTips = await getSocialMediaTips();
      setData(prev => ({ ...prev, socialMediaTips: fetchedTips }));
      
      // Calculate tip stats
      const highRisk = fetchedTips.filter(t => t.suspiciousScore >= 70).length;
      const mediumRisk = fetchedTips.filter(t => t.suspiciousScore >= 40 && t.suspiciousScore < 70).length;
      const lowRisk = fetchedTips.filter(t => t.suspiciousScore < 40).length;
      
      setStats(prev => ({
        ...prev,
        totalSocialMediaTips: fetchedTips.length,
        highRiskTips: highRisk,
        mediumRiskTips: mediumRisk,
        lowRiskTips: lowRisk
      }));
    } catch (error) {
      console.error('Error fetching social media tips:', error);
    } finally {
      setLoading(prev => ({ ...prev, socialMediaTips: false }));
    }

    // Fetch market activities
    setLoading(prev => ({ ...prev, marketActivities: true }));
    try {
      const fetchedActivities = await getMarketActivities();
      setData(prev => ({ ...prev, marketActivities: fetchedActivities }));
      
      // Calculate market activity stats
      const unusual = fetchedActivities.filter(a => a.isUnusual).length;
      
      setStats(prev => ({
        ...prev,
        unusualMarketActivities: unusual
      }));
    } catch (error) {
      console.error('Error fetching market activities:', error);
    } finally {
      setLoading(prev => ({ ...prev, marketActivities: false }));
    }
  };

  const getScoreColor = (score, type) => {
    if (type === 'suspicious') {
      if (score >= 70) return '#f44336'; // High risk - red
      if (score >= 40) return '#ff9800'; // Medium risk - orange
      return '#4caf50'; // Low risk - green
    } else if (type === 'credibility') {
      if (score >= 70) return '#4caf50'; // High credibility - green
      if (score >= 40) return '#ff9800'; // Medium credibility - orange
      return '#f44336'; // Low credibility - red
    }
    return '#9e9e9e'; // Default - gray
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          InvestShield Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={fetchDashboardData}
          disabled={loading.announcements || loading.socialMediaTips || loading.marketActivities}
        >
          Refresh Data
        </Button>
      </Box>

      {/* Summary Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Announcements</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h3">{stats.totalAnnouncements}</Typography>
              <Public sx={{ fontSize: 40, color: 'primary.main' }} />
            </Box>
            <Box sx={{ mt: 2 }}>
              <Chip 
                label={`${stats.verifiedAnnouncements} Verified`} 
                color="success" 
                size="small" 
                icon={<CheckCircle />} 
                sx={{ mr: 1, mb: 1 }} 
              />
              <Chip 
                label={`${stats.fraudulentAnnouncements} Fraudulent`} 
                color="error" 
                size="small" 
                icon={<Warning />} 
                sx={{ mr: 1, mb: 1 }} 
              />
              <Chip 
                label={`${stats.pendingAnnouncements} Pending`} 
                color="default" 
                size="small" 
                icon={<Info />} 
                sx={{ mb: 1 }} 
              />
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Social Media Tips</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h3">{stats.totalSocialMediaTips}</Typography>
              <Timeline sx={{ fontSize: 40, color: 'primary.main' }} />
            </Box>
            <Box sx={{ mt: 2 }}>
              <Chip 
                label={`${stats.highRiskTips} High Risk`} 
                color="error" 
                size="small" 
                icon={<Warning />} 
                sx={{ mr: 1, mb: 1 }} 
              />
              <Chip 
                label={`${stats.mediumRiskTips} Medium Risk`} 
                color="warning" 
                size="small" 
                icon={<Flag />} 
                sx={{ mr: 1, mb: 1 }} 
              />
              <Chip 
                label={`${stats.lowRiskTips} Low Risk`} 
                color="success" 
                size="small" 
                icon={<CheckCircle />} 
                sx={{ mb: 1 }} 
              />
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Market Activities</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h3">{data.marketActivities.length}</Typography>
              <ShowChart sx={{ fontSize: 40, color: 'primary.main' }} />
            </Box>
            <Box sx={{ mt: 2 }}>
              <Chip 
                label={`${stats.unusualMarketActivities} Unusual`} 
                color="warning" 
                size="small" 
                icon={<TrendingUp />} 
                sx={{ mr: 1, mb: 1 }} 
              />
              <Chip 
                label={`${data.marketActivities.length - stats.unusualMarketActivities} Normal`} 
                color="success" 
                size="small" 
                icon={<TrendingDown />} 
                sx={{ mb: 1 }} 
              />
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Alerts Sent</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h3">{stats.fraudulentAnnouncements}</Typography>
              <NotificationsActive sx={{ fontSize: 40, color: 'error.main' }} />
            </Box>
            <Box sx={{ mt: 2 }}>
              <Button 
                variant="contained" 
                color="primary" 
                size="small" 
                component={Link} 
                to="/verification/announcement"
                startIcon={<Visibility />}
              >
                View All Alerts
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardHeader 
              title="Announcement Verification Status" 
              action={
                <IconButton>
                  <Info />
                </IconButton>
              } 
            />
            <Divider />
            <CardContent>
              <PieChartComponent />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardHeader 
              title="Social Media Tip Risk Levels" 
              action={
                <IconButton>
                  <Info />
                </IconButton>
              } 
            />
            <Divider />
            <CardContent>
              <BarChartComponent />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardHeader 
              title="Market Activity Trends" 
              action={
                <IconButton>
                  <Info />
                </IconButton>
              } 
            />
            <Divider />
            <CardContent>
              <LineChart />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Data Tables */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardHeader 
              title="Recent Suspicious Social Media Tips" 
              action={
                <Button 
                  size="small" 
                  component={Link} 
                  to="/monitoring/social-media"
                  endIcon={<Visibility />}
                >
                  View All
                </Button>
              } 
            />
            <Divider />
            <CardContent sx={{ p: 0 }}>
              {loading.socialMediaTips ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Source</TableCell>
                        <TableCell>Stock</TableCell>
                        <TableCell>Content</TableCell>
                        <TableCell>Risk Score</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.socialMediaTips.length > 0 ? (
                        data.socialMediaTips
                          .sort((a, b) => b.suspiciousScore - a.suspiciousScore)
                          .slice(0, 5)
                          .map((tip) => (
                            <TableRow key={tip.id} hover>
                              <TableCell>{tip.source}</TableCell>
                              <TableCell>{tip.stockSymbol}</TableCell>
                              <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {tip.content}
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Box
                                    sx={{
                                      width: 35,
                                      height: 35,
                                      borderRadius: '50%',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      bgcolor: getScoreColor(tip.suspiciousScore, 'suspicious'),
                                      color: 'white',
                                      mr: 1
                                    }}
                                  >
                                    {tip.suspiciousScore}
                                  </Box>
                                  {tip.suspiciousScore >= 70 && <Warning color="error" />}
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            No social media tips found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardHeader 
              title="Recent Corporate Announcements" 
              action={
                <Button 
                  size="small" 
                  component={Link} 
                  to="/verification/announcement"
                  endIcon={<Visibility />}
                >
                  View All
                </Button>
              } 
            />
            <Divider />
            <CardContent sx={{ p: 0 }}>
              {loading.announcements ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Company</TableCell>
                        <TableCell>Title</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.announcements.length > 0 ? (
                        data.announcements
                          .sort((a, b) => {
                            // Sort by timestamp (newest first)
                            if (a.timestamp && b.timestamp) {
                              return b.timestamp.seconds - a.timestamp.seconds;
                            }
                            return 0;
                          })
                          .slice(0, 5)
                          .map((announcement) => (
                            <TableRow key={announcement.id} hover>
                              <TableCell>{announcement.companyName}</TableCell>
                              <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {announcement.title}
                              </TableCell>
                              <TableCell>
                                {announcement.timestamp ? new Date(announcement.timestamp.seconds * 1000).toLocaleDateString() : 'N/A'}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={announcement.verificationStatus || 'pending'}
                                  color={
                                    announcement.verificationStatus === 'verified' ? 'success' :
                                    announcement.verificationStatus === 'fraudulent' ? 'error' :
                                    announcement.verificationStatus === 'uncertain' ? 'warning' : 'default'
                                  }
                                  size="small"
                                />
                              </TableCell>
                            </TableRow>
                          ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            No announcements found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;