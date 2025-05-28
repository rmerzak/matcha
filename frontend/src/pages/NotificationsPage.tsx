import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import { useContext, useEffect } from "react";
import PageTitle from "../components/PageTitle";
import { ChatContext } from "../context/ChatContext";
import { Link } from "react-router-dom";

function NotificationsPage() {
  const { getNotifications, notifications, readNotifications } =
    useContext(ChatContext);

  // useEffect(() => {
  //   console.log(notifications.length)
  // }, [notifications])

  useEffect(() => {
    const fetchData = async () => {
      await getNotifications();
      readNotifications();
    };

    fetchData();
  }, []);

  return (
    <div
      className="flex flex-col lg:flex-row 
    bg-gradient-to-br bg-gray-50 overflow-hidden"
    >
      <Sidebar />
      <div className="flex flex-grow flex-col h-screen ">
        <Header />
        <div className="flex flex-col gap-2 overflow-auto">
          <PageTitle title="Notifications" />
          <div className="bg-white p-4 rounded shadow-md">
            {notifications && notifications.length > 0 ? (
              <ul className="space-y-4 flex-col-reverse flex">
                {notifications.map((notification) => (
                  <li
                    key={notification.id}
                    className={`flex items-start gap-4 p-3 border-b ${
                      !notification.is_read ? "bg-gray-100" : ""
                    }`}
                  >
                    <img
                      src={notification.profile_picture}
                      alt={notification.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex flex-col">
                      <Link to={`/users/${notification.username}`} className="hover:underline">
                        <span className="font-semibold text-sm">
                          {notification.username}
                        </span>
                      </Link>
                      <span className="text-gray-700">
                        {notification.content}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(notification.created_at).toLocaleString()}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No notifications found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotificationsPage;
