import { useEffect } from "react";
import { Link } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import { useUserStore } from "../store/useUserStore";

export default function Viewer({
  id,
  username,
  profilePicture,
}: {
  id: string;
  username: string;
  profilePicture: string;
}) {
  const { user, getUser } = useUserStore();
  useEffect(() => {
    getUser(id);
  }, []);
  return (
    <div className="flex justify-between">
      <div className="flex items-center gap-2">
        <img
          src={profilePicture || "/avatar.png"}
          alt="profile picture"
          className="h-14 w-14 object-cover rounded-full "
        />
        {user && (
          <div className="flex gap-1 font-semibold">
            <span>
              {user.first_name} {user.last_name}
            </span>
          </div>
        )}
      </div>
      <Link
        to={`/users/${username}`}
        className="inline-flex font-semibold items-center px-4 py-2 border border-purple-300 rounded-full shadow-sm
                        text-sm text-purple-700 bg-white hover:bg-purple-50 focus:outline-none focus:ring-2
                        focus:ring-offset-2 focus:ring-purple-500 self-start mt-2"
      >
        View
      </Link>
    </div>
  );
}
