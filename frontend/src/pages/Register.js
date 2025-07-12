import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Avatar,
  Button,
  TextField,
  Link,
  Grid,
  Box,
  Typography,
  Container,
  Alert,
  Paper,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
} from '@mui/material';
import { PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import { useAuth } from '../context/AuthContext';

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Enter a valid email')
    .required('Email is required'),
  username: Yup.string()
    .min(3, 'Username should be at least 3 characters')
    .required('Username is required'),
  name: Yup.string()
    .required('Name is required'),
  password: Yup.string()
    .min(8, 'Password should be at least 8 characters')
    .required('Password is required'),
  location: Yup.string(),
  bio: Yup.string(),
  availability: Yup.string()
    .required('Availability is required'),
  visibility: Yup.string()
    .required('Visibility is required'),
});

const Register = () => {
  const { register, loading, error } = useAuth();
  const navigate = useNavigate();
  const [registerError, setRegisterError] = useState(null);

  const formik = useFormik({
    initialValues: {
      email: '',
      username: '',
      name: '',
      password: '',
      location: '',
      bio: '',
      availability: 'anytime',
      visibility: 'public',
    },
    validationSchema,
    onSubmit: async (values) => {
      setRegisterError(null);
      const success = await register(values);
      if (success) {
        navigate('/login');
      } else {
        setRegisterError(error || 'Registration failed. Please try again.');
      }
    },
  });

  return (
    <Container component="main" maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <PersonAddIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Register
          </Typography>
          
          {registerError && (
            <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
              {registerError}
            </Alert>
          )}
          
          <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="name"
                  name="name"
                  required
                  fullWidth
                  id="name"
                  label="Full Name"
                  autoFocus
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="username"
                  label="Username"
                  name="username"
                  autoComplete="username"
                  value={formik.values.username}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.username && Boolean(formik.errors.username)}
                  helperText={formik.touched.username && formik.errors.username}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="location"
                  label="Location (Optional)"
                  id="location"
                  value={formik.values.location}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.location && Boolean(formik.errors.location)}
                  helperText={formik.touched.location && formik.errors.location}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="bio"
                  label="Bio (Optional)"
                  id="bio"
                  multiline
                  rows={3}
                  value={formik.values.bio}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.bio && Boolean(formik.errors.bio)}
                  helperText={formik.touched.bio && formik.errors.bio}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl 
                  fullWidth
                  error={formik.touched.availability && Boolean(formik.errors.availability)}
                >
                  <InputLabel id="availability-label">Availability</InputLabel>
                  <Select
                    labelId="availability-label"
                    id="availability"
                    name="availability"
                    value={formik.values.availability}
                    label="Availability"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  >
                    <MenuItem value="weekdays">Weekdays</MenuItem>
                    <MenuItem value="weekends">Weekends</MenuItem>
                    <MenuItem value="evenings">Evenings</MenuItem>
                    <MenuItem value="mornings">Mornings</MenuItem>
                    <MenuItem value="anytime">Anytime</MenuItem>
                  </Select>
                  {formik.touched.availability && formik.errors.availability && (
                    <FormHelperText>{formik.errors.availability}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl 
                  fullWidth
                  error={formik.touched.visibility && Boolean(formik.errors.visibility)}
                >
                  <InputLabel id="visibility-label">Profile Visibility</InputLabel>
                  <Select
                    labelId="visibility-label"
                    id="visibility"
                    name="visibility"
                    value={formik.values.visibility}
                    label="Profile Visibility"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  >
                    <MenuItem value="public">Public</MenuItem>
                    <MenuItem value="private">Private</MenuItem>
                  </Select>
                  {formik.touched.visibility && formik.errors.visibility && (
                    <FormHelperText>{formik.errors.visibility}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register'}
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link component={RouterLink} to="/login" variant="body2">
                  Already have an account? Login
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;
