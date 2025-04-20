import { FC } from "react";
import { Star } from "lucide-react";

interface FameRatingProps {
  fameRating: number | undefined;
}

const FameRating: FC<FameRatingProps> = ({ fameRating }) => {
  return (
    <div className="flex text-gray-700 text-sm space-x-1 mt-3">
      <Star size={18} />
      <span>Fame rating: {fameRating ?? "N/A"}</span>
    </div>
  );
};

export default FameRating;