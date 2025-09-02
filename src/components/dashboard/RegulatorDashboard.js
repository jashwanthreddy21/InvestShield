import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Tabs,
  Tab,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { 
  Warning, 
  CheckCircle, 
  PriorityHigh, 
  Visibility, 
  Block,
  Flag
} from '@mui/icons-material';
import { getSocialMediaTips } from '../../services/socialMediaMonitoringService';
import { getAnnouncements } from '../../services/corporateAnnouncementService';
import useFirebaseOperation from '../../hooks/useFirebaseOperation';

const RegulatorDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [suspiciousTips, setSuspiciousTips] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState('');
  const [actionNotes, setActionNotes] = useState('');
  const [actionSeverity, setActionSeverity] = useState('medium');
  
  // Use our custom hook for Firebase operations with offline support
  const { loading, error, executeOperation, isOffline } = useFirebaseOperation();

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Load suspicious tips
  useEffect(() => {
    const loadSuspiciousTips = async () => {
      try {
        // Use our custom hook to handle Firebase operations with offline support
        const tips = await executeOperation(
          () => getSocialMediaTips({ suspiciousScoreMin: 70 }, 20),
          { 
            offlineFallback: true,
            fallbackData: sampleSocialMediaTips,
            operationMeta: { type: 'read', path: 'socialMediaTips' }
          }
        );
        setSuspiciousTips(tips.length > 0 ? tips : sampleSocialMediaTips);
      } catch (err) {
        console.error('Error loading suspicious tips:', err);
        setSuspiciousTips(sampleSocialMediaTips);
      }
    };

    loadSuspiciousTips();
  }, [executeOperation]);
  
  // Sample social media tips data
  const sampleSocialMediaTips = [
    {
      id: 'tip1',
      stockSymbol: 'AAPL',
      platform: 'Twitter',
      author: '@techinsider',
      content: 'Heard from reliable source that AAPL will announce revolutionary AI chip next week. Stock will soar! #investing #stocks',
      suspiciousScore: 85,
      timestamp: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'tip2',
      stockSymbol: 'TSLA',
      platform: 'Reddit',
      author: 'ev_bull',
      content: 'TSLA production numbers leaked. Q3 deliveries 50% higher than analyst expectations. This is going to explode tomorrow!',
      suspiciousScore: 92,
      timestamp: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 'tip3',
      stockSymbol: 'AMZN',
      platform: 'StockTwits',
      author: 'retail_guru',
      content: 'Amazon about to announce major acquisition in AI space. Board approved $10B deal yesterday. $AMZN',
      suspiciousScore: 78,
      timestamp: new Date(Date.now() - 10800000).toISOString()
    },
    {
      id: 'tip4',
      stockSymbol: 'NVDA',
      platform: 'Twitter',
      author: '@chip_insider',
      content: 'NVIDIA chip shortage worse than reported. Next earnings will disappoint big time. Sell now before it crashes.',
      suspiciousScore: 81,
      timestamp: new Date(Date.now() - 14400000).toISOString()
    },
    {
      id: 'tip5',
      stockSymbol: 'META',
      platform: 'Discord',
      author: 'metaverse_whale',
      content: 'Meta\'s new VR headset has major hardware flaw. Recall coming next week. This will tank the stock.',
      suspiciousScore: 88,
      timestamp: new Date(Date.now() - 18000000).toISOString()
    }
  ];

  // Load announcements
  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        // Use our custom hook to handle Firebase operations with offline support
        const data = await executeOperation(
          () => getAnnouncements({ verificationStatus: 'pending' }, 20),
          { 
            offlineFallback: true,
            fallbackData: sampleAnnouncements,
            operationMeta: { type: 'read', path: 'announcements' }
          }
        );
        setAnnouncements(data.length > 0 ? data : sampleAnnouncements);
      } catch (err) {
        console.error('Error loading announcements:', err);
        setAnnouncements(sampleAnnouncements);
      }
    };

    loadAnnouncements();
  }, [executeOperation]);
  
  // Sample corporate announcements data
  const sampleAnnouncements = [
    {
      id: 'ann1',
      company: 'TechCorp Inc.',
      title: 'TechCorp Announces Quarterly Earnings Above Expectations',
      content: 'TechCorp Inc. today announced quarterly earnings of $2.5B, exceeding analyst expectations by 15%. The company attributes this success to strong growth in its cloud services division.',
      date: new Date(Date.now() - 86400000).toISOString(),
      verificationStatus: 'pending',
      credibilityScore: 85,
      source: 'Company Press Release'
    },
    {
      id: 'ann2',
      company: 'Global Pharma Ltd.',
      title: 'Global Pharma Receives FDA Approval for New Drug',
      content: 'Global Pharma Ltd. has received FDA approval for its groundbreaking treatment for diabetes. The company expects the drug to generate $1B in annual revenue by 2025.',
      date: new Date(Date.now() - 172800000).toISOString(),
      verificationStatus: 'pending',
      credibilityScore: 92,
      source: 'Regulatory Filing'
    },
    {
      id: 'ann3',
      company: 'EnergyX Corp',
      title: 'EnergyX Discovers Major Oil Reserve',
      content: 'EnergyX Corp has discovered a major oil reserve in the Gulf of Mexico estimated to contain 500 million barrels. Production is expected to begin within 18 months.',
      date: new Date(Date.now() - 259200000).toISOString(),
      verificationStatus: 'pending',
      credibilityScore: 78,
      source: 'Industry News'
    },
    {
      id: 'ann4',
      company: 'Retail Giants Inc.',
      title: 'Retail Giants to Close 200 Stores Nationwide',
      content: 'Retail Giants Inc. has announced plans to close 200 underperforming stores nationwide as part of its restructuring plan. The company expects to save $300M annually from these closures.',
      date: new Date(Date.now() - 345600000).toISOString(),
      verificationStatus: 'pending',
      credibilityScore: 88,
      source: 'Company Statement'
    },
    {
      id: 'ann5',
      company: 'AgriTech Solutions',
      title: 'AgriTech Solutions Acquires FarmData Systems',
      content: 'AgriTech Solutions has completed the acquisition of FarmData Systems for $450M. This acquisition will strengthen AgriTech\'s position in the agricultural technology market.',
      date: new Date(Date.now() - 432000000).toISOString(),
      verificationStatus: 'pending',
      credibilityScore: 82,
      source: 'Merger Announcement'
    }
  ];

  // Open action dialog
  const handleOpenDialog = (item, type) => {
    setSelectedItem(item);
    setActionType(type);
    setDialogOpen(true);
  };

  // Close action dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedItem(null);
    setActionType('');
    setActionNotes('');
    setActionSeverity('medium');
  };

  // Submit regulatory action
  const handleSubmitAction = async () => {
    try {
      // Prepare action data
      const actionData = {
        timestamp: new Date(),
        type: actionType,
        notes: actionNotes,
        severity: actionSeverity,
        itemId: selectedItem.id,
        itemType: tabValue === 0 ? 'socialMediaTip' : 'announcement'
      };

      // In a real app, we would submit this to a regulatory actions collection
      console.log('Submitting regulatory action:', actionData);
      
      // Close dialog
      handleCloseDialog();
      
      // Show success message
      alert('Regulatory action submitted successfully');
      
    } catch (err) {
      console.error('Error submitting regulatory action:', err);
      alert('Error submitting regulatory action');
    }
  };

  // Render suspicious tip card
  const renderTipCard = (tip) => {
    return (
      <Card key={tip.id} sx={{ mb: 2, border: tip._isOffline ? '1px dashed #999' : 'none' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="h6">{tip.stockSymbol}</Typography>
            <Chip 
              icon={<Warning />} 
              label={`Score: ${tip.suspiciousScore || 'N/A'}`}
              color={tip.suspiciousScore > 80 ? 'error' : 'warning'}
              size="small"
            />
          </Box>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Platform: {tip.platform} | Author: {tip.author}
          </Typography>
          
          <Typography variant="body1">
            {tip.content}
          </Typography>
          
          {tip._isOffline && (
            <Alert severity="info" sx={{ mt: 1 }}>
              This item is stored offline and will sync when connection is restored.
            </Alert>
          )}
        </CardContent>
        <CardActions>
          <Button 
            size="small" 
            startIcon={<Visibility />}
            onClick={() => handleOpenDialog(tip, 'monitor')}
          >
            Monitor
          </Button>
          <Button 
            size="small" 
            color="warning"
            startIcon={<Flag />}
            onClick={() => handleOpenDialog(tip, 'flag')}
          >
            Flag
          </Button>
          <Button 
            size="small" 
            color="error"
            startIcon={<Block />}
            onClick={() => handleOpenDialog(tip, 'block')}
          >
            Block
          </Button>
        </CardActions>
      </Card>
    );
  };

  // Render announcement card
  const renderAnnouncementCard = (announcement) => {
    return (
      <Card key={announcement.id} sx={{ mb: 2, border: announcement._isOffline ? '1px dashed #999' : 'none' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="h6">{announcement.company}</Typography>
            <Chip 
              icon={announcement.verificationStatus === 'verified' ? <CheckCircle /> : <PriorityHigh />} 
              label={announcement.verificationStatus || 'pending'}
              color={announcement.verificationStatus === 'verified' ? 'success' : 'default'}
              size="small"
            />
          </Box>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Date: {announcement.date ? new Date(announcement.date).toLocaleDateString() : 'N/A'} | 
            Score: {announcement.credibilityScore || 'N/A'}
          </Typography>
          
          <Typography variant="body1">
            {announcement.title}
          </Typography>
          
          {announcement._isOffline && (
            <Alert severity="info" sx={{ mt: 1 }}>
              This item is stored offline and will sync when connection is restored.
            </Alert>
          )}
        </CardContent>
        <CardActions>
          <Button 
            size="small" 
            startIcon={<Visibility />}
            onClick={() => handleOpenDialog(announcement, 'review')}
          >
            Review
          </Button>
          <Button 
            size="small" 
            color="success"
            startIcon={<CheckCircle />}
            onClick={() => handleOpenDialog(announcement, 'verify')}
          >
            Verify
          </Button>
          <Button 
            size="small" 
            color="error"
            startIcon={<Block />}
            onClick={() => handleOpenDialog(announcement, 'reject')}
          >
            Reject
          </Button>
        </CardActions>
      </Card>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Regulatory Dashboard
      </Typography>
      
      {isOffline && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          You are currently offline. Some features may be limited and changes will sync when your connection is restored.
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error.message}
        </Alert>
      )}
      
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Suspicious Stock Tips" />
          <Tab label="Corporate Announcements" />
        </Tabs>
      </Paper>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          {tabValue === 0 && (
            <>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  Suspicious Stock Tips ({suspiciousTips.length})
                </Typography>
              </Box>
              
              {suspiciousTips.length > 0 ? (
                suspiciousTips.map(tip => renderTipCard(tip))
              ) : (
                <Alert severity="info">No suspicious stock tips found.</Alert>
              )}
            </>
          )}
          
          {tabValue === 1 && (
            <>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  Pending Corporate Announcements ({announcements.length})
                </Typography>
              </Box>
              
              {announcements.length > 0 ? (
                announcements.map(announcement => renderAnnouncementCard(announcement))
              ) : (
                <Alert severity="info">No pending corporate announcements found.</Alert>
              )}
            </>
          )}
        </Box>
      )}
      
      {/* Action Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {actionType === 'monitor' && 'Monitor Stock Tip'}
          {actionType === 'flag' && 'Flag Stock Tip'}
          {actionType === 'block' && 'Block Stock Tip'}
          {actionType === 'review' && 'Review Announcement'}
          {actionType === 'verify' && 'Verify Announcement'}
          {actionType === 'reject' && 'Reject Announcement'}
        </DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                {tabValue === 0 ? selectedItem.stockSymbol : selectedItem.company}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {tabValue === 0 ? selectedItem.content : selectedItem.title}
              </Typography>
              
              <FormControl fullWidth margin="normal">
                <InputLabel>Action Severity</InputLabel>
                <Select
                  value={actionSeverity}
                  onChange={(e) => setActionSeverity(e.target.value)}
                  label="Action Severity"
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                multiline
                rows={4}
                margin="normal"
                label="Notes"
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder="Enter your notes about this regulatory action"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmitAction} 
            variant="contained" 
            color={actionType === 'verify' ? 'success' : actionType === 'block' || actionType === 'reject' ? 'error' : 'primary'}
            disabled={isOffline}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RegulatorDashboard;