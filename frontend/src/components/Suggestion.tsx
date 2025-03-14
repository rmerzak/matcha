import { Link } from "react-router-dom";
import { User } from "../users";
import { MapPin, Star } from "lucide-react";

interface Props {
    user: User;
}

const Suggestion = ({ user }: Props) => {
  return (
    <div
      className=" border bg-white p-2 rounded-lg border-gray-200 shadow-sm
  lg:w-full lg:flex lg:flex-row lg:space-x-4 grid"
    >
      <img
        src={user.profilePicture}
        // className="h-44 w-full object-contain rounded-lg "
        className="h-44 w-44 object-cover rounded-lg "
        alt=""
      />
      <div className="flex flex-col justify-between">
        <span className="text-xl font-bold mb-1">
          {user.firstName} {user.lastName}
        </span>
        <div className="flex flex-col text-gray-700 text-sm">
          <div className="flex space-x-1 items-center">
            <MapPin className="size-4" /> <span>{user.location}</span>
          </div>
          <div className="flex space-x-1 ">
            <Star className="size-4" /> <span>Fame rating: {6.6}</span>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {user.interests.map((interest: string, index) => (
            <span
              key={index}
              className="border rounded-2xl text-xs px-2 inline-block"
            >
              {interest}
            </span>
          ))}
        </div>
        <Link
          to={`/users/${user.username}`}
          className=" px-4 py-2 rounded-full font-semibold
      text-sm bg-purple-500 hover:bg-purple-600 focus:outline-none focus:ring-2
      focus:ring-offset-2 focus:ring-purple-500 text-center mt-3 text-white
      "
        >
          View profile
        </Link>
      </div>
    </div>
  );
}

export default Suggestion
