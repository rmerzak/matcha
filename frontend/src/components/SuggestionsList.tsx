import React from "react";
import Suggestion from "./Suggestion";

interface SuggestionsListProps {
  suggestions: any[];
}

const SuggestionsList: React.FC<SuggestionsListProps> = ({ suggestions }) => {
  return (
    <div className="lg:flex-col lg:flex gap-2 grid grid-cols-2 md:grid-cols-3 md:gap-3  h-full overflow-scroll">
      {suggestions.map((suggestion: any, index) => (
        <Suggestion user={suggestion} key={suggestion.id || index} />
      ))}
    </div>
  );
};

export default SuggestionsList;