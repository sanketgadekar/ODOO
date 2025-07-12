import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Container,
} from '@mui/material';
import {
  SwapHoriz as SwapIcon,
  Search as SearchIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <Container>
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to Skill Swap Platform
        </Typography>
        
        <Typography variant="h5" color="text.secondary" paragraph>
          Exchange your skills with others in your community.
          Teach what you know, learn what you don't.
        </Typography>
        
        <Box sx={{ mt: 4, mb: 6 }}>
          {!isAuthenticated ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button
                component={RouterLink}
                to="/register"
                variant="contained"
                size="large"
                color="primary"
              >
                Get Started
              </Button>
              <Button
                component={RouterLink}
                to="/login"
                variant="outlined"
                size="large"
              >
                Login
              </Button>
            </Box>
          ) : (
            <Button
              component={RouterLink}
              to="/search"
              variant="contained"
              size="large"
              color="primary"
              startIcon={<SearchIcon />}
            >
              Find Skills
            </Button>
          )}
        </Box>
        
        <Grid container spacing={4} sx={{ mt: 4 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <SwapIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" component="h2" gutterBottom>
                  Swap Skills
                </Typography>
                <Typography>
                  List the skills you can offer and find people who can teach you what you want to learn.
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button
                  component={RouterLink}
                  to={isAuthenticated ? "/swaps" : "/register"}
                  size="small"
                >
                  Learn More
                </Button>
              </CardActions>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <SearchIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" component="h2" gutterBottom>
                  Find Skills
                </Typography>
                <Typography>
                  Search for specific skills you want to learn or people looking for skills you can teach.
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button
                  component={RouterLink}
                  to={isAuthenticated ? "/search" : "/register"}
                  size="small"
                >
                  Learn More
                </Button>
              </CardActions>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <PersonIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" component="h2" gutterBottom>
                  Build Profile
                </Typography>
                <Typography>
                  Create your profile, list your skills, and build a reputation through feedback from others.
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button
                  component={RouterLink}
                  to={isAuthenticated ? "/profile" : "/register"}
                  size="small"
                >
                  Learn More
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Home;
