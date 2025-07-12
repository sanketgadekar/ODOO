import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Grid,
  Avatar,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';

import * as swapService from '../services/swapService';

const statusColors = {
  pending: 'warning',
  accepted: 'info',
  rejected: 'error',
  cancelled: 'default',
  completed: 'success',
};

const Swaps = () => {
  const [tabValue, setTabValue] = useState(0);
  const [sentSwaps, setSentSwaps] = useState([]);
  const [receivedSwaps, setReceivedSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [swapToDelete, setSwapToDelete] = useState(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [swapToUpdate, setSwapToUpdate] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const fetchSwaps = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [sentData, receivedData] = await Promise.all([
        swapService.getSentSwaps(),
        swapService.getReceivedSwaps(),
      ]);
      
      setSentSwaps(sentData);
      setReceivedSwaps(receivedData);
    } catch (err) {
      console.error('Error fetching swaps:', err);
      setError('Failed to load swaps. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSwaps();
  }, []);

  const handleDeleteSwap = async () => {
    if (!swapToDelete) return;
    
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    
    try {
      await swapService.deleteSwap(swapToDelete.id);
      setSentSwaps(sentSwaps.filter(swap => swap.id !== swapToDelete.id));
      setActionSuccess('Swap request deleted successfully.');
    } catch (err) {
      console.error('Error deleting swap:', err);
      setActionError('Failed to delete swap request. Please try again.');
    } finally {
      setActionLoading(false);
      setDeleteDialogOpen(false);
      setSwapToDelete(null);
    }
  };

  const handleUpdateStatus = async () => {
    if (!swapToUpdate || !newStatus) return;
    
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    
    try {
      const updatedSwap = await swapService.updateSwap(swapToUpdate.id, { status: newStatus });
      
      if (tabValue === 0) {
        setSentSwaps(sentSwaps.map(swap => swap.id === updatedSwap.id ? updatedSwap : swap));
      } else {
        setReceivedSwaps(receivedSwaps.map(swap => swap.id === updatedSwap.id ? updatedSwap : swap));
      }
      
      setActionSuccess(`Swap request ${newStatus} successfully.`);
    } catch (err) {
      console.error('Error updating swap status:', err);
      setActionError('Failed to update swap status. Please try again.');
    } finally {
      setActionLoading(false);
      setStatusDialogOpen(false);
      setSwapToUpdate(null);
      setNewStatus('');
    }
  };

  const openDeleteDialog = (swap) => {
    setSwapToDelete(swap);
    setDeleteDialogOpen(true);
  };

  const openStatusDialog = (swap, status) => {
    setSwapToUpdate(swap);
    setNewStatus(status);
    setStatusDialogOpen(true);
  };

  const renderSwapCard = (swap, isSent) => {
    const otherUser = isSent ? swap.provider : swap.requester;
    const canDelete = isSent && swap.status === 'pending';
    const canCancel = isSent && swap.status === 'pending';
    const canAccept = !isSent && swap.status === 'pending';
    const canReject = !isSent && swap.status === 'pending';
    const canComplete = swap.status === 'accepted';
    
    return (
      <Card key={swap.id} sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              {swap.skill_offered?.name || 'Skill Swap'}
            </Typography>
            <Chip
              label={swap.status.toUpperCase()}
              color={statusColors[swap.status] || 'default'}
            />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ mr: 1 }}>
              {otherUser.name.charAt(0)}
            </Avatar>
            <Typography>
              {isSent ? `To: ${otherUser.name}` : `From: ${otherUser.name}`}
            </Typography>
          </Box>
          
          {swap.skill_offered && (
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Skill Offered:</strong> {swap.skill_offered.name}
            </Typography>
          )}
          
          {swap.skill_wanted && (
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Skill Wanted:</strong> {swap.skill_wanted.name}
            </Typography>
          )}
          
          {swap.message && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              <strong>Message:</strong> {swap.message}
            </Typography>
          )}
          
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
            Requested on {new Date(swap.created_at).toLocaleDateString()}
          </Typography>
        </CardContent>
        
        <CardActions>
          <Button
            size="small"
            component={RouterLink}
            to={`/swaps/${swap.id}`}
          >
            View Details
          </Button>
          
          {canDelete && (
            <Button
              size="small"
              color="error"
              onClick={() => openDeleteDialog(swap)}
            >
              Delete
            </Button>
          )}
          
          {canCancel && (
            <Button
              size="small"
              color="warning"
              onClick={() => openStatusDialog(swap, 'cancelled')}
            >
              Cancel
            </Button>
          )}
          
          {canAccept && (
            <Button
              size="small"
              color="success"
              onClick={() => openStatusDialog(swap, 'accepted')}
            >
              Accept
            </Button>
          )}
          
          {canReject && (
            <Button
              size="small"
              color="error"
              onClick={() => openStatusDialog(swap, 'rejected')}
            >
              Reject
            </Button>
          )}
          
          {canComplete && (
            <Button
              size="small"
              color="primary"
              onClick={() => openStatusDialog(swap, 'completed')}
            >
              Mark Completed
            </Button>
          )}
        </CardActions>
      </Card>
    );
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        My Swaps
      </Typography>
      
      {actionError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setActionError(null)}>
          {actionError}
        </Alert>
      )}
      
      {actionSuccess && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setActionSuccess(null)}>
          {actionSuccess}
        </Alert>
      )}
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Sent Requests" />
          <Tab label="Received Requests" />
        </Tabs>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : (
        <>
          {/* Sent Requests Tab */}
          <Box hidden={tabValue !== 0}>
            {sentSwaps.length === 0 ? (
              <Box sx={{ textAlign: 'center', my: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  You haven't sent any swap requests yet.
                </Typography>
                <Button
                  component={RouterLink}
                  to="/search"
                  variant="contained"
                  sx={{ mt: 2 }}
                >
                  Find Skills to Swap
                </Button>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {sentSwaps.map(swap => (
                  <Grid item xs={12} md={6} key={swap.id}>
                    {renderSwapCard(swap, true)}
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
          
          {/* Received Requests Tab */}
          <Box hidden={tabValue !== 1}>
            {receivedSwaps.length === 0 ? (
              <Box sx={{ textAlign: 'center', my: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  You haven't received any swap requests yet.
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {receivedSwaps.map(swap => (
                  <Grid item xs={12} md={6} key={swap.id}>
                    {renderSwapCard(swap, false)}
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Swap Request</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this swap request?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={actionLoading}>
            Cancel
          </Button>
          <Button onClick={handleDeleteSwap} color="error" disabled={actionLoading}>
            {actionLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Status Update Dialog */}
      <Dialog
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
      >
        <DialogTitle>
          {newStatus === 'accepted' ? 'Accept Swap Request' :
           newStatus === 'rejected' ? 'Reject Swap Request' :
           newStatus === 'cancelled' ? 'Cancel Swap Request' :
           newStatus === 'completed' ? 'Complete Swap' : 'Update Status'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {newStatus === 'accepted' ? 'Are you sure you want to accept this swap request?' :
             newStatus === 'rejected' ? 'Are you sure you want to reject this swap request?' :
             newStatus === 'cancelled' ? 'Are you sure you want to cancel this swap request?' :
             newStatus === 'completed' ? 'Are you sure you want to mark this swap as completed?' :
             'Are you sure you want to update the status of this swap?'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)} disabled={actionLoading}>
            No
          </Button>
          <Button
            onClick={handleUpdateStatus}
            color={
              newStatus === 'accepted' ? 'success' :
              newStatus === 'rejected' ? 'error' :
              newStatus === 'cancelled' ? 'warning' :
              newStatus === 'completed' ? 'primary' : 'primary'
            }
            disabled={actionLoading}
          >
            {actionLoading ? 'Updating...' : 'Yes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Swaps;
