import { createContext, useContext, useReducer, useEffect } from 'react';
import PropTypes from 'prop-types';

const AuthContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_URL ;


//Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_LOADING':
      return { ...state, loading: true, error: null };
    case 'AUTH_SUCCESS':
      return { 
        ...state, 
        loading: false, 
        user: action.payload.user, 
        token: action.payload.token,
        isAuthenticated: !!action.payload.token, 
        error: null 
      };
    case 'AUTH_ERROR':
      return { 
        ...state, 
        loading: false, 
        error: action.payload, 
        isAuthenticated: false,
        user: null,
        token: null 
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null
};

// In-memory token storage (fallback when localStorage isn't available)
let memoryToken = null;

const getStoredToken = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      return window.localStorage.getItem('auth_token');
    } catch (e) {
      return memoryToken;
    }
  }
  return memoryToken;
};

const setStoredToken = (token) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem('auth_token', token);
    } catch (e) {
      memoryToken = token;
    }
  } else {
    memoryToken = token;
  }
};

const removeStoredToken = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.removeItem('auth_token');
    } catch (e) {
      memoryToken = null;
    }
  } else {
    memoryToken = null;
  }
};

// JWT decode utility
const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

// Check if token is expired
const isTokenExpired = (token) => {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return true;
  return decoded.exp * 1000 < Date.now();
};

// API base URL
// const API_BASE_URL = '${API_BASE_URL}';

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Check for stored token on app initialization
    const initializeAuth = () => {
      const storedToken = getStoredToken();
      
      if (storedToken && !isTokenExpired(storedToken)) {
        const decoded = decodeJWT(storedToken);
        // Create user object from JWT payload (matching backend structure)
        const user = {
          id: decoded.id,
          username: decoded.sub,
          is_admin: decoded.is_admin
        };
        dispatch({ 
          type: 'AUTH_SUCCESS', 
          payload: { 
            token: storedToken, 
            user: user 
          } 
        });
      } else {
        if (storedToken) {
          removeStoredToken();
        }
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Register function - matches your backend POST /auth/
  const register = async (userData) => {
    dispatch({ type: 'AUTH_LOADING' });
    try {
      const response = await fetch(`${API_BASE_URL}/auth/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: userData.username,
          password: userData.password,
          is_admin: userData.role === 'admin'
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Registration failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Note: Your backend doesn't return token on registration
      // User needs to login separately after registration
      dispatch({ type: 'SET_LOADING', payload: false });
      
      return { message: 'User created successfully. Please login.' };
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: error.message });
      throw error;
    }
  };

  // Login function - matches your backend POST /auth/token
  const login = async (username, password) => {
    dispatch({ type: 'AUTH_LOADING' });
    try {
      // Using FormData to match OAuth2PasswordRequestForm expected by backend
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);

      const response = await fetch(`${API_BASE_URL}/auth/token`, {
        method: 'POST',
        body: formData, // Using FormData instead of JSON
      });

      if (!response.ok) {
        let errorMessage = 'Login failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch (e) {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const token = data.access_token;

      // Decode JWT to get user info
      const decoded = decodeJWT(token);
      const user = {
        id: decoded.id,
        username: decoded.sub,
        is_admin: decoded.is_admin
      };

      setStoredToken(token);
      dispatch({ type: 'AUTH_SUCCESS', payload: { token, user } });
      
      return user;
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: error.message });
      throw error;
    }
  };

  // Logout function - simplified since backend doesn't have logout endpoint
  const logout = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // Your backend doesn't have a logout endpoint, so just clear local storage
      removeStoredToken();
      dispatch({ type: 'LOGOUT' });
      
      // Create an event to notify about logout
      window.dispatchEvent(new Event('auth-logout'));
    } catch (error) {
      console.error('Logout failed:', error);
      // Still logout locally even if server call fails
      removeStoredToken();
      dispatch({ type: 'LOGOUT' });
      window.dispatchEvent(new Event('auth-logout'));
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Get authorization headers for API calls
  const getAuthHeaders = () => {
    if (state.token) {
      return {
        'Authorization': `Bearer ${state.token}`,
        'Content-Type': 'application/json',
      };
    }
    return {
      'Content-Type': 'application/json',
    };
  };

  // Get current user from token
  const getCurrentUser = () => {
    if (state.token && !isTokenExpired(state.token)) {
      const decoded = decodeJWT(state.token);
      return {
        id: decoded.id,
        username: decoded.sub,
        is_admin: decoded.is_admin
      };
    }
    return null;
  };

  const value = {
    ...state,
    register,
    login,
    logout,
    clearError,
    getAuthHeaders,
    getCurrentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};