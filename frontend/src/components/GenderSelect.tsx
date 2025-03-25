import React from "react";

interface GenderSelectProps {
  gender: string;
  setGender: (gender: string) => void;
}

const GenderSelect: React.FC<GenderSelectProps> = ({ gender, setGender }) => {
  const genderOptions = ["Male", "Female"];

  return (
    <div>
      <span className="block text-sm font-medium text-gray-700 mb-2">
        Gender
      </span>
      <div className="flex space-x-4">
        {genderOptions.map((option) => (
          <label key={option} className="inline-flex items-center">
            <input
              required
              type="radio"
              style={{
                accentColor: "#7E22CE",
              }}
              className=""
              name="gender"
              value={option.toLocaleLowerCase()}
              checked={gender === option.toLocaleLowerCase()}
              onChange={() => setGender(option.toLocaleLowerCase())}
            />
            <span className="ml-2">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default GenderSelect;