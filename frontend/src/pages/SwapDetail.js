import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Avatar,
  Chip,
  Button,
  Divider,
  TextField,
  Rating,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import * as swapService from '../services/swapService';
import { useAuth } from '../context/AuthContext';

const statusColors = {
  pending: 'warning',
  accepted: 'info',
  rejected: 'error',
  cancelled: 'default',
  completed: 'success',
};

const SwapDetail = () => {
  const { swapId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [swap, setSwap] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  
  const fetchSwapDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const swapData = await swapService.getSwap(swapId);
      setSwap(swapData);
      
      const feedbackData = await swapService.getSwapFeedback(swapId);
      setFeedback(feedbackData);
    } catch (err) {
      console.error('Error fetching swap details:', err);
      setError('Failed to load swap details. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchSwapDetails();
  }, [swapId]);
  
  const handleUpdateStatus = async () => {
    if (!swap || !newStatus) return;
    
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    
    try {
      const updatedSwap = await swapService.updateSwap(swap.id, { status: newStatus });
      setSwap(updatedSwap);
      setActionSuccess(`Swap request ${newStatus} successfully.`);
      
      if (newStatus === 'completed') {
        setShowFeedbackForm(true);
      }
    } catch (err) {
      console.error('Error updating swap status:', err);
      setActionError('Failed to update swap status. Please try again.');
    } finally {
      setActionLoading(false);
      setStatusDialogOpen(false);
      setNewStatus('');
    }
  };
  
  const openStatusDialog = (status) => {
    setNewStatus(status);
    setStatusDialogOpen(true);
  };
  
  const feedbackFormik = useFormik({
    initialValues: {
      rating: 5,
      comment: '',
    },
    validationSchema: Yup.object({
      rating: Yup.number().required('Rating is required').min(1).max(5),
      comment: Yup.string(),
    }),
    onSubmit: async (values, { resetForm }) => {
      setActionLoading(true);
      setActionError(null);
      setActionSuccess(null);
      
      try {
        const otherUserId = user.id === swap.requester.id ? swap.provider.id : swap.requester.id;
        
        await swapService.createFeedback({
          swap_id: swap.id,
          receiver_id: otherUserId,
          rating: values.rating,
          comment: values.comment,
        });
        
        resetForm();
        setShowFeedbackForm(false);
        setActionSuccess('Feedback submitted successfully.');
        
        // Refresh feedback
        const feedbackData = await swapService.getSwapFeedback(swapId);
        setFeedback(feedbackData);
      } catch (err) {
        console.error('Error submitting feedback:', err);
        setActionError('Failed to submit feedback. Please try again.');
      } finally {
        setActionLoading(false);
      }
    },
  });
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }
  
  if (!swap) {
    return (
      <Box sx={{ textAlign: 'center', my: 4 }}>
        <Typography variant="h5" color="text.secondary">
          Swap not found
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/swaps')}
          sx={{ mt: 2 }}
        >
          Back to Swaps
        </Button>
      </Box>
    );
  }
  
  const isRequester = user.id === swap.requester.id;
  const otherUser = isRequester ? swap.provider : swap.requester;
  const canCancel = isRequester && swap.status === 'pending';
  const canAccept = !isRequester && swap.status === 'pending';
  const canReject = !isRequester && swap.status === 'pending';
  const canComplete = swap.status === 'accepted';
  const canGiveFeedback = swap.status === 'completed' && !feedback.some(f => f.giver.id === user.id);
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Swap Details
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
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">
            {swap.skill_offered?.name || 'Skill Swap'}
          </Typography>
          <Chip
            label={swap.status.toUpperCase()}
            color={statusColors[swap.status] || 'default'}
            size="large"
          />
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Requester
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ mr: 1 }}>
                {swap.requester.name.charAt(0)}
              </Avatar>
              <Typography>
                {swap.requester.name}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Provider
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ mr: 1 }}>
                {swap.provider.name.charAt(0)}
              </Avatar>
              <Typography>
                {swap.provider.name}
              </Typography>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Skill Offered
            </Typography>
            {swap.skill_offered ? (
              <Typography variant="body1">
                {swap.skill_offered.name}
                {swap.skill_offered.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {swap.skill_offered.description}
                  </Typography>
                )}
              </Typography>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No specific skill offered
              </Typography>
            )}
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Skill Wanted
            </Typography>
            {swap.skill_wanted ? (
              <Typography variant="body1">
                {swap.skill_wanted.name}
                {swap.skill_wanted.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {swap.skill_wanted.description}
                  </Typography>
                )}
              </Typography>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No specific skill wanted
              </Typography>
            )}
          </Grid>
        </Grid>
        
        {swap.message && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>
              Message
            </Typography>
            <Typography variant="body1">
              {swap.message}
            </Typography>
          </>
        )}
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Requested on {new Date(swap.created_at).toLocaleDateString()}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {canCancel && (
              <Button
                variant="outlined"
                color="warning"
                onClick={() => openStatusDialog('cancelled')}
                disabled={actionLoading}
              >
                Cancel Request
              </Button>
            )}
            
            {canAccept && (
              <Button
                variant="contained"
                color="success"
                onClick={() => openStatusDialog('accepted')}
                disabled={actionLoading}
              >
                Accept
              </Button>
            )}
            
            {canReject && (
              <Button
                variant="outlined"
                color="error"
                onClick={() => openStatusDialog('rejected')}
                disabled={actionLoading}
              >
                Reject
              </Button>
            )}
            
            {canComplete && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => openStatusDialog('completed')}
                disabled={actionLoading}
              >
                Mark Completed
              </Button>
            )}
            
            {canGiveFeedback && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => setShowFeedbackForm(true)}
                disabled={actionLoading}
              >
                Give Feedback
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
      
      {/* Feedback Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Feedback
        </Typography>
        
        {showFeedbackForm && (
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Give Feedback to {otherUser.name}
            </Typography>
            
            <form onSubmit={feedbackFormik.handleSubmit}>
              <Box sx={{ mb: 2 }}>
                <Typography component="legend">Rating</Typography>
                <Rating
                  name="rating"
                  value={feedbackFormik.values.rating}
                  onChange={(event, newValue) => {
                    feedbackFormik.setFieldValue('rating', newValue);
                  }}
                  precision={1}
                  size="large"
                />
              </Box>
              
              <TextField
                fullWidth
                id="comment"
                name="comment"
                label="Comment (Optional)"
                multiline
                rows={3}
                value={feedbackFormik.values.comment}
                onChange={feedbackFormik.handleChange}
                sx={{ mb: 2 }}
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={() => setShowFeedbackForm(false)}
                  disabled={actionLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Submitting...' : 'Submit Feedback'}
                </Button>
              </Box>
            </form>
          </Paper>
        )}
        
        {feedback.length === 0 ? (
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mt: 3 }}>
            No feedback has been given yet.
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {feedback.map((item) => (
              <Grid item xs={12} key={item.id}>
                <Paper elevation={1} sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar>
                        {item.giver.name.charAt(0)}
                      </Avatar>
                      <Typography variant="subtitle1">
                        {item.giver.name} → {item.receiver.name}
                      </Typography>
                    </Box>
                    <Rating value={item.rating} readOnly />
                  </Box>
                  
                  {item.comment && (
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      "{item.comment}"
                    </Typography>
                  )}
                  
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    {new Date(item.created_at).toLocaleDateString()}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
      
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

export default SwapDetail;
