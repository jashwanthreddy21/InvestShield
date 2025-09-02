import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Button, TextField, Typography, Paper, Container,
  Grid, CircularProgress, Alert
} from '@mui/material';
import { formatAuthError, hasSessionExpired } from '../../utils/authUtils';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  
  // Check if the user was logged out due to session expiration
  useEffect(() => {
    if (hasSessionExpired()) {
      setSessionExpired(true);
      setError('Your session has expired due to inactivity. Please sign in again.');
      // Clear the flag
      sessionStorage.removeItem('sessionExpired');
    }
  }, []);

  const { email, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!email) {
      setError('Email is required');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Import and use the loginUser function from authService
      const { loginUser } = await import('../../services/authService');
      const user = await loginUser(email, password);
      
      // Import and dispatch Redux actions
      const { loginSuccess } = await import('../../redux/actions/authActions');
      const { default: store } = await import('../../redux/store');
      
      store.dispatch(loginSuccess({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      }));
      
      // Redirect will happen automatically due to isAuthenticated check in App.js
    } catch (error) {
      console.error('Login error:', error);
      // Use formatAuthError to display user-friendly error messages
      setError(formatAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          InvestShield Login
        </Typography>
        <Paper
          elevation={3}
          sx={{
            padding: 3,
            width: '100%',
            marginTop: 3,
          }}
        >
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box component="form" onSubmit={onSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={onChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={onChange}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
            <Grid container>
              <Grid item xs>
                <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
                  <Typography variant="body2" color="primary">
                    Forgot password?
                  </Typography>
                </Link>
              </Grid>
              <Grid item>
                <Link to="/register" style={{ textDecoration: 'none' }}>
                  <Typography variant="body2" color="primary">
                    Don't have an account? Sign Up
                  </Typography>
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;