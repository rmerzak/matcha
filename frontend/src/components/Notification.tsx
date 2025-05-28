import { Bell } from "lucide-react";
import { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChatContext } from "../context/ChatContext";

export const Notification = () => {
  const { getNotifications, notifications } = useContext(ChatContext);

  useEffect(() => {
    getNotifications();
  }, []);
  return (
    <Link to="/notifications" className="text-white relative p-2">
      <Bell className="size-7 " />
      <span
        className={`${
          notifications.filter((n) => n.is_read === false).length > 0
            ? "bg-red-500"
            : "bg-gray-400 "
        } 
	  font-bold text-sm w-5 h-5 text-center inline-block 
	  rounded-full absolute top-0 right-1 align-baseline `}
      >
        {notifications.filter((n) => n.is_read === false).length}
      </span>
    </Link>
  );
};
