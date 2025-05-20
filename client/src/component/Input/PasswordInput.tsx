import React from 'react';

interface PasswordInputProps {
  str: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  placeholder: string;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({ str, onChange, placeholder }) => {
  return (
    <div className='relative'>
      <input 
        type='password'
        value={str}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
};

export default PasswordInput;