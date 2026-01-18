import { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

function PasswordInput({ value, onChange, showPassword, toggleShowPassword }) {
  // <PasswordInput
  //               value={formData.password}
  //               onChange={(e) => handleInputChange('password', e.target.value)}
  //               showPassword={showPassword}
  //               toggleShowPassword={() => setShowPassword(s => !s)}
  //             />
  console.log("showPassword:", showPassword);


  return (
    <div style={{ position: 'relative' }}>
      <Lock
        size={18}
        style={{
          position: 'absolute',
          left: '16px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#94A3B8',
          pointerEvents: 'none'
        }}
      />

      <input
        type={showPassword ? 'text' : 'password'}
        className="input-field"
        style={{
          paddingLeft: '48px',
          paddingRight: '44px' // space for eye icon
        }}
        value={value}
        onChange={onChange}
        placeholder="Enter your password"
      />

      <button
        type="button"
        onClick={toggleShowPassword}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
        style={{
          position: 'absolute',
          right: '12px',        // ✅ correct anchor
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          color: '#94A3B8'
        }}
      >
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>

  );
}

export default PasswordInput;
