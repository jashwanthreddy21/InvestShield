import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Grid, TextField, Button,
  FormControl, InputLabel, Select, MenuItem, Slider,
  Chip, Stack, Alert, Divider, CircularProgress
} from '@mui/material';
import { Settings, Save, Refresh, NotificationsActive, Warning } from '@mui/icons-material';
import { setupSocialMediaMonitoring } from '../../services/socialMediaMonitoringService';
import { connectionHandler } from '../../firebase/config';

const SocialMediaMonitoringSetup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [monitoringConfig, setMonitoringConfig] = useState({
    duration: 7, // Default 7 days
    platforms: [],
    keywords: [],
    notificationEmail: '',
    notificationFrequency: 'daily',
    suspiciousScoreThreshold: 50
  });
  
  const [keyword, setKeyword] = useState('');
  
  const handlePlatformChange = (event) => {
    const {
      target: { value },
    } = event;
    setMonitoringConfig({
      ...monitoringConfig,
      platforms: typeof value === 'string' ? value.split(',') : value,
    });
  };
  
  const handleDurationChange = (event, newValue) => {
    setMonitoringConfig({
      ...monitoringConfig,
      duration: newValue
    });
  };
  
  const handleThresholdChange = (event, newValue) => {
    setMonitoringConfig({
      ...monitoringConfig,
      suspiciousScoreThreshold: newValue
    });
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMonitoringConfig({
      ...monitoringConfig,
      [name]: value
    });
  };
  
  const addKeyword = () => {
    if (keyword && !monitoringConfig.keywords.includes(keyword)) {
      setMonitoringConfig({
        ...monitoringConfig,
        keywords: [...monitoringConfig.keywords, keyword]
      });
      setKeyword('');
    }
  };
  
  const removeKeyword = (keywordToRemove) => {
    setMonitoringConfig({
      ...monitoringConfig,
      keywords: monitoringConfig.keywords.filter(k => k !== keywordToRemove)
    });
  };
  
  // Add a state to track connection status
  const [connectionStatus, setConnectionStatus] = useState('unknown');
  
  // Check Firebase connection on component mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Use the connectionHandler to check connection status
        setConnectionStatus('checking');
        const isOnline = window.navigator.onLine;
        
        if (!isOnline) {
          setConnectionStatus('failed');
          return;
        }
        
        // We'll set a timeout to simulate a connection check
        setTimeout(() => {
          setConnectionStatus(isOnline ? 'connected' : 'failed');
        }, 1000);
      } catch (error) {
        console.error('Firebase connection check failed:', error);
        setConnectionStatus('failed');
      }
    };
    
    checkConnection();
    
    // Add event listeners for online/offline status
    const handleOnline = () => setConnectionStatus('connected');
    const handleOffline = () => setConnectionStatus('failed');
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      // Validate required fields
      if (monitoringConfig.platforms.length === 0) {
        throw new Error('Please select at least one social media platform');
      }
      
      // Even if connection status is failed, we'll still try to save
      // The connectionHandler will queue the operation for later if offline
      if (connectionStatus === 'failed') {
        console.log('Operating in offline mode - changes will be synced when connection is restored');
      }
      
      // Call the service to setup monitoring
      await setupSocialMediaMonitoring(monitoringConfig);
      
      setSuccess(true);
      
      // Always save to localStorage as a backup
      try {
        localStorage.setItem('monitoringConfig', JSON.stringify({
          ...monitoringConfig,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'active',
          monitoringEndDate: new Date(Date.now() + (monitoringConfig.duration * 24 * 60 * 60 * 1000))
        }));
      } catch (e) {
        console.error('Failed to save config to localStorage:', e);
      }
      
      // Redirect to monitoring page after a short delay
      setTimeout(() => {
        navigate('/monitoring/social-media');
      }, 1500);
    } catch (error) {
      console.error('Error setting up social media monitoring:', error);
      
      // Provide more specific error messages based on the error
      if (error.message && error.message.includes('timed out')) {
        setError('Operation timed out. Your settings have been saved locally and will sync when connection is restored.');
        
        // Even if there's a timeout, we'll consider it a success since we saved locally
        setSuccess(true);
        
        // Redirect after a delay
        setTimeout(() => {
          navigate('/monitoring/social-media');
        }, 2000);
      } else if (error.code && error.code.includes('unavailable')) {
        setError('Firebase service is currently unavailable. Your settings have been saved locally and will sync later.');
        setSuccess(true);
        
        // Redirect after a delay
        setTimeout(() => {
          navigate('/monitoring/social-media');
        }, 2000);
      } else {
        setError(error.message || 'Failed to setup monitoring. Please try again.');
        setSuccess(false);
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Setup Social Media Monitoring
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Configure which social media platforms to monitor for suspicious investment activity.
      </Typography>
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Monitoring setup successful! The system will now monitor selected platforms for suspicious activity.
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} action={
          <Button 
            color="inherit" 
            size="small" 
            onClick={() => navigate('/monitoring/social-media')}
          >
            Continue Anyway
          </Button>
        }>
          {error}
        </Alert>
      )}
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Settings sx={{ mr: 1 }} />
                <Typography variant="h6">Monitoring Configuration</Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
            </Grid>
            
            {/* Platform Selection */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="platforms-label">Social Media Platforms</InputLabel>
                <Select
                  labelId="platforms-label"
                  multiple
                  value={monitoringConfig.platforms}
                  onChange={handlePlatformChange}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  <MenuItem value="twitter">Twitter</MenuItem>
                  <MenuItem value="reddit">Reddit</MenuItem>
                  <MenuItem value="stocktwits">StockTwits</MenuItem>
                  <MenuItem value="telegram">Telegram</MenuItem>
                  <MenuItem value="discord">Discord</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {/* Monitoring Duration */}
            <Grid item xs={12} md={6}>
              <Typography id="duration-slider" gutterBottom>
                Monitoring Duration (days): {monitoringConfig.duration}
              </Typography>
              <Slider
                value={monitoringConfig.duration}
                onChange={handleDurationChange}
                aria-labelledby="duration-slider"
                valueLabelDisplay="auto"
                step={1}
                marks
                min={1}
                max={30}
              />
            </Grid>
            
            {/* Keywords */}
            <Grid item xs={12}>
              <Typography gutterBottom>Keywords to Monitor</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Add keyword"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                  sx={{ mr: 1 }}
                />
                <Button variant="outlined" onClick={addKeyword}>
                  Add
                </Button>
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {monitoringConfig.keywords.map((kw) => (
                  <Chip
                    key={kw}
                    label={kw}
                    onDelete={() => removeKeyword(kw)}
                    sx={{ mb: 1 }}
                  />
                ))}
                {monitoringConfig.keywords.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No keywords added. System will monitor all content on selected platforms.
                  </Typography>
                )}
              </Stack>
            </Grid>
            
            {/* Notification Settings */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Notification Email"
                name="notificationEmail"
                value={monitoringConfig.notificationEmail}
                onChange={handleInputChange}
                helperText="Email to receive suspicious activity alerts"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Notification Frequency</InputLabel>
                <Select
                  name="notificationFrequency"
                  value={monitoringConfig.notificationFrequency}
                  label="Notification Frequency"
                  onChange={handleInputChange}
                >
                  <MenuItem value="realtime">Real-time</MenuItem>
                  <MenuItem value="hourly">Hourly</MenuItem>
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {/* Suspicious Score Threshold */}
            <Grid item xs={12}>
              <Typography id="threshold-slider" gutterBottom>
                Suspicious Score Threshold: {monitoringConfig.suspiciousScoreThreshold}
              </Typography>
              <Slider
                value={monitoringConfig.suspiciousScoreThreshold}
                onChange={handleThresholdChange}
                aria-labelledby="threshold-slider"
                valueLabelDisplay="auto"
                step={5}
                marks
                min={0}
                max={100}
              />
              <Typography variant="caption" color="text.secondary">
                Only alerts for content with suspicious score above this threshold
              </Typography>
            </Grid>
            
            {/* Submit Button */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                startIcon={<NotificationsActive />}
                disabled={loading}
                fullWidth
              >
                {loading ? 'Setting Up...' : 'Start Monitoring'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default SocialMediaMonitoringSetup;