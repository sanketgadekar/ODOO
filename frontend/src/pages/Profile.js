import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Avatar,
  Button,
  Tabs,
  Tab,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import { useAuth } from '../context/AuthContext';
import * as skillService from '../services/skillService';
import * as swapService from '../services/swapService';

// Profile validation schema
const profileValidationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  username: Yup.string().required('Username is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  location: Yup.string(),
  bio: Yup.string(),
  availability: Yup.string().required('Availability is required'),
  visibility: Yup.string().required('Visibility is required'),
});

// Skill validation schema
const skillValidationSchema = Yup.object({
  name: Yup.string().required('Skill name is required'),
  description: Yup.string(),
});

const Profile = () => {
  const { user, updateProfile, uploadProfilePhoto, loading, error } = useAuth();
  
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [skillsOffered, setSkillsOffered] = useState([]);
  const [skillsWanted, setSkillsWanted] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [addingSkillOffered, setAddingSkillOffered] = useState(false);
  const [addingSkillWanted, setAddingSkillWanted] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [skillToDelete, setSkillToDelete] = useState(null);
  const [skillType, setSkillType] = useState('');
  const [profileError, setProfileError] = useState(null);
  const [profileSuccess, setProfileSuccess] = useState(null);
  
  // Profile form
  const profileFormik = useFormik({
    initialValues: {
      name: user?.name || '',
      username: user?.username || '',
      email: user?.email || '',
      location: user?.location || '',
      bio: user?.bio || '',
      availability: user?.availability || 'anytime',
      visibility: user?.visibility || 'public',
    },
    validationSchema: profileValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setProfileError(null);
      setProfileSuccess(null);
      
      try {
        await updateProfile(values);
        setEditMode(false);
        setProfileSuccess('Profile updated successfully');
      } catch (err) {
        setProfileError('Failed to update profile');
      }
    },
  });
  
  // Skill offered form
  const skillOfferedFormik = useFormik({
    initialValues: {
      name: '',
      description: '',
    },
    validationSchema: skillValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        await skillService.createSkillOffered(values);
        fetchSkillsOffered();
        setAddingSkillOffered(false);
        resetForm();
      } catch (err) {
        console.error('Error adding skill offered:', err);
      }
    },
  });
  
  // Skill wanted form
  const skillWantedFormik = useFormik({
    initialValues: {
      name: '',
      description: '',
    },
    validationSchema: skillValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        await skillService.createSkillWanted(values);
        fetchSkillsWanted();
        setAddingSkillWanted(false);
        resetForm();
      } catch (err) {
        console.error('Error adding skill wanted:', err);
      }
    },
  });
  
  // Fetch user's skills and feedback
  useEffect(() => {
    if (user) {
      fetchSkillsOffered();
      fetchSkillsWanted();
      fetchFeedback();
    }
  }, [user]);
  
  const fetchSkillsOffered = async () => {
    try {
      const data = await skillService.getSkillsOffered();
      setSkillsOffered(data);
    } catch (err) {
      console.error('Error fetching skills offered:', err);
    }
  };
  
  const fetchSkillsWanted = async () => {
    try {
      const data = await skillService.getSkillsWanted();
      setSkillsWanted(data);
    } catch (err) {
      console.error('Error fetching skills wanted:', err);
    }
  };
  
  const fetchFeedback = async () => {
    try {
      const data = await swapService.getReceivedFeedback();
      setFeedback(data);
    } catch (err) {
      console.error('Error fetching feedback:', err);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        await uploadProfilePhoto(file);
        setProfileSuccess('Profile photo updated successfully');
      } catch (err) {
        setProfileError('Failed to upload profile photo');
      }
    }
  };
  
  const handleDeleteSkill = async () => {
    if (!skillToDelete || !skillType) return;
    
    try {
      if (skillType === 'offered') {
        await skillService.deleteSkillOffered(skillToDelete.id);
        fetchSkillsOffered();
      } else if (skillType === 'wanted') {
        await skillService.deleteSkillWanted(skillToDelete.id);
        fetchSkillsWanted();
      }
    } catch (err) {
      console.error('Error deleting skill:', err);
    } finally {
      setDeleteDialogOpen(false);
      setSkillToDelete(null);
      setSkillType('');
    }
  };
  
  const openDeleteDialog = (skill, type) => {
    setSkillToDelete(skill);
    setSkillType(type);
    setDeleteDialogOpen(true);
  };
  
  if (!user) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h5">Loading profile...</Typography>
      </Box>
    );
  }
  
  return (
    <Box>
      {profileError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {profileError}
        </Alert>
      )}
      
      {profileSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {profileSuccess}
        </Alert>
      )}
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar
              src={user.profile_photo ? `http://localhost:8000${user.profile_photo}` : undefined}
              alt={user.name}
              sx={{ width: 150, height: 150, mb: 2 }}
            >
              {user.name.charAt(0)}
            </Avatar>
            
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="photo-upload"
              type="file"
              onChange={handlePhotoUpload}
            />
            <label htmlFor="photo-upload">
              <Button
                variant="outlined"
                component="span"
                sx={{ mb: 2 }}
                disabled={loading}
              >
                Change Photo
              </Button>
            </label>
          </Grid>
          
          <Grid item xs={12} md={8}>
            {editMode ? (
              <Box component="form" onSubmit={profileFormik.handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="name"
                      name="name"
                      label="Full Name"
                      value={profileFormik.values.name}
                      onChange={profileFormik.handleChange}
                      onBlur={profileFormik.handleBlur}
                      error={profileFormik.touched.name && Boolean(profileFormik.errors.name)}
                      helperText={profileFormik.touched.name && profileFormik.errors.name}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="username"
                      name="username"
                      label="Username"
                      value={profileFormik.values.username}
                      onChange={profileFormik.handleChange}
                      onBlur={profileFormik.handleBlur}
                      error={profileFormik.touched.username && Boolean(profileFormik.errors.username)}
                      helperText={profileFormik.touched.username && profileFormik.errors.username}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="email"
                      name="email"
                      label="Email"
                      value={profileFormik.values.email}
                      onChange={profileFormik.handleChange}
                      onBlur={profileFormik.handleBlur}
                      error={profileFormik.touched.email && Boolean(profileFormik.errors.email)}
                      helperText={profileFormik.touched.email && profileFormik.errors.email}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="location"
                      name="location"
                      label="Location"
                      value={profileFormik.values.location}
                      onChange={profileFormik.handleChange}
                      onBlur={profileFormik.handleBlur}
                      error={profileFormik.touched.location && Boolean(profileFormik.errors.location)}
                      helperText={profileFormik.touched.location && profileFormik.errors.location}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="bio"
                      name="bio"
                      label="Bio"
                      multiline
                      rows={3}
                      value={profileFormik.values.bio}
                      onChange={profileFormik.handleChange}
                      onBlur={profileFormik.handleBlur}
                      error={profileFormik.touched.bio && Boolean(profileFormik.errors.bio)}
                      helperText={profileFormik.touched.bio && profileFormik.errors.bio}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel id="availability-label">Availability</InputLabel>
                      <Select
                        labelId="availability-label"
                        id="availability"
                        name="availability"
                        value={profileFormik.values.availability}
                        label="Availability"
                        onChange={profileFormik.handleChange}
                      >
                        <MenuItem value="weekdays">Weekdays</MenuItem>
                        <MenuItem value="weekends">Weekends</MenuItem>
                        <MenuItem value="evenings">Evenings</MenuItem>
                        <MenuItem value="mornings">Mornings</MenuItem>
                        <MenuItem value="anytime">Anytime</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel id="visibility-label">Profile Visibility</InputLabel>
                      <Select
                        labelId="visibility-label"
                        id="visibility"
                        name="visibility"
                        value={profileFormik.values.visibility}
                        label="Profile Visibility"
                        onChange={profileFormik.handleChange}
                      >
                        <MenuItem value="public">Public</MenuItem>
                        <MenuItem value="private">Private</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => setEditMode(false)}
                      startIcon={<CancelIcon />}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={loading}
                      startIcon={<SaveIcon />}
                    >
                      Save
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            ) : (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h4">{user.name}</Typography>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => setEditMode(true)}
                  >
                    Edit Profile
                  </Button>
                </Box>
                
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  @{user.username}
                </Typography>
                
                <Typography variant="body1" paragraph>
                  <strong>Email:</strong> {user.email}
                </Typography>
                
                {user.location && (
                  <Typography variant="body1" paragraph>
                    <strong>Location:</strong> {user.location}
                  </Typography>
                )}
                
                {user.bio && (
                  <Typography variant="body1" paragraph>
                    <strong>Bio:</strong> {user.bio}
                  </Typography>
                )}
                
                <Typography variant="body1" paragraph>
                  <strong>Availability:</strong> {user.availability.charAt(0).toUpperCase() + user.availability.slice(1)}
                </Typography>
                
                <Typography variant="body1" paragraph>
                  <strong>Profile Visibility:</strong> {user.visibility.charAt(0).toUpperCase() + user.visibility.slice(1)}
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>
      
      <Box sx={{ mb: 4 }}>
        <Tabs value={tabValue} onChange={handleTabChange} centered>
          <Tab label="Skills Offered" />
          <Tab label="Skills Wanted" />
          <Tab label="Feedback" />
        </Tabs>
        
        {/* Skills Offered Tab */}
        <Box hidden={tabValue !== 0} sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">Skills I Offer</Typography>
            {!addingSkillOffered ? (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setAddingSkillOffered(true)}
              >
                Add Skill
              </Button>
            ) : (
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => setAddingSkillOffered(false)}
              >
                Cancel
              </Button>
            )}
          </Box>
          
          {addingSkillOffered && (
            <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
              <form onSubmit={skillOfferedFormik.handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="name"
                      name="name"
                      label="Skill Name"
                      value={skillOfferedFormik.values.name}
                      onChange={skillOfferedFormik.handleChange}
                      onBlur={skillOfferedFormik.handleBlur}
                      error={skillOfferedFormik.touched.name && Boolean(skillOfferedFormik.errors.name)}
                      helperText={skillOfferedFormik.touched.name && skillOfferedFormik.errors.name}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="description"
                      name="description"
                      label="Description"
                      multiline
                      rows={2}
                      value={skillOfferedFormik.values.description}
                      onChange={skillOfferedFormik.handleChange}
                      onBlur={skillOfferedFormik.handleBlur}
                      error={skillOfferedFormik.touched.description && Boolean(skillOfferedFormik.errors.description)}
                      helperText={skillOfferedFormik.touched.description && skillOfferedFormik.errors.description}
                    />
                  </Grid>
                  <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button type="submit" variant="contained">
                      Add
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          )}
          
          {skillsOffered.length === 0 ? (
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mt: 3 }}>
              You haven't added any skills yet.
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {skillsOffered.map((skill) => (
                <Grid item xs={12} sm={6} md={4} key={skill.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {skill.name}
                      </Typography>
                      {skill.description && (
                        <Typography variant="body2" color="text.secondary">
                          {skill.description}
                        </Typography>
                      )}
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        Status: {skill.status.charAt(0).toUpperCase() + skill.status.slice(1)}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'flex-end' }}>
                      <IconButton
                        color="error"
                        onClick={() => openDeleteDialog(skill, 'offered')}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
        
        {/* Skills Wanted Tab */}
        <Box hidden={tabValue !== 1} sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">Skills I Want</Typography>
            {!addingSkillWanted ? (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setAddingSkillWanted(true)}
              >
                Add Skill
              </Button>
            ) : (
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => setAddingSkillWanted(false)}
              >
                Cancel
              </Button>
            )}
          </Box>
          
          {addingSkillWanted && (
            <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
              <form onSubmit={skillWantedFormik.handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="name"
                      name="name"
                      label="Skill Name"
                      value={skillWantedFormik.values.name}
                      onChange={skillWantedFormik.handleChange}
                      onBlur={skillWantedFormik.handleBlur}
                      error={skillWantedFormik.touched.name && Boolean(skillWantedFormik.errors.name)}
                      helperText={skillWantedFormik.touched.name && skillWantedFormik.errors.name}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="description"
                      name="description"
                      label="Description"
                      multiline
                      rows={2}
                      value={skillWantedFormik.values.description}
                      onChange={skillWantedFormik.handleChange}
                      onBlur={skillWantedFormik.handleBlur}
                      error={skillWantedFormik.touched.description && Boolean(skillWantedFormik.errors.description)}
                      helperText={skillWantedFormik.touched.description && skillWantedFormik.errors.description}
                    />
                  </Grid>
                  <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button type="submit" variant="contained">
                      Add
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          )}
          
          {skillsWanted.length === 0 ? (
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mt: 3 }}>
              You haven't added any skills you want to learn yet.
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {skillsWanted.map((skill) => (
                <Grid item xs={12} sm={6} md={4} key={skill.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {skill.name}
                      </Typography>
                      {skill.description && (
                        <Typography variant="body2" color="text.secondary">
                          {skill.description}
                        </Typography>
                      )}
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'flex-end' }}>
                      <IconButton
                        color="error"
                        onClick={() => openDeleteDialog(skill, 'wanted')}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
        
        {/* Feedback Tab */}
        <Box hidden={tabValue !== 2} sx={{ mt: 3 }}>
          <Typography variant="h5" gutterBottom>
            Feedback Received
          </Typography>
          
          {feedback.length === 0 ? (
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mt: 3 }}>
              You haven't received any feedback yet.
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {feedback.map((item) => (
                <Grid item xs={12} key={item.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar src={item.giver.profile_photo ? `http://localhost:8000${item.giver.profile_photo}` : undefined}>
                            {item.giver.name.charAt(0)}
                          </Avatar>
                          <Typography variant="subtitle1">
                            {item.giver.name}
                          </Typography>
                        </Box>
                        <Typography variant="h6" color="primary">
                          Rating: {item.rating}/5
                        </Typography>
                      </Box>
                      
                      {item.comment && (
                        <Typography variant="body1" sx={{ mt: 2 }}>
                          "{item.comment}"
                        </Typography>
                      )}
                      
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        {new Date(item.created_at).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Box>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Skill</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the skill "{skillToDelete?.name}"?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteSkill} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;
