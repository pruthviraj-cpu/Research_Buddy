# import { useState } from 'react';
# import PropTypes from 'prop-types';
# import { Eye, EyeOff, User, Lock, Shield, Mail, UserPlus } from 'lucide-react';
# import { useAuth } from '../../context/AuthContext.jsx';
# import GoogleSignInButton from './GoogleSignInButton.jsx';
# import PasswordInput from './PasswordInput.jsx';

# const LoginForm = ({ onSuccess }) => {
#   const { login, register, resetPassword, loading, error, clearError } = useAuth();
#   const [mode, setMode] = useState('login');
#   const [formData, setFormData] = useState({
#     email: '',
#     password: '',
#     name: '',
#     role: 'user',
#     confirmPassword: ''
#   });
#   const [showPassword, setShowPassword] = useState(false);
#   const [validationErrors, setValidationErrors] = useState({});

#   const validateForm = () => {
#     const errors = {};
#     if (!formData.email.trim()) errors.email = 'Email is required';
#     else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
#     if (mode !== 'reset') {
#       if (!formData.password) errors.password = 'Password is required';
#       else if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
#       if (mode === 'register') {
#         if (!formData.name.trim()) errors.name = 'Name is required';
#         if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
#       }
#     }
#     return errors;
#   };

#   const handleInputChange = (field, value) => {
#     setFormData(prev => ({ ...prev, [field]: value }));
#     if (validationErrors[field]) {
#       setValidationErrors(prev => { const e = { ...prev }; delete e[field]; return e; });
#     }
#     if (error) clearError();
#   };

#   const handleSubmit = async e => {
#     e.preventDefault();
#     const errors = validateForm();
#     if (Object.keys(errors).length) return setValidationErrors(errors);
#     try {
#       if (mode === 'login') { await login(formData.email, formData.password); onSuccess?.(); }
#       else if (mode === 'register') { await register({ ...formData }); onSuccess?.(); }
#       else { await resetPassword(formData.email); alert('Password reset email sent!'); setMode('login'); }
#     } catch {}
#   };

#   const resetForm = () => {
#     setFormData({ email: '', password: '', name: '', role: 'user', confirmPassword: '' });
#     setValidationErrors({});
#     if (error) clearError();
#   };

#   const switchMode = newMode => { setMode(newMode); resetForm(); };

#   const demoCredentials = [
#     { email: 'admin@research.com', password: 'admin123', label: 'Admin Demo' },
#     { email: 'user@research.com', password: 'user123', label: 'User Demo' }
#   ];

#   const fillDemo = cred => {
#     setFormData({ ...formData, email: cred.email, password: cred.password });
#     setValidationErrors({});
#     if (error) clearError();
#   };

#   return (
#     <div className="min-h-screen">
#       <div className="login-container">
#         {/* Header */}
#         <div className="auth-header">
#           <div className="auth-logo"><Shield size={32} /></div>
#           <h1>
#             {mode === 'login' ? 'Welcome Back' :
#              mode === 'register' ? 'Create Account' :
#              'Reset Password'}
#           </h1>
#           <p>Research Paper Management System</p>
#         </div>

#         {mode === 'login' && (
#           <>
#             <GoogleSignInButton onSuccess={onSuccess} disabled={loading} />
#             <div className="divider"><span>or continue with email</span></div>
#           </>
#         )}

#         <form onSubmit={handleSubmit} className="auth-form">
#           {mode === 'register' && (
#             <div>
#               <label htmlFor="name">Full Name</label>
#               <div className="input-group">
#                 <User size={18} />
#                 <input
#                   id="name"
#                   type="text"
#                   className="input-field"
#                   placeholder="Enter your full name"
#                   value={formData.name}
#                   onChange={e => handleInputChange('name', e.target.value)}
#                 />
#               </div>
#               {validationErrors.name && <p className="error">{validationErrors.name}</p>}
#             </div>
#           )}

#           <div>
#             <label htmlFor="email">Email Address</label>
#             <div className="input-group">
#               <Mail size={18} />
#               <input
#                 id="email"
#                 type="email"
#                 className="input-field"
#                 placeholder="Enter your email"
#                 value={formData.email}
#                 onChange={e => handleInputChange('email', e.target.value)}
#               />
#             </div>
#             {validationErrors.email && <p className="error">{validationErrors.email}</p>}
#           </div>

#           {mode !== 'reset' && (
#   <div>
#     <label htmlFor="password">Password</label>
#     <PasswordInput
#       value={formData.password}
#       onChange={e => handleInputChange('password', e.target.value)}
#       showPassword={showPassword}
#       toggleShowPassword={() => setShowPassword(s => !s)}
#     />
#   </div>
# )}


#           {mode === 'register' && (
#             <div>
#               <label htmlFor="confirmPassword">Confirm Password</label>
#               <div className="input-group">
#                 <Lock size={18} />
#                 <input
#                   id="confirmPassword"
#                   type="password"
#                   className="input-field"
#                   placeholder="Confirm your password"
#                   value={formData.confirmPassword}
#                   onChange={e => handleInputChange('confirmPassword', e.target.value)}
#                 />
#               </div>
#               {validationErrors.confirmPassword && <p className="error">{validationErrors.confirmPassword}</p>}
#             </div>
#           )}

#           {mode === 'register' && (
#             <div>
#               <label>Account Type</label>
#               <div className="role-grid">
#                 <button
#                   type="button"
#                   className={`role-button ${formData.role==='user'?'selected':''}`}
#                   onClick={()=>handleInputChange('role','user')}
#                 ><User size={18}/>User</button>
#                 <button
#                   type="button"
#                   className={`role-button ${formData.role==='admin'?'selected':''}`}
#                   onClick={()=>handleInputChange('role','admin')}
#                 ><Shield size={18}/>Admin</button>
#               </div>
#             </div>
#           )}

#           {error && <p className="error">{error}</p>}

#           <button type="submit" disabled={loading} className="btn-primary">
#             {loading 
#               ? <span className="animate-spin" /> 
#               : (mode==='login'?'Sign In':mode==='register'?'Create Account':'Send Reset Email')}
#           </button>
#         </form>

#         <div className="auth-links">
#           {mode==='login' && <>
#             <p>Don't have an account? <button onClick={()=>switchMode('register')}>Sign up</button></p>
#             <p>Forgot your password? <button onClick={()=>switchMode('reset')}>Reset it</button></p>
#           </>}
#           {mode==='register' && <>
#             <p>Already have an account? <button onClick={()=>switchMode('login')}>Sign in</button></p>
#           </>}
#           {mode==='reset' && <p>Remember? <button onClick={()=>switchMode('login')}>Sign in</button></p>}
#         </div>

#         {mode==='login' && <div className="demo-section">
#           <p>Demo Accounts</p>
#           <div className="demo-buttons">
#             {demoCredentials.map(c=>(
#               <button key={c.label} className="demo-button" onClick={()=>fillDemo(c)} disabled={loading}>
#                 <strong>{c.label}:</strong> {c.email}
#               </button>
#             ))}
#           </div>
#         </div>}
#       </div>
#     </div>
#   );
# };

# LoginForm.propTypes = { onSuccess: PropTypes.func };
# export default LoginForm;
