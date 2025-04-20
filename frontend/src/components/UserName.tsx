import { FC } from "react";

interface UserNameProps {
  firstName: string;
  lastName: string;
}

const UserName: FC<UserNameProps> = ({ firstName, lastName }) => {
  return (
    <span className="text-2xl font-bold mb-1">
      {firstName} {lastName}
    </span>
  );
};

export default UserName;