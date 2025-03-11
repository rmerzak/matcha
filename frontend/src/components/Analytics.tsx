import { Heart, Users } from "lucide-react";
import { Link } from "react-router-dom";

export default function Analytics({
  numberOfProfileViews,
  numberOfLikes,
}: {
  numberOfProfileViews: number;
  numberOfLikes: number;
}) {
  return (
    <div className="border px-2 py-3 space-y-1">
      <h2 className="font-bold text-lg">Analytics</h2>
      <div className="flex gap-6 text-gray-700">
        <Link to="/analytics/profile-views"  className="hover:cursor-default">
          <div className="flex text-base space-x-1 items-center ">
            <Users size={18} />{" "}
            <span className="font-semibold hover:text-purple-700  hover:underline">
              {numberOfProfileViews} profile views
            </span>
          </div>
          <p className="text-xs">Discover who's viewed your profile</p>
        </Link>
        <Link to="/analytics/profile-likes" className="hover:cursor-default">
          <div className="flex  text-base space-x-1 items-center">
            <Heart size={18} />{" "}
            <span className="font-semibold hover:text-purple-700 hover:underline">
              {numberOfLikes} likes
            </span>
          </div>
          <p className="text-xs">Discover who's liked your profile</p>
        </Link>
      </div>
    </div>
  );
}
