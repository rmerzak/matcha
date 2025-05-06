import { FC } from "react";

interface UserNameProps {
  firstName: string;
  lastName: string;
  username: string;
}

const UserName: FC<UserNameProps> = ({ firstName, lastName, username }) => {
  return (
    <div className="gap-2 flex items-baseline">
      <span className="text-2xl font-bold mb-1">
        {firstName} {lastName}
      </span>
      <span className="text-sm text-gray-800">@{username}</span>
    </div>
  );
};

export default UserName;
