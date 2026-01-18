import { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

function PasswordInput({ value, onChange, showPassword, toggleShowPassword }) {
  // <PasswordInput
  //               value={formData.password}
  //               onChange={(e) => handleInputChange('password', e.target.value)}
  //               showPassword={showPassword}
  //               toggleShowPassword={() => setShowPassword(s => !s)}
  //             />

  return (
    <div className="input-group" style={{ position: 'relative' }}>
      <Lock 
        size={18} 
        className="input-icon" 
        style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
      <input
        type={showPassword ? 'text' : 'password'}
        className="input-field"
        style={{ paddingLeft: '48px', paddingRight: '48px' }}
        value={value}
        onChange={onChange}
        placeholder="Enter your password"
      />
      <button
        type="button"
        onClick={toggleShowPassword}
        // className="toggle-password"
        style={{ position: 'absolute', right: '48px', top: '50%', background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#94A3B8' }}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
      >
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

export default PasswordInput;
