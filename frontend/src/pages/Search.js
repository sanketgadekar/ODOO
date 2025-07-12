import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

import * as skillService from '../services/skillService';

const Search = () => {
  const [query, setQuery] = useState('');
  const [skillType, setSkillType] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await skillService.searchSkills(query, skillType || null);
      setResults(data);
      setSearched(true);
    } catch (err) {
      console.error('Error searching skills:', err);
      setError('Failed to search skills. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Search Skills
      </Typography>
      
      <Box component="form" onSubmit={handleSearch} sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={5}>
            <TextField
              fullWidth
              label="Search for skills"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Photoshop, Excel, Guitar"
            />
          </Grid>
          <Grid item xs={12} sm={3} md={3}>
            <FormControl fullWidth>
              <InputLabel id="skill-type-label">Skill Type</InputLabel>
              <Select
                labelId="skill-type-label"
                id="skill-type"
                value={skillType}
                label="Skill Type"
                onChange={(e) => setSkillType(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="offered">Skills Offered</MenuItem>
                <MenuItem value="wanted">Skills Wanted</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3} md={2}>
            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading || !query.trim()}
              startIcon={<SearchIcon />}
            >
              Search
            </Button>
          </Grid>
        </Grid>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {searched && (
            <Typography variant="h6" gutterBottom>
              {results.length} {results.length === 1 ? 'result' : 'results'} found
            </Typography>
          )}
          
          <Grid container spacing={3}>
            {results.map((skill) => (
              <Grid item xs={12} sm={6} md={4} key={`${skill.skill_type}-${skill.skill_id}`}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" component="div">
                        {skill.name}
                      </Typography>
                      <Chip
                        label={skill.skill_type === 'offered' ? 'Offered' : 'Wanted'}
                        color={skill.skill_type === 'offered' ? 'primary' : 'secondary'}
                        size="small"
                      />
                    </Box>
                    
                    {skill.description && (
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {skill.description}
                      </Typography>
                    )}
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                      <Avatar
                        sx={{ width: 32, height: 32, mr: 1 }}
                      >
                        {skill.user_name.charAt(0)}
                      </Avatar>
                      <Typography variant="body2">
                        {skill.user_name}
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      component={RouterLink}
                      to={`/users/${skill.user_id}`}
                    >
                      View Profile
                    </Button>
                    {skill.skill_type === 'offered' && (
                      <Button
                        size="small"
                        color="primary"
                        component={RouterLink}
                        to={`/swaps/new?provider=${skill.user_id}&skill=${skill.skill_id}`}
                      >
                        Request Swap
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {searched && results.length === 0 && (
            <Box sx={{ textAlign: 'center', my: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No results found. Try a different search term or filter.
              </Typography>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default Search;
