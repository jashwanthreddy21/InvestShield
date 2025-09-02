import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Grid, TextField, Button, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Card, CardContent, CardHeader, Divider, IconButton, Alert,
  Dialog, DialogActions, DialogContent, DialogTitle, FormControl,
  InputLabel, Select, MenuItem, CircularProgress, Tooltip, List
} from '@mui/material';
import {
  Refresh, FilterList, Link, Warning, CheckCircle, Info,
  MoreVert, Search, Timeline, Flag, NotificationsActive, Settings,
  Close, Twitter, Reddit, Telegram, Chat
} from '@mui/icons-material';
import { getSocialMediaTips, getMarketActivity, linkTipToActivity, updateTipAnalysis, getMonitoringConfig } from '../../services/socialMediaMonitoringService';

const SocialMediaMonitoring = () => {
  const navigate = useNavigate();
  const [socialMediaTips, setSocialMediaTips] = useState([]);
  const [marketActivity, setMarketActivity] = useState([]);
  const [loading, setLoading] = useState(false);
  const [monitoringConfig, setMonitoringConfig] = useState(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [filters, setFilters] = useState({
    platform: '',
    analysisStatus: '',
    suspiciousScoreMin: 0,
    startDate: '',
    endDate: ''
  });
  const [selectedTip, setSelectedTip] = useState(null);
  const [openTipDialog, setOpenTipDialog] = useState(false);
  const [openLinkDialog, setOpenLinkDialog] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  
  useEffect(() => {
    fetchMonitoringConfig();
  }, []);
  
  useEffect(() => {
    if (monitoringConfig) {
      fetchSocialMediaTips();
      fetchMarketActivity();
    }
  }, [monitoringConfig]);
  
  const [connectionError, setConnectionError] = useState(false);
  const [usingLocalData, setUsingLocalData] = useState(false);

  const fetchMonitoringConfig = async () => {
    setConfigLoading(true);
    setConnectionError(false);
    setUsingLocalData(false);
    
    try {
      const config = await getMonitoringConfig();
      setMonitoringConfig(config);
      
      // Check if we're using local data
      if (config && config.source === 'localStorage') {
        setUsingLocalData(true);
      }
      
      // If config exists, update filters based on config
      if (config) {
        setFilters(prev => ({
          ...prev,
          platform: config.platforms.length === 1 ? config.platforms[0] : ''
        }));
      } else {
        // If no config found, suggest setting up monitoring
        setConnectionError(true);
      }
    } catch (error) {
      console.error('Error fetching monitoring configuration:', error);
      setConnectionError(true);
    } finally {
      setConfigLoading(false);
    }
  };
  
  const fetchSocialMediaTips = async () => {
    setLoading(true);
    try {
      const tips = await getSocialMediaTips(filters);
      setSocialMediaTips(tips);
    } catch (error) {
      console.error('Error fetching social media tips:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchMarketActivity = async () => {
    try {
      const activity = await getMarketActivity();
      setMarketActivity(activity);
    } catch (error) {
      console.error('Error fetching market activity:', error);
    }
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const applyFilters = () => {
    fetchSocialMediaTips();
  };
  
  const resetFilters = () => {
    setFilters({
      platform: '',
      analysisStatus: '',
      suspiciousScoreMin: 0,
      startDate: '',
      endDate: ''
    });
  };
  
  const handleTipClick = (tip) => {
    setSelectedTip(tip);
    setOpenTipDialog(true);
  };
  
  const handleLinkToActivity = (tip) => {
    setSelectedTip(tip);
    setOpenLinkDialog(true);
  };
  
  const confirmLinkToActivity = async () => {
    if (!selectedTip || !selectedActivity) return;
    
    try {
      await linkTipToActivity(selectedTip.id, selectedActivity);
      fetchSocialMediaTips();
      fetchMarketActivity();
      setOpenLinkDialog(false);
      setSelectedActivity(null);
    } catch (error) {
      console.error('Error linking tip to activity:', error);
    }
  };
  
  const updateTipStatus = async (tipId, status, suspiciousScore) => {
    try {
      await updateTipAnalysis(tipId, {
        status,
        suspiciousScore,
        method: 'manual-review',
        notes: 'Updated by regulator',
        appendToHistory: true
      });
      fetchSocialMediaTips();
      setOpenTipDialog(false);
    } catch (error) {
      console.error('Error updating tip status:', error);
    }
  };
  
  const getSuspiciousScoreColor = (score) => {
    if (score >= 70) return '#f44336'; // High risk - red
    if (score >= 40) return '#ff9800'; // Medium risk - orange
    return '#4caf50'; // Low risk - green
  };
  
  const goToSetup = () => {
    navigate('/monitoring/social-media/setup');
  };
  
  const renderContent = () => {
    if (configLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (!monitoringConfig) {
      return (
        <Paper elevation={3} sx={{ p: 4, mb: 4, textAlign: 'center' }}>
          <NotificationsActive sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No Monitoring Configuration Found
          </Typography>
          <Typography variant="body1" paragraph>
            You need to set up social media monitoring first. Please configure which platforms to monitor and for how long.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            size="large" 
            startIcon={<Settings />}
            onClick={goToSetup}
            sx={{ mt: 2 }}
          >
            Setup Monitoring Now
          </Button>
        </Paper>
      );
    }
    
    // If we have a monitoring config, return the main content
    return (
      <div>
        {/* Content will be rendered directly in the main component */}
      </div>
    );
  };
  
  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          Social Media Monitoring
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Settings />}
          onClick={goToSetup}
        >
          {monitoringConfig ? 'Update Monitoring Settings' : 'Setup Monitoring'}
        </Button>
      </Box>
      <Typography variant="body1" color="text.secondary" paragraph>
        Monitor social media platforms for suspicious stock tips and unusual market activity.
      </Typography>
      
      {renderContent()}
      
      {!configLoading && monitoringConfig && (
        <div>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FilterList sx={{ mr: 1 }} />
            <Typography variant="h6">Filters</Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Platform</InputLabel>
                <Select
                  name="platform"
                  value={filters.platform}
                  label="Platform"
                  onChange={handleFilterChange}
                >
                  <MenuItem value="">All Platforms</MenuItem>
                  <MenuItem value="twitter">Twitter</MenuItem>
                  <MenuItem value="reddit">Reddit</MenuItem>
                  <MenuItem value="stocktwits">StockTwits</MenuItem>
                  <MenuItem value="telegram">Telegram</MenuItem>
                  <MenuItem value="discord">Discord</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Analysis Status</InputLabel>
                <Select
                  name="analysisStatus"
                  value={filters.analysisStatus}
                  label="Analysis Status"
                  onChange={handleFilterChange}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="suspicious">Suspicious</MenuItem>
                  <MenuItem value="legitimate">Legitimate</MenuItem>
                  <MenuItem value="flagged">Flagged</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Min Suspicious Score"
                type="number"
                name="suspiciousScoreMin"
                value={filters.suspiciousScoreMin}
                onChange={handleFilterChange}
                InputProps={{ inputProps: { min: 0, max: 100 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Start Date"
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="End Date"
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', alignItems: 'center' }}>
              <Button
                variant="outlined"
                onClick={resetFilters}
                startIcon={<FilterList />}
                sx={{ mr: 1 }}
              >
                Reset
              </Button>
              <Button
                variant="contained"
                onClick={applyFilters}
                startIcon={<Search />}
              >
                Apply Filters
              </Button>
            </Grid>
          </Grid>
        
          {/* Social Media Tips */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Monitored Social Media Tips
                  </Typography>
                  <Button
                    startIcon={<Refresh />}
                    onClick={fetchSocialMediaTips}
                    disabled={loading}
                  >
                    Refresh
                  </Button>
                </Box>
                
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Platform</TableCell>
                          <TableCell>Author</TableCell>
                          <TableCell>Content</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Suspicious Score</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {socialMediaTips.length > 0 ? (
                          socialMediaTips.map((tip) => (
                            <TableRow key={tip.id}>
                              <TableCell>
                                <Chip 
                                  label={tip.platform} 
                                  size="small" 
                                  variant="outlined"
                                  icon={tip.platform === 'twitter' ? <Twitter /> : 
                                        tip.platform === 'reddit' ? <Reddit /> : 
                                        tip.platform === 'stocktwits' ? <Timeline /> : 
                                        tip.platform === 'telegram' ? <Telegram /> : 
                                        tip.platform === 'discord' ? <Chat /> : <Info />}
                                />
                              </TableCell>
                              <TableCell>{tip.author}</TableCell>
                              <TableCell>
                                <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                                  {tip.content.substring(0, 50)}...
                                </Typography>
                              </TableCell>
                              <TableCell>
                                {tip.timestamp ? new Date(tip.timestamp.seconds * 1000).toLocaleDateString() : 'N/A'}
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Box
                                    sx={{
                                      width: 50,
                                      bgcolor: getSuspiciousScoreColor(tip.suspiciousScore || 0),
                                      height: 10,
                                      borderRadius: 5,
                                      mr: 1
                                    }}
                                  />
                                  {tip.suspiciousScore || 0}
                                </Box>
                              </TableCell>
                              <TableCell>
                                {tip.analysisStatus === 'suspicious' && (
                                  <Chip size="small" color="error" label="Suspicious" icon={<Warning />} />
                                )}
                                {tip.analysisStatus === 'legitimate' && (
                                  <Chip size="small" color="success" label="Legitimate" icon={<CheckCircle />} />
                                )}
                                {tip.analysisStatus === 'flagged' && (
                                  <Chip size="small" color="warning" label="Flagged" icon={<Flag />} />
                                )}
                                {tip.analysisStatus === 'pending' && (
                                  <Chip size="small" color="default" label="Pending" icon={<Info />} />
                                )}
                              </TableCell>
                              <TableCell>
                                <Tooltip title="View Details">
                                  <IconButton size="small" onClick={() => handleTipClick(tip)}>
                                    <Info />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Link to Market Activity">
                                  <IconButton size="small" onClick={() => handleLinkToActivity(tip)}>
                                    <Link />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} align="center">
                              No social media tips found. Try adjusting your filters or refreshing.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Paper>
            </Grid>
            
            {/* Market Activity */}
            <Grid item xs={12} md={4}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Recent Market Activity
                  </Typography>
                  <Button
                    startIcon={<Refresh />}
                    onClick={fetchMarketActivity}
                    disabled={loading}
                  >
                    Refresh
                  </Button>
                </Box>
                
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <List>
                    {marketActivity.length > 0 ? (
                      marketActivity.map((activity) => (
                        <Card key={activity.id} sx={{ mb: 2 }}>
                          <CardHeader
                            title={activity.stock}
                            subheader={activity.timestamp ? new Date(activity.timestamp.seconds * 1000).toLocaleDateString() : 'N/A'}
                            action={
                              <IconButton>
                                <MoreVert />
                              </IconButton>
                            }
                          />
                          <CardContent>
                            <Typography variant="body2" color="text.secondary">
                              {activity.type} - {activity.description}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              Price Change: {activity.priceChange > 0 ? '+' : ''}{activity.priceChange}%
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Volume: {activity.volume.toLocaleString()}
                            </Typography>
                            
                            {activity.linkedTips && activity.linkedTips.length > 0 && (
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="body2" fontWeight="bold">
                                  Linked Social Media Tips:
                                </Typography>
                                {activity.linkedTips.map((tipId, index) => {
                                  const tip = socialMediaTips.find(t => t.id === tipId);
                                  return tip ? (
                                    <Chip
                                      key={index}
                                      label={`${tip.platform} - ${tip.author}`}
                                      size="small"
                                      variant="outlined"
                                      sx={{ mr: 1, mt: 1 }}
                                      onClick={() => handleTipClick(tip)}
                                    />
                                  ) : null;
                                })}
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary" align="center">
                        No market activity found.
                      </Typography>
                    )}
                  </List>
                )}
              </Paper>
            </Grid>
          </Grid>
        </div>
      )}
      
      {/* Tip Details Dialog */}
      <Dialog open={openTipDialog} onClose={() => setOpenTipDialog(false)} maxWidth="md" fullWidth>
        {selectedTip && (
          <>
            <DialogTitle>
              Social Media Tip Details
              <IconButton
                aria-label="close"
                onClick={() => setOpenTipDialog(false)}
                sx={{ position: 'absolute', right: 8, top: 8 }}
              >
                <Close />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                  <Typography variant="h6" gutterBottom>
                    Content
                  </Typography>
                  <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
                    <Typography variant="body1">
                      {selectedTip.content}
                    </Typography>
                  </Paper>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">Platform</Typography>
                      <Typography variant="body1">{selectedTip.platform}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">Author</Typography>
                      <Typography variant="body1">{selectedTip.author}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">Posted Date</Typography>
                      <Typography variant="body1">
                        {selectedTip.timestamp ? new Date(selectedTip.timestamp.seconds * 1000).toLocaleString() : 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">URL</Typography>
                      <Typography variant="body1">
                        {selectedTip.url ? (
                          <Link href={selectedTip.url} target="_blank" rel="noopener">
                            View Original Post
                          </Link>
                        ) : 'N/A'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Typography variant="h6" gutterBottom>
                    Analysis
                  </Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2">Suspicious Score</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: '100%',
                          bgcolor: getSuspiciousScoreColor(selectedTip.suspiciousScore || 0),
                          height: 20,
                          borderRadius: 5,
                          mb: 1
                        }}
                      />
                      <Typography variant="h5" sx={{ ml: 2 }}>
                        {selectedTip.suspiciousScore || 0}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2">Current Status</Typography>
                    <Box sx={{ mt: 1 }}>
                      {selectedTip.analysisStatus === 'suspicious' && (
                        <Chip color="error" label="Suspicious" icon={<Warning />} />
                      )}
                      {selectedTip.analysisStatus === 'legitimate' && (
                        <Chip color="success" label="Legitimate" icon={<CheckCircle />} />
                      )}
                      {selectedTip.analysisStatus === 'flagged' && (
                        <Chip color="warning" label="Flagged" icon={<Flag />} />
                      )}
                      {selectedTip.analysisStatus === 'pending' && (
                        <Chip color="default" label="Pending" icon={<Info />} />
                      )}
                    </Box>
                  </Box>
                  
                  <Typography variant="subtitle2">Linked Market Activity</Typography>
                  {selectedTip.linkedActivity && selectedTip.linkedActivity.length > 0 ? (
                    selectedTip.linkedActivity.map((activityId, index) => {
                      const activity = marketActivity.find(a => a.id === activityId);
                      return activity ? (
                        <Chip
                          key={index}
                          label={`${activity.stock} - ${activity.type}`}
                          variant="outlined"
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ) : null;
                    })
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No linked market activity
                    </Typography>
                  )}
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle2">Update Status</Typography>
                  <Box sx={{ mt: 1 }}>
                    <Button
                      variant="contained"
                      color="error"
                      sx={{ mr: 1, mb: 1 }}
                      onClick={() => updateTipStatus(selectedTip.id, 'suspicious', selectedTip.suspiciousScore || 75)}
                    >
                      Mark Suspicious
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      sx={{ mr: 1, mb: 1 }}
                      onClick={() => updateTipStatus(selectedTip.id, 'legitimate', selectedTip.suspiciousScore || 20)}
                    >
                      Mark Legitimate
                    </Button>
                    <Button
                      variant="contained"
                      color="warning"
                      sx={{ mb: 1 }}
                      onClick={() => updateTipStatus(selectedTip.id, 'flagged', selectedTip.suspiciousScore || 50)}
                    >
                      Flag for Review
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenTipDialog(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Link to Activity Dialog */}
      <Dialog open={openLinkDialog} onClose={() => setOpenLinkDialog(false)}>
        <DialogTitle>Link to Market Activity</DialogTitle>
        <DialogContent>
          <Typography variant="body2" paragraph>
            Select market activity to link with this social media tip:
          </Typography>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Market Activity</InputLabel>
            <Select
              value={selectedActivity || ''}
              onChange={(e) => setSelectedActivity(e.target.value)}
              label="Market Activity"
            >
              {marketActivity.map((activity) => (
                <MenuItem key={activity.id} value={activity.id}>
                  {activity.stock} - {activity.type} ({activity.timestamp ? new Date(activity.timestamp.seconds * 1000).toLocaleDateString() : 'N/A'})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLinkDialog(false)}>Cancel</Button>
          <Button onClick={confirmLinkToActivity} variant="contained" disabled={!selectedActivity}>
            Link
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SocialMediaMonitoring;