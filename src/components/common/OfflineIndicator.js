import React, { useState, useEffect } from 'react';
import { Box, Badge, Tooltip, IconButton, Drawer, List, ListItem, ListItemText, Typography, Divider } from '@mui/material';
import { CloudOff, Sync } from '@mui/icons-material';
import offlineSyncManager from '../../utils/offlineSync';

/**
 * OfflineIndicator Component
 * Displays offline status and pending operations
 */
const OfflineIndicator = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pendingOperations, setPendingOperations] = useState([]);

  useEffect(() => {
    // Update offline status and pending operations
    const updateStatus = () => {
      setIsOffline(!navigator.onLine);
      setPendingCount(offlineSyncManager.pendingOperations.length);
      setPendingOperations(offlineSyncManager.pendingOperations);
    };

    // Set up event listeners
    const handleOnline = () => {
      setIsOffline(false);
      updateStatus();
    };

    const handleOffline = () => {
      setIsOffline(true);
      updateStatus();
    };

    const handleSyncComplete = () => {
      updateStatus();
    };

    // Initial status
    updateStatus();

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('firebaseOnline', handleOnline);
    window.addEventListener('firebaseOffline', handleOffline);
    window.addEventListener('offlineSyncComplete', handleSyncComplete);

    // Check for changes in pending operations every 2 seconds
    const interval = setInterval(updateStatus, 2000);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('firebaseOnline', handleOnline);
      window.removeEventListener('firebaseOffline', handleOffline);
      window.removeEventListener('offlineSyncComplete', handleSyncComplete);
      clearInterval(interval);
    };
  }, []);

  // Only show if offline or has pending operations
  if (!isOffline && pendingCount === 0) {
    return null;
  }

  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  // Get operation type display
  const getOperationTypeDisplay = (type) => {
    switch (type) {
      case 'create': return 'Create';
      case 'update': return 'Update';
      case 'delete': return 'Delete';
      default: return type;
    }
  };

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000,
        }}
      >
        <Tooltip title={isOffline ? 'You are offline' : `${pendingCount} operations pending sync`}>
          <IconButton
            color="primary"
            onClick={() => setDrawerOpen(true)}
            sx={{
              backgroundColor: 'background.paper',
              boxShadow: 3,
              '&:hover': { backgroundColor: 'background.default' },
            }}
          >
            <Badge badgeContent={pendingCount} color="error">
              {isOffline ? <CloudOff /> : <Sync />}
            </Badge>
          </IconButton>
        </Tooltip>
      </Box>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 300, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            {isOffline ? 'Offline Mode' : 'Pending Synchronization'}
          </Typography>
          
          {isOffline && (
            <Typography variant="body2" color="text.secondary" paragraph>
              You are currently offline. Changes will be synchronized when your connection is restored.
            </Typography>
          )}
          
          {pendingCount > 0 ? (
            <>
              <Typography variant="subtitle2" gutterBottom>
                {pendingCount} operation{pendingCount !== 1 ? 's' : ''} pending
              </Typography>
              <Divider sx={{ my: 1 }} />
              <List dense>
                {pendingOperations.map((op) => (
                  <ListItem key={op.id}>
                    <ListItemText
                      primary={`${getOperationTypeDisplay(op.type)}: ${op.path.split('/').pop()}`}
                      secondary={`Queued at ${formatTime(op.timestamp)}`}
                    />
                  </ListItem>
                ))}
              </List>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No pending operations.
            </Typography>
          )}
        </Box>
      </Drawer>
    </>
  );
};

export default OfflineIndicator;