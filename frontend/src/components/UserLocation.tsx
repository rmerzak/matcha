import { FC } from "react";
import { MapPin } from "lucide-react";

interface UserLocationProps {
  location: string | undefined;
}

const UserLocation: FC<UserLocationProps> = ({ location }) => {
  return (
    <div className="flex text-gray-700 text-sm space-x-1">
      <MapPin size={18} />
      <span>{location || "Unknown location"}</span>
    </div>
  );
};

export default UserLocation;