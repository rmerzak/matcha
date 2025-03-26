import React, { useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface BirthDatePickerProps {
  birthDate: Date | null;
  setBirthDate: (date: Date | null) => void;
  onValidityChange?: (isValid: boolean) => void; // Optional callback to inform parent
}

const BirthDatePicker: React.FC<BirthDatePickerProps> = ({
  birthDate,
  setBirthDate,
  onValidityChange,
}) => {
  // Calculate the maximum date for being at least 18 years old
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 18);

  // Validate if the user is at least 18
  const isAtLeast18 = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    const ageDiff = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    const dayDiff = today.getDate() - date.getDate();
    return (
      ageDiff > 18 ||
      (ageDiff === 18 && (monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0)))
    );
  };

  // Notify parent of validity changes
  useEffect(() => {
    if (onValidityChange) {
      onValidityChange(isAtLeast18(birthDate));
    }
  }, [birthDate, onValidityChange]);

  return (
    <div className="flex gap-2 flex-col">
      <label className="block text-sm font-medium text-gray-700">
        Birth date
      </label>
      <DatePicker
        className={`border border-gray-300 rounded-lg w-full h-10 focus:outline-none focus:ring-purple-500 focus:border-purple-500 ${
          birthDate && !isAtLeast18(birthDate) ? "border-red-500" : ""
        }`}
        required
        selected={birthDate}
        onChange={(date: Date | null) => setBirthDate(date)}
        maxDate={maxDate} // Restrict to 18 years ago or earlier
        showYearDropdown
        scrollableYearDropdown
        yearDropdownItemNumber={100} // Allow selection back 100 years
        dateFormat="d/MM/yyyy"
        placeholderText="Select your birth date"
      />
      {birthDate && !isAtLeast18(birthDate) && (
        <p className="text-sm text-red-500 mt-1">
          You must be at least 18 years old.
        </p>
      )}
    </div>
  );
};

export default BirthDatePicker;