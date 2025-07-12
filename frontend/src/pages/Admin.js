import React, { useState, useEffect } from 'react';
import { Routes, Route, Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  Button,
  IconButton,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Send as SendIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';

import * as adminService from '../services/adminService';
import { useAuth } from '../context/AuthContext';

// Admin Users Component
const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionType, setActionType] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAction = async () => {
    if (!selectedUser) return;
    
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    
    try {
      let updatedUser;
      
      if (actionType === 'ban') {
        updatedUser = await adminService.banUser(selectedUser.id);
        setActionSuccess(`User ${selectedUser.name} has been banned.`);
      } else if (actionType === 'unban') {
        updatedUser = await adminService.unbanUser(selectedUser.id);
        setActionSuccess(`User ${selectedUser.name} has been unbanned.`);
      } else if (actionType === 'makeAdmin') {
        updatedUser = await adminService.makeUserAdmin(selectedUser.id);
        setActionSuccess(`User ${selectedUser.name} is now an admin.`);
      }
      
      // Update user in the list
      setUsers(users.map(user => user.id === updatedUser.id ? updatedUser : user));
    } catch (err) {
      console.error('Error performing action:', err);
      setActionError(`Failed to ${actionType} user. Please try again.`);
    } finally {
      setActionLoading(false);
      setDialogOpen(false);
      setSelectedUser(null);
      setActionType('');
    }
  };

  const openDialog = (user, type) => {
    setSelectedUser(user);
    setActionType(type);
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Manage Users
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
      
      {error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : (
        <Paper elevation={2}>
          <List>
            {users.map((user) => (
              <ListItem key={user.id} divider>
                <ListItemAvatar>
                  <Avatar src={user.profile_photo}>
                    {user.name.charAt(0)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {user.name}
                      {user.role === 'admin' && (
                        <Chip size="small" label="Admin" color="primary" />
                      )}
                      {user.is_banned && (
                        <Chip size="small" label="Banned" color="error" />
                      )}
                    </Box>
                  }
                  secondary={`@${user.username} | ${user.email}`}
                />
                <ListItemSecondaryAction>
                  {user.is_banned ? (
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      onClick={() => openDialog(user, 'unban')}
                      disabled={actionLoading}
                    >
                      Unban
                    </Button>
                  ) : (
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => openDialog(user, 'ban')}
                      disabled={actionLoading || user.role === 'admin'}
                    >
                      Ban
                    </Button>
                  )}
                  
                  {user.role !== 'admin' && (
                    <Button
                      variant="outlined"
                      color="secondary"
                      size="small"
                      onClick={() => openDialog(user, 'makeAdmin')}
                      disabled={actionLoading || user.is_banned}
                      sx={{ ml: 1 }}
                    >
                      Make Admin
                    </Button>
                  )}
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
      
      {/* Confirmation Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      >
        <DialogTitle>
          {actionType === 'ban' ? 'Ban User' :
           actionType === 'unban' ? 'Unban User' :
           actionType === 'makeAdmin' ? 'Make User Admin' : 'Confirm Action'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {actionType === 'ban' ? `Are you sure you want to ban ${selectedUser?.name}?` :
             actionType === 'unban' ? `Are you sure you want to unban ${selectedUser?.name}?` :
             actionType === 'makeAdmin' ? `Are you sure you want to make ${selectedUser?.name} an admin?` :
             'Are you sure you want to perform this action?'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={actionLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleAction}
            color={actionType === 'ban' ? 'error' : 'primary'}
            disabled={actionLoading}
          >
            {actionLoading ? 'Processing...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Admin Skills Component
const AdminSkills = () => {
  const [pendingSkills, setPendingSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  const fetchPendingSkills = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await adminService.getPendingSkills();
      setPendingSkills(data);
    } catch (err) {
      console.error('Error fetching pending skills:', err);
      setError('Failed to load pending skills. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingSkills();
  }, []);

  const handleApprove = async (skill) => {
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    
    try {
      await adminService.approveSkill(skill.id);
      setPendingSkills(pendingSkills.filter(s => s.id !== skill.id));
      setActionSuccess(`Skill "${skill.name}" approved successfully.`);
    } catch (err) {
      console.error('Error approving skill:', err);
      setActionError('Failed to approve skill. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (skill) => {
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    
    try {
      await adminService.rejectSkill(skill.id);
      setPendingSkills(pendingSkills.filter(s => s.id !== skill.id));
      setActionSuccess(`Skill "${skill.name}" rejected successfully.`);
    } catch (err) {
      console.error('Error rejecting skill:', err);
      setActionError('Failed to reject skill. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Moderate Skills
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
      
      {error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : pendingSkills.length === 0 ? (
        <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No pending skills to moderate.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {pendingSkills.map((skill) => (
            <Grid item xs={12} sm={6} md={4} key={skill.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {skill.name}
                  </Typography>
                  
                  {skill.description && (
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {skill.description}
                    </Typography>
                  )}
                  
                  <Typography variant="body2">
                    <strong>User:</strong> {skill.user?.name || 'Unknown'}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    startIcon={<CheckCircleIcon />}
                    color="success"
                    onClick={() => handleApprove(skill)}
                    disabled={actionLoading}
                  >
                    Approve
                  </Button>
                  <Button
                    startIcon={<CancelIcon />}
                    color="error"
                    onClick={() => handleReject(skill)}
                    disabled={actionLoading}
                  >
                    Reject
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

// Admin Swaps Component
const AdminSwaps = () => {
  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchSwaps = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await adminService.getAllSwaps(statusFilter);
      setSwaps(data);
    } catch (err) {
      console.error('Error fetching swaps:', err);
      setError('Failed to load swaps. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSwaps();
  }, [statusFilter]);

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Monitor Swaps
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <TextField
          select
          label="Filter by Status"
          value={statusFilter}
          onChange={handleStatusFilterChange}
          SelectProps={{
            native: true,
          }}
          variant="outlined"
          size="small"
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
          <option value="completed">Completed</option>
        </TextField>
      </Box>
      
      {error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : swaps.length === 0 ? (
        <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No swaps found with the selected filter.
          </Typography>
        </Paper>
      ) : (
        <List>
          {swaps.map((swap) => (
            <Paper key={swap.id} elevation={1} sx={{ mb: 2 }}>
              <ListItem
                component={RouterLink}
                to={`/swaps/${swap.id}`}
                sx={{ textDecoration: 'none', color: 'inherit' }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle1">
                        {swap.skill_offered?.name || 'Skill Swap'}
                      </Typography>
                      <Chip
                        label={swap.status.toUpperCase()}
                        color={
                          swap.status === 'pending' ? 'warning' :
                          swap.status === 'accepted' ? 'info' :
                          swap.status === 'rejected' ? 'error' :
                          swap.status === 'cancelled' ? 'default' :
                          swap.status === 'completed' ? 'success' : 'default'
                        }
                        size="small"
                      />
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography variant="body2">
                        From: {swap.requester.name} → To: {swap.provider.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Created: {new Date(swap.created_at).toLocaleDateString()}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            </Paper>
          ))}
        </List>
      )}
    </Box>
  );
};

// Admin Stats Component
const AdminStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await adminService.getPlatformStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to load statistics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

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

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Platform Statistics
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h3" color="primary">
              {stats?.total_users || 0}
            </Typography>
            <Typography variant="subtitle1">
              Total Users
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h3" color="primary">
              {stats?.active_users || 0}
            </Typography>
            <Typography variant="subtitle1">
              Active Users
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h3" color="primary">
              {stats?.total_skills_offered || 0}
            </Typography>
            <Typography variant="subtitle1">
              Skills Offered
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h3" color="primary">
              {stats?.total_skills_wanted || 0}
            </Typography>
            <Typography variant="subtitle1">
              Skills Wanted
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
        Swaps by Status
      </Typography>
      
      <Grid container spacing={2}>
        {stats?.swaps_by_status && Object.entries(stats.swaps_by_status).map(([status, count]) => (
          <Grid item xs={6} sm={4} md={2} key={status}>
            <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h5" color="primary">
                {count}
              </Typography>
              <Typography variant="body2">
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
      
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Total Swaps
        </Typography>
        <Typography variant="h3" color="primary">
          {stats?.total_swaps || 0}
        </Typography>
      </Box>
    </Box>
  );
};

// Admin Messaging Component
const AdminMessaging = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || !message.trim()) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await adminService.sendPlatformMessage(title, message);
      setSuccess(`Message sent successfully to ${result.recipients_count} users.`);
      setTitle('');
      setMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Platform Messaging
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}
      
      <Paper elevation={2} sx={{ p: 3 }}>
        <form onSubmit={handleSendMessage}>
          <TextField
            fullWidth
            label="Message Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="Message Content"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            multiline
            rows={4}
            required
            sx={{ mb: 3 }}
          />
          
          <Button
            type="submit"
            variant="contained"
            startIcon={<SendIcon />}
            disabled={loading || !title.trim() || !message.trim()}
          >
            {loading ? 'Sending...' : 'Send Platform-Wide Message'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

// Main Admin Component
const Admin = () => {
  const [tabValue, setTabValue] = useState(0);
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
    }
  }, [isAdmin, navigate]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <AdminIcon sx={{ mr: 1 }} />
        <Typography variant="h4">
          Admin Panel
        </Typography>
      </Box>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Users" />
          <Tab label="Skills" />
          <Tab label="Swaps" />
          <Tab label="Statistics" />
          <Tab label="Messaging" />
        </Tabs>
      </Paper>
      
      {tabValue === 0 && <AdminUsers />}
      {tabValue === 1 && <AdminSkills />}
      {tabValue === 2 && <AdminSwaps />}
      {tabValue === 3 && <AdminStats />}
      {tabValue === 4 && <AdminMessaging />}
    </Box>
  );
};

export default Admin;
