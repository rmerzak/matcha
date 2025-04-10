import React from 'react';

interface FirstNameInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FirstNameInput: React.FC<FirstNameInputProps> = ({ value, onChange }) => {
  return (
    <div>
      <label
        htmlFor="firstName"
        className="block text-sm font-medium text-gray-700"
      >
        First name
      </label>
      <div className="mt-1">
        <input
          type="text"
          id="firstName"
          name="firstName"
          required
          value={value}
          onChange={onChange}
          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
          placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
        />
      </div>
    </div>
  );
};

export default FirstNameInput;