import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, TextField, Button, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Card, CardContent, CardHeader, Divider, IconButton, Alert,
  Dialog, DialogActions, DialogContent, DialogTitle, FormControl,
  InputLabel, Select, MenuItem, CircularProgress, Tooltip, Tabs, Tab,
  List, ListItem, ListItemText, ListItemIcon, Rating
} from '@mui/material';
import {
  Refresh, FilterList, VerifiedUser, Warning, CheckCircle, Info,
  History, Search, Assessment, Flag, NotificationsActive, Compare,
  Public, BusinessCenter, FactCheck, Send
} from '@mui/icons-material';
import { 
  getAnnouncements, 
  updateAnnouncementVerification, 
  addCrossReference,
  calculateCredibilityScore,
  verifyWithCounterParty,
  analyzeAnnouncementContent,
  checkAgainstHistoricalFilings,
  checkAgainstPublicDomain,
  sendFraudulentAnnouncementAlert
} from '../../services/corporateAnnouncementService';

const AnnouncementVerification = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    company: '',
    verificationStatus: '',
    startDate: '',
    endDate: ''
  });
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [openAnnouncementDialog, setOpenAnnouncementDialog] = useState(false);
  const [openAlertDialog, setOpenAlertDialog] = useState(false);
  const [alertData, setAlertData] = useState({
    recipients: [],
    alertType: 'warning',
    message: ''
  });
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
      const fetchedAnnouncements = await getAnnouncements(filters);
      setAnnouncements(fetchedAnnouncements);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
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
    fetchAnnouncements();
  };
  
  const resetFilters = () => {
    setFilters({
      company: '',
      verificationStatus: '',
      startDate: '',
      endDate: ''
    });
  };
  
  const handleAnnouncementClick = (announcement) => {
    setSelectedAnnouncement(announcement);
    setOpenAnnouncementDialog(true);
  };
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleVerificationDataChange = (section, field, value) => {
    setVerificationData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };
  
  const handleContentAnalysisChange = (field) => {
    setVerificationData(prev => ({
      ...prev,
      contentAnalysis: {
        ...prev.contentAnalysis,
        [field]: !prev.contentAnalysis[field]
      }
    }));
  };
  
  const handleAlertDataChange = (field, value) => {
    setAlertData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const verifyAnnouncement = async () => {
    if (!selectedAnnouncement) return;
    
    try {
      // Calculate credibility score based on all verification data
      const score = calculateCredibilityScore(
        selectedAnnouncement,
        verificationData.historicalData,
        verificationData.publicDomainData
      );
      
      // Update announcement verification status
      await updateAnnouncementVerification(selectedAnnouncement.id, {
        status: score >= 70 ? 'verified' : score <= 30 ? 'fraudulent' : 'uncertain',
        credibilityScore: score,
        method: 'comprehensive-verification',
        notes: 'Verified using multiple sources and methods',
        appendToHistory: true,
        currentHistory: selectedAnnouncement.verificationHistory || []
      });
      
      // Refresh announcements list
      fetchAnnouncements();
      setOpenAnnouncementDialog(false);
    } catch (error) {
      console.error('Error verifying announcement:', error);
    }
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
  
  const submitHistoricalCheck = async () => {
    if (!selectedAnnouncement) return;
    
    try {
      await checkAgainstHistoricalFilings(selectedAnnouncement.id, {
        ...verificationData.historicalData,
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
      console.error('Error checking against historical filings:', error);
    }
  };
  
  const submitContentAnalysis = async () => {
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
      console.error('Error analyzing announcement content:', error);
    }
  };
  
  const submitPublicDomainCheck = async () => {
    if (!selectedAnnouncement) return;
    
    try {
      await checkAgainstPublicDomain(selectedAnnouncement.id, {
        ...verificationData.publicDomainData,
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
      console.error('Error checking against public domain:', error);
    }
  };
  
  const sendAlert = async () => {
    if (!selectedAnnouncement) return;
    
    try {
      await sendFraudulentAnnouncementAlert(selectedAnnouncement.id, {
        ...alertData,
        appendToAlerts: true,
        currentAlerts: selectedAnnouncement.alerts || []
      });
      
      // Refresh announcements list
      fetchAnnouncements();
      setOpenAlertDialog(false);
    } catch (error) {
      console.error('Error sending alert:', error);
    }
  };
  
  const getCredibilityScoreColor = (score) => {
    if (score >= 70) return '#4caf50'; // High credibility - green
    if (score >= 40) return '#ff9800'; // Medium credibility - orange
    return '#f44336'; // Low credibility - red
  };
  
  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Corporate Announcement Verification
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Verify corporate announcements through cross-verification, historical filings, and public domain information.
      </Typography>
      
      {/* Filters */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FilterList sx={{ mr: 1 }} />
          <Typography variant="h6">Filters</Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Company"
              name="company"
              value={filters.company}
              onChange={handleFilterChange}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Verification Status</InputLabel>
              <Select
                name="verificationStatus"
                value={filters.verificationStatus}
                label="Verification Status"
                onChange={handleFilterChange}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="verified">Verified</MenuItem>
                <MenuItem value="fraudulent">Fraudulent</MenuItem>
                <MenuItem value="uncertain">Uncertain</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Start Date"
              name="startDate"
              type="date"
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
              name="endDate"
              type="date"
              value={filters.endDate}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={resetFilters}
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
      </Paper>
      
      {/* Announcements Table */}
      <Paper elevation={3} sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Corporate Announcements
          </Typography>
          <Button
            startIcon={<Refresh />}
            onClick={fetchAnnouncements}
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
                  <TableCell>Company</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Credibility Score</TableCell>
                  <TableCell>Verification Status</TableCell>
                  <TableCell>Cross References</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {announcements.length > 0 ? (
                  announcements.map((announcement) => (
                    <TableRow key={announcement.id} hover onClick={() => handleAnnouncementClick(announcement)}>
                      <TableCell>{announcement.companyName}</TableCell>
                      <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {announcement.title}
                      </TableCell>
                      <TableCell>{announcement.timestamp ? new Date(announcement.timestamp.seconds * 1000).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: announcement.credibilityScore ? getCredibilityScoreColor(announcement.credibilityScore) : '#9e9e9e',
                              color: 'white',
                              mr: 1
                            }}
                          >
                            {announcement.credibilityScore || 'N/A'}
                          </Box>
                          {announcement.credibilityScore <= 30 && <Warning color="error" />}
                        </Box>
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
                      <TableCell>
                        {announcement.crossReferences ? announcement.crossReferences.length : 0}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Verify">
                          <IconButton size="small" onClick={(e) => {
                            e.stopPropagation();
                            handleAnnouncementClick(announcement);
                          }}>
                            <VerifiedUser fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View Details">
                          <IconButton size="small">
                            <Info fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No announcements found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
      
      {/* Announcement Verification Dialog */}
      <Dialog open={openAnnouncementDialog} onClose={() => setOpenAnnouncementDialog(false)} maxWidth="md" fullWidth>
        {selectedAnnouncement && (
          <>
            <DialogTitle>
              Announcement Verification
              <IconButton
                aria-label="close"
                onClick={() => setOpenAnnouncementDialog(false)}
                sx={{ position: 'absolute', right: 8, top: 8 }}
              >
                <Info />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Company</Typography>
                  <Typography variant="body1" gutterBottom>{selectedAnnouncement.companyName}</Typography>
                  
                  <Typography variant="subtitle2">Title</Typography>
                  <Typography variant="body1" gutterBottom>{selectedAnnouncement.title}</Typography>
                  
                  <Typography variant="subtitle2">Date</Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedAnnouncement.timestamp ? new Date(selectedAnnouncement.timestamp.seconds * 1000).toLocaleString() : 'N/A'}
                  </Typography>
                  
                  <Typography variant="subtitle2">Content</Typography>
                  <Paper variant="outlined" sx={{ p: 2, mt: 1, mb: 2, bgcolor: 'background.default' }}>
                    <Typography variant="body1">{selectedAnnouncement.content}</Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Credibility Score</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: selectedAnnouncement.credibilityScore ? getCredibilityScoreColor(selectedAnnouncement.credibilityScore) : '#9e9e9e',
                        color: 'white',
                        mr: 2,
                        fontSize: '1.2rem'
                      }}
                    >
                      {selectedAnnouncement.credibilityScore || 'N/A'}
                    </Box>
                    <Typography>
                      {selectedAnnouncement.credibilityScore >= 70 ? 'High Credibility' :
                       selectedAnnouncement.credibilityScore >= 40 ? 'Medium Credibility' : 'Low Credibility'}
                    </Typography>
                  </Box>
                  
                  <Typography variant="subtitle2">Current Status</Typography>
                  <Chip
                    label={selectedAnnouncement.verificationStatus || 'pending'}
                    color={
                      selectedAnnouncement.verificationStatus === 'verified' ? 'success' :
                      selectedAnnouncement.verificationStatus === 'fraudulent' ? 'error' :
                      selectedAnnouncement.verificationStatus === 'uncertain' ? 'warning' : 'default'
                    }
                    sx={{ mb: 2 }}
                  />
                  
                  <Typography variant="subtitle2">Cross References</Typography>
                  {selectedAnnouncement.crossReferences && selectedAnnouncement.crossReferences.length > 0 ? (
                    selectedAnnouncement.crossReferences.map((reference, index) => (
                      <Chip
                        key={index}
                        label={reference.source || 'Unknown Source'}
                        variant="outlined"
                        color={reference.sourceType === 'official' ? 'success' : 'default'}
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No cross references
                    </Typography>
                  )}
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={verifyAnnouncement}
                      startIcon={<VerifiedUser />}
                    >
                      Complete Verification
                    </Button>
                    
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => setOpenAlertDialog(true)}
                      startIcon={<NotificationsActive />}
                      disabled={selectedAnnouncement.verificationStatus !== 'fraudulent'}
                    >
                      Send Alert
                    </Button>
                  </Box>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3 }}>
                <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
                  <Tab icon={<BusinessCenter />} label="Counter-Party" />
                  <Tab icon={<History />} label="Historical Filings" />
                  <Tab icon={<Assessment />} label="Content Analysis" />
                  <Tab icon={<Public />} label="Public Domain" />
                </Tabs>
                
                {/* Counter-Party Verification Tab */}
                {activeTab === 0 && (
                  <Box sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Counter-Party Verification
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Verify this announcement with the counter-party company mentioned in the announcement.
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Counter-Party Company ID"
                          value={verificationData.counterParty}
                          onChange={(e) => setVerificationData(prev => ({ ...prev, counterParty: e.target.value }))}
                          margin="normal"
                        />
                      </Grid>
                      <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
                        <Button
                          variant="contained"
                          onClick={verifyWithCounterPartyCompany}
                          disabled={!verificationData.counterParty}
                          sx={{ mt: 2 }}
                          startIcon={<FactCheck />}
                        >
                          Verify with Counter-Party
                        </Button>
                      </Grid>
                    </Grid>
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Counter-Party Verification Status
                      </Typography>
                      <Chip
                        label={selectedAnnouncement.counterPartyVerified === true ? 'Confirmed' : 
                               selectedAnnouncement.counterPartyVerified === false ? 'Contradicted' : 'Not Verified'}
                        color={selectedAnnouncement.counterPartyVerified === true ? 'success' : 
                               selectedAnnouncement.counterPartyVerified === false ? 'error' : 'default'}
                      />
                    </Box>
                  </Box>
                )}
                
                {/* Historical Filings Tab */}
                {activeTab === 1 && (
                  <Box sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Historical Filings Check
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Compare announcement claims with historical performance and previous filings.
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth margin="normal">
                          <InputLabel>Performance Consistency</InputLabel>
                          <Select
                            value={verificationData.historicalData.performanceConsistency === null ? '' : verificationData.historicalData.performanceConsistency}
                            onChange={(e) => handleVerificationDataChange('historicalData', 'performanceConsistency', e.target.value)}
                            label="Performance Consistency"
                          >
                            <MenuItem value="">Select</MenuItem>
                            <MenuItem value={true}>Consistent with Historical Performance</MenuItem>
                            <MenuItem value={false}>Inconsistent with Historical Performance</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth margin="normal">
                          <InputLabel>Sudden Dramatic Claims</InputLabel>
                          <Select
                            value={verificationData.historicalData.suddenDramaticClaims === null ? '' : verificationData.historicalData.suddenDramaticClaims}
                            onChange={(e) => handleVerificationDataChange('historicalData', 'suddenDramaticClaims', e.target.value)}
                            label="Sudden Dramatic Claims"
                          >
                            <MenuItem value="">Select</MenuItem>
                            <MenuItem value={true}>Contains Sudden Dramatic Claims</MenuItem>
                            <MenuItem value={false}>No Sudden Dramatic Claims</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Notes"
                          multiline
                          rows={3}
                          value={verificationData.historicalData.notes}
                          onChange={(e) => handleVerificationDataChange('historicalData', 'notes', e.target.value)}
                          margin="normal"
                        />
                      </Grid>
                      <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          variant="contained"
                          onClick={submitHistoricalCheck}
                          startIcon={<History />}
                        >
                          Submit Historical Check
                        </Button>
                      </Grid>
                    </Grid>
                    
                    {selectedAnnouncement.historicalCheckResult && (
                      <Box sx={{ mt: 2 }}>
                        <Alert severity={selectedAnnouncement.historicalCheckResult.performanceConsistency ? 'success' : 'warning'}>
                          <Typography variant="subtitle2">
                            Historical Check Result: {selectedAnnouncement.historicalCheckResult.performanceConsistency ? 'Consistent' : 'Inconsistent'}
                          </Typography>
                          {selectedAnnouncement.historicalCheckResult.suddenDramaticClaims && (
                            <Typography variant="body2" color="error">
                              Warning: Contains sudden dramatic claims inconsistent with past performance
                            </Typography>
                          )}
                        </Alert>
                      </Box>
                    )}
                  </Box>
                )}
                
                {/* Content Analysis Tab */}
                {activeTab === 2 && (
                  <Box sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Content Analysis
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Analyze the language and claims in the announcement for credibility indicators.
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <FormControl component="fieldset" sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>Negative Indicators</Typography>
                          <Grid container>
                            <Grid item xs={12}>
                              <Button 
                                variant={verificationData.contentAnalysis.vague ? "contained" : "outlined"}
                                color="error"
                                onClick={() => handleContentAnalysisChange('vague')}
                                sx={{ m: 0.5 }}
                              >
                                Vague Language
                              </Button>
                            </Grid>
                            <Grid item xs={12}>
                              <Button 
                                variant={verificationData.contentAnalysis.promotional ? "contained" : "outlined"}
                                color="error"
                                onClick={() => handleContentAnalysisChange('promotional')}
                                sx={{ m: 0.5 }}
                              >
                                Promotional Tone
                              </Button>
                            </Grid>
                            <Grid item xs={12}>
                              <Button 
                                variant={verificationData.contentAnalysis.exaggerated ? "contained" : "outlined"}
                                color="error"
                                onClick={() => handleContentAnalysisChange('exaggerated')}
                                sx={{ m: 0.5 }}
                              >
                                Exaggerated Claims
                              </Button>
                            </Grid>
                          </Grid>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControl component="fieldset" sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>Positive Indicators</Typography>
                          <Grid container>
                            <Grid item xs={12}>
                              <Button 
                                variant={verificationData.contentAnalysis.precise ? "contained" : "outlined"}
                                color="success"
                                onClick={() => handleContentAnalysisChange('precise')}
                                sx={{ m: 0.5 }}
                              >
                                Precise Language
                              </Button>
                            </Grid>
                            <Grid item xs={12}>
                              <Button 
                                variant={verificationData.contentAnalysis.detailed ? "contained" : "outlined"}
                                color="success"
                                onClick={() => handleContentAnalysisChange('detailed')}
                                sx={{ m: 0.5 }}
                              >
                                Detailed Information
                              </Button>
                            </Grid>
                          </Grid>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button
                          variant="contained"
                          onClick={submitContentAnalysis}
                          startIcon={<Assessment />}
                        >
                          Submit Content Analysis
                        </Button>
                      </Grid>
                    </Grid>
                    
                    {selectedAnnouncement.contentAnalysis && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Content Analysis Results
                        </Typography>
                        <Grid container spacing={1}>
                          {selectedAnnouncement.contentAnalysis.vague && (
                            <Grid item><Chip label="Vague" color="error" size="small" /></Grid>
                          )}
                          {selectedAnnouncement.contentAnalysis.promotional && (
                            <Grid item><Chip label="Promotional" color="error" size="small" /></Grid>
                          )}
                          {selectedAnnouncement.contentAnalysis.exaggerated && (
                            <Grid item><Chip label="Exaggerated" color="error" size="small" /></Grid>
                          )}
                          {selectedAnnouncement.contentAnalysis.precise && (
                            <Grid item><Chip label="Precise" color="success" size="small" /></Grid>
                          )}
                          {selectedAnnouncement.contentAnalysis.detailed && (
                            <Grid item><Chip label="Detailed" color="success" size="small" /></Grid>
                          )}
                        </Grid>
                      </Box>
                    )}
                  </Box>
                )}
                
                {/* Public Domain Tab */}
                {activeTab === 3 && (
                  <Box sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Public Domain Information Check
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Verify announcement against information available in the public domain.
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth margin="normal">
                          <InputLabel>Consistent with Public Info</InputLabel>
                          <Select
                            value={verificationData.publicDomainData.consistentWithPublicInfo === null ? '' : verificationData.publicDomainData.consistentWithPublicInfo}
                            onChange={(e) => handleVerificationDataChange('publicDomainData', 'consistentWithPublicInfo', e.target.value)}
                            label="Consistent with Public Info"
                          >
                            <MenuItem value="">Select</MenuItem>
                            <MenuItem value={true}>Consistent with Public Information</MenuItem>
                            <MenuItem value={false}>Inconsistent with Public Information</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth margin="normal">
                          <InputLabel>Unusual Market Activity Before</InputLabel>
                          <Select
                            value={verificationData.publicDomainData.unusualMarketActivityBefore === null ? '' : verificationData.publicDomainData.unusualMarketActivityBefore}
                            onChange={(e) => handleVerificationDataChange('publicDomainData', 'unusualMarketActivityBefore', e.target.value)}
                            label="Unusual Market Activity Before"
                          >
                            <MenuItem value="">Select</MenuItem>
                            <MenuItem value={true}>Unusual Market Activity Detected</MenuItem>
                            <MenuItem value={false}>No Unusual Market Activity</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Sources (comma separated)"
                          value={verificationData.publicDomainData.sources.join(', ')}
                          onChange={(e) => handleVerificationDataChange('publicDomainData', 'sources', e.target.value.split(',').map(s => s.trim()))}
                          margin="normal"
                          placeholder="e.g., Bloomberg, Reuters, SEC filings"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Notes"
                          multiline
                          rows={3}
                          value={verificationData.publicDomainData.notes}
                          onChange={(e) => handleVerificationDataChange('publicDomainData', 'notes', e.target.value)}
                          margin="normal"
                        />
                      </Grid>
                      <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          variant="contained"
                          onClick={submitPublicDomainCheck}
                          startIcon={<Public />}
                        >
                          Submit Public Domain Check
                        </Button>
                      </Grid>
                    </Grid>
                    
                    {selectedAnnouncement.publicDomainCheckResult && (
                      <Box sx={{ mt: 2 }}>
                        <Alert severity={selectedAnnouncement.publicDomainCheckResult.consistentWithPublicInfo ? 'success' : 'warning'}>
                          <Typography variant="subtitle2">
                            Public Domain Check Result: {selectedAnnouncement.publicDomainCheckResult.consistentWithPublicInfo ? 'Consistent' : 'Inconsistent'}
                          </Typography>
                          {selectedAnnouncement.publicDomainCheckResult.unusualMarketActivityBefore && (
                            <Typography variant="body2" color="error">
                              Warning: Unusual market activity detected before announcement
                            </Typography>
                          )}
                          {selectedAnnouncement.publicDomainCheckResult.sources && selectedAnnouncement.publicDomainCheckResult.sources.length > 0 && (
                            <Typography variant="body2">
                              Sources: {selectedAnnouncement.publicDomainCheckResult.sources.join(', ')}
                            </Typography>
                          )}
                        </Alert>
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenAnnouncementDialog(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Alert Dialog */}
      <Dialog open={openAlertDialog} onClose={() => setOpenAlertDialog(false)}>
        <DialogTitle>Send Fraudulent Announcement Alert</DialogTitle>
        <DialogContent>
          <Typography variant="body2" paragraph>
            Send an alert to media houses and investors about this fraudulent announcement.
          </Typography>
          
          <TextField
            fullWidth
            label="Recipients (comma separated)"
            value={alertData.recipients.join(', ')}
            onChange={(e) => handleAlertDataChange('recipients', e.target.value.split(',').map(r => r.trim()))}
            margin="normal"
            placeholder="e.g., media@example.com, investors@example.com"
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Alert Type</InputLabel>
            <Select
              value={alertData.alertType}
              onChange={(e) => handleAlertDataChange('alertType', e.target.value)}
              label="Alert Type"
            >
              <MenuItem value="warning">Warning</MenuItem>
              <MenuItem value="fraud">Fraud Alert</MenuItem>
              <MenuItem value="correction">Correction</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            label="Message"
            multiline
            rows={4}
            value={alertData.message}
            onChange={(e) => handleAlertDataChange('message', e.target.value)}
            margin="normal"
            placeholder="Enter alert message..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAlertDialog(false)}>Cancel</Button>
          <Button 
            onClick={sendAlert} 
            variant="contained" 
            color="error"
            startIcon={<Send />}
            disabled={!alertData.message || alertData.recipients.length === 0}
          >
            Send Alert
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AnnouncementVerification;