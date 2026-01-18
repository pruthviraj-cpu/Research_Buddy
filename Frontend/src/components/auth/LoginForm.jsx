import { useState } from 'react';
import PropTypes from 'prop-types';
import { Eye, EyeOff, User, Lock, Shield, Mail, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import PasswordInput from './PasswordInput.jsx';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const LoginForm = ({ onSuccess }) => {
  const { login, register, loading, error, clearError } = useAuth();
  const [mode, setMode] = useState('login');
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    role: 'user' // default role
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    if (!formData.username.trim()) errors.username = 'Username is required';
    if (mode !== 'reset') {
      if (!formData.password) errors.password = 'Password is required';
      else if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
      if (mode === 'register') {
        if (formData.password !== formData.confirmPassword) {
          errors.confirmPassword = 'Passwords do not match';
        }
      }
    }
    return errors;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const e = { ...prev };
        delete e[field];
        return e;
      });
    }
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length) {
      return setValidationErrors(errors);
    }

    try {
      if (mode === 'login') {
        await login(formData.username, formData.password);
        onSuccess?.();
        navigate('/dashboard');
      } else if (mode === 'register') {
        await register({
          username: formData.username,
          password: formData.password,
          role: formData.role
        });
        // After successful registration, switch to login
        // alert('Account created successfully! Please log in.');
        toast.success('Account created successfully! Please log in.');
        switchMode('login');
      } else if (mode === 'reset') {
        // Password reset not implemented in backend
        toast.info('Password reset functionality is not available yet.');
        // alert('Password reset functionality is not available yet.');
      }
    } catch (err) {
      // Error is handled by AuthContext
      console.error('Auth error:', err);
    }
  };

  const resetForm = () => {
    setFormData({ username: '', password: '', confirmPassword: '' });
    setValidationErrors({});
    if (error) clearError();
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    resetForm();
  };

  return (
    <div className="min-h-screen">
      <div className="login-container">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo"><Shield size={32} /></div>
          <h1>
            {mode === 'login' ? 'Welcome Back' :
              mode === 'register' ? 'Create Account' :
                'Reset Password'}
          </h1>
          <p>Research Paper Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div>
            <label htmlFor="username">Username</label>
            <div className="input-group">
              <User size={18} />
              <input
                id="username"
                type="text"
                className="input-field"
                placeholder="Enter your username"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password">Password</label>
              <PasswordInput
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                showPassword={showPassword}
                toggleShowPassword={() => setShowPassword(showPassword => !showPassword)}
              />
              {validationErrors.password && <p className="error">{validationErrors.password}</p>}
            </div>
            {validationErrors.username && <p className="error">{validationErrors.username}</p>}
          </div>

          {/* {mode !== 'reset' && (
            <div>
              <label htmlFor="password">Password</label>
              <PasswordInput
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                showPassword={showPassword}
                toggleShowPassword={() => setShowPassword(s => !s)}
              />
              {validationErrors.password && <p className="error">{validationErrors.password}</p>}
            </div>
          )} */}

          {mode === 'register' && (
            <div>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-group">
                <Lock size={18} />
                <input
                  id="confirmPassword"
                  type="password"
                  className="input-field"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                />
              </div>
              {validationErrors.confirmPassword && <p className="error">{validationErrors.confirmPassword}</p>}
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label>Account Type</label>
              <div className="role-grid">
                <button
                  type="button"
                  className={`role-button ${formData.role === 'user' ? 'selected' : ''}`}
                  onClick={() => handleInputChange('role', 'user')}
                ><User size={18} />User</button>
                <button
                  type="button"
                  className={`role-button ${formData.role === 'admin' ? 'selected' : ''}`}
                  onClick={() => handleInputChange('role', 'admin')}
                ><Shield size={18} />Admin</button>
              </div>
              <p>Selected Role: {formData.role}</p>
            </div>
          )}

          {error && <p className="error">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? (
              <span className="animate-spin">⟳</span>
            ) : (
              mode === 'login' ? 'Sign In' :
                mode === 'register' ? 'Create Account' :
                  'Send Reset Email'
            )}
          </button>
        </form>

        <div className="auth-links">
          {mode === 'login' && (
            <>
              <p>Don't have an account? <button onClick={() => switchMode('register')}>Sign up</button></p>
              {/* <p>Forgot your password? <button onClick={() => switchMode('reset')}>Reset it</button></p> */}
            </>
          )}
          {mode === 'register' && (
            <p>Already have an account? <button onClick={() => switchMode('login')}>Sign in</button></p>
          )}
          {/* {mode === 'reset' && (
            <p>Remember? <button onClick={() => switchMode('login')}>Sign in</button></p>
          )} */}
        </div>
      </div>
    </div>
  );
};

LoginForm.propTypes = {
  onSuccess: PropTypes.func
};

export default LoginForm;