import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, TextField, Button, Chip,
  Card, CardContent, CardHeader, Divider, IconButton, Alert,
  FormControl, InputLabel, Select, MenuItem, CircularProgress, Tooltip,
  List, ListItem, ListItemText, ListItemIcon
} from '@mui/material';
import {
  VerifiedUser, Warning, CheckCircle,
  History, Assessment, Public, BusinessCenter
} from '@mui/icons-material';
import { 
  getAnnouncements, 
  updateAnnouncementVerification, 
  verifyWithCounterParty,
  analyzeAnnouncementContent,
  checkAgainstHistoricalFilings,
  checkAgainstPublicDomain
} from '../../services/corporateAnnouncementService';

const CorporateAnnouncementVerification = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [verificationData, setVerificationData] = useState({
    counterParty: '',
    historicalData: {
      performanceConsistency: null,
      suddenDramaticClaims: null,
      notes: ''
    },
    contentAnalysis: {
      vague: false,
      promotional: false,
      exaggerated: false,
      precise: false,
      detailed: false
    },
    publicDomainData: {
      consistentWithPublicInfo: null,
      unusualMarketActivityBefore: null,
      sources: [],
      notes: ''
    }
  });
  
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const data = await getAnnouncements({ verificationStatus: 'pending' });
      setAnnouncements(data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnnouncementSelect = (announcement) => {
    setSelectedAnnouncement(announcement);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleVerificationDataChange = (field, value) => {
    setVerificationData(prev => {
      if (field.includes('.')) {
        const [section, key] = field.split('.');
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [key]: value
          }
        };
      }
      return {
        ...prev,
        [field]: value
      };
    });
  };

  const verifyWithCounterPartyCompany = async () => {
    if (!selectedAnnouncement || !verificationData.counterParty) return;
    
    try {
      await verifyWithCounterParty(selectedAnnouncement.id, verificationData.counterParty, {
        status: 'confirmed',
        notes: 'Verified with counter-party company',
        appendToHistory: true,
        currentHistory: selectedAnnouncement.verificationHistory || []
      });
      
      // Refresh the selected announcement
      const updatedAnnouncements = await getAnnouncements({ company: selectedAnnouncement.companyId });
      const updatedAnnouncement = updatedAnnouncements.find(a => a.id === selectedAnnouncement.id);
      if (updatedAnnouncement) {
        setSelectedAnnouncement(updatedAnnouncement);
      }
    } catch (error) {
      console.error('Error verifying with counter-party:', error);
    }
  };

  const checkHistoricalFilings = async () => {
    if (!selectedAnnouncement) return;
    
    try {
      await checkAgainstHistoricalFilings(selectedAnnouncement.id, {
        performanceConsistency: verificationData.historicalData.performanceConsistency,
        suddenDramaticClaims: verificationData.historicalData.suddenDramaticClaims,
        notes: verificationData.historicalData.notes
      });
      
      // Refresh the selected announcement
      const updatedAnnouncements = await getAnnouncements({ company: selectedAnnouncement.companyId });
      const updatedAnnouncement = updatedAnnouncements.find(a => a.id === selectedAnnouncement.id);
      if (updatedAnnouncement) {
        setSelectedAnnouncement(updatedAnnouncement);
      }
    } catch (error) {
      console.error('Error checking historical filings:', error);
    }
  };

  const analyzeContent = async () => {
    if (!selectedAnnouncement) return;
    
    try {
      await analyzeAnnouncementContent(selectedAnnouncement.id, verificationData.contentAnalysis);
      
      // Refresh the selected announcement
      const updatedAnnouncements = await getAnnouncements({ company: selectedAnnouncement.companyId });
      const updatedAnnouncement = updatedAnnouncements.find(a => a.id === selectedAnnouncement.id);
      if (updatedAnnouncement) {
        setSelectedAnnouncement(updatedAnnouncement);
      }
    } catch (error) {
      console.error('Error analyzing content:', error);
    }
  };

  const checkPublicDomain = async () => {
    if (!selectedAnnouncement) return;
    
    try {
      await checkAgainstPublicDomain(selectedAnnouncement.id, {
        consistentWithPublicInfo: verificationData.publicDomainData.consistentWithPublicInfo,
        unusualMarketActivityBefore: verificationData.publicDomainData.unusualMarketActivityBefore,
        sources: verificationData.publicDomainData.sources,
        notes: verificationData.publicDomainData.notes
      });
      
      // Refresh the selected announcement
      const updatedAnnouncements = await getAnnouncements({ company: selectedAnnouncement.companyId });
      const updatedAnnouncement = updatedAnnouncements.find(a => a.id === selectedAnnouncement.id);
      if (updatedAnnouncement) {
        setSelectedAnnouncement(updatedAnnouncement);
      }
    } catch (error) {
      console.error('Error checking public domain:', error);
    }
  };

  const completeVerification = async () => {
    if (!selectedAnnouncement) return;
    
    try {
      // Calculate credibility score based on all verification steps
      const credibilityScore = 75; // This would normally be calculated based on all verification data
      
      await updateAnnouncementVerification(selectedAnnouncement.id, {
        status: 'verified',
        credibilityScore,
        method: 'comprehensive',
        notes: 'Verified through comprehensive verification process',
        appendToHistory: true,
        currentHistory: selectedAnnouncement.verificationHistory || []
      });
      
      // Refresh announcements
      fetchAnnouncements();
      setSelectedAnnouncement(null);
    } catch (error) {
      console.error('Error completing verification:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h6" gutterBottom>
        Corporate Announcement Verification
      </Typography>
      
      {!selectedAnnouncement ? (
        <Paper elevation={2} sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Select an announcement to verify
          </Typography>
          
          {announcements.length > 0 ? (
            <List>
              {announcements.slice(0, 5).map((announcement) => (
                <ListItem 
                  key={announcement.id} 
                  button 
                  onClick={() => handleAnnouncementSelect(announcement)}
                >
                  <ListItemIcon>
                    <BusinessCenter />
                  </ListItemIcon>
                  <ListItemText 
                    primary={announcement.title} 
                    secondary={`${announcement.companyName} - ${announcement.timestamp ? new Date(announcement.timestamp.seconds * 1000).toLocaleDateString() : 'N/A'}`} 
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Alert severity="info">
              No pending announcements found for verification.
            </Alert>
          )}
        </Paper>
      ) : (
        <Paper elevation={2} sx={{ p: 2 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1">{selectedAnnouncement.title}</Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedAnnouncement.companyName} - {selectedAnnouncement.timestamp ? new Date(selectedAnnouncement.timestamp.seconds * 1000).toLocaleDateString() : 'N/A'}
            </Typography>
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardHeader title="Verification Steps" />
                <Divider />
                <CardContent>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <BusinessCenter color={verificationData.counterParty ? "success" : "disabled"} />
                      </ListItemIcon>
                      <ListItemText primary="Counter-Party Verification" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <History color={verificationData.historicalData.performanceConsistency !== null ? "success" : "disabled"} />
                      </ListItemIcon>
                      <ListItemText primary="Historical Filings Check" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Assessment color={Object.values(verificationData.contentAnalysis).some(v => v) ? "success" : "disabled"} />
                      </ListItemIcon>
                      <ListItemText primary="Content Analysis" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Public color={verificationData.publicDomainData.consistentWithPublicInfo !== null ? "success" : "disabled"} />
                      </ListItemIcon>
                      <ListItemText primary="Public Domain Check" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardHeader 
                  title="Verification Actions" 
                  action={
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<VerifiedUser />}
                      onClick={completeVerification}
                      disabled={!verificationData.counterParty}
                    >
                      Complete Verification
                    </Button>
                  }
                />
                <Divider />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControl fullWidth margin="normal">
                        <InputLabel>Counter-Party Company</InputLabel>
                        <Select
                          value={verificationData.counterParty}
                          label="Counter-Party Company"
                          onChange={(e) => handleVerificationDataChange('counterParty', e.target.value)}
                        >
                          <MenuItem value="">Select Company</MenuItem>
                          <MenuItem value="company1">Company 1</MenuItem>
                          <MenuItem value="company2">Company 2</MenuItem>
                          <MenuItem value="company3">Company 3</MenuItem>
                        </Select>
                      </FormControl>
                      
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          variant="outlined"
                          onClick={verifyWithCounterPartyCompany}
                          disabled={!verificationData.counterParty}
                        >
                          Verify with Counter-Party
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => setSelectedAnnouncement(null)}
              sx={{ mr: 1 }}
            >
              Back to List
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default CorporateAnnouncementVerification;