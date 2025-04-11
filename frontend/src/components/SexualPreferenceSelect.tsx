import React from "react";

interface SexualPreferenceSelectProps {
  sexualPreference: string;
  setSexualPreference: (preference: string) => void;
}

const SexualPreferenceSelect: React.FC<SexualPreferenceSelectProps> = ({
  sexualPreference,
  setSexualPreference,
}) => {
  const preferenceOptions = ["Heterosexual", "Homosexual", "Bisexual"];

  return (
    <div>
      <span className="block text-sm font-medium text-gray-700 mb-2">
        Gender Preference
      </span>
      <div className="flex space-x-4">
        {preferenceOptions.map((option) => (
          <label key={option} className="inline-flex items-center">
            <input
              type="checkbox"
              style={{
                accentColor: "#7E22CE",
              }}
              className="form-checkbox"
              checked={sexualPreference.toLowerCase() === option.toLowerCase()}
              onChange={() => setSexualPreference(option.toLowerCase())}
            />
            <span className="ml-2">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default SexualPreferenceSelect;