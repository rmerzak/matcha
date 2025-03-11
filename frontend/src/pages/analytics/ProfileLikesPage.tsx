import { Header } from "../../components/Header";
import PageTitle from "../../components/PageTitle";
import Viewer from "../../components/Viewer";
import useAuthStore from "../../store/useAuthStore";
import { users } from "../../users";

const ProfileLikesPage = () => {
  const {  } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-grow flex flex-col py-2  px-4 sm:px-6 lg:px-8">
        <PageTitle title="Who's liked your profile" />
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border-gray-200 space-y-6 divide-y">
            <div className="flex flex-col">
              <span className="font-bold text-xl">{users.slice(0, 5).length}</span>
              <span className="text-gray-600 text-sm">Likes</span>
            </div>
            <div className="pt-6">
              <h2 className="font-bold text-xl">
                Viewers you might be interested in
              </h2>
              <div className="pt-6 flex flex-col  gap-4">
                {users.slice(0, 5).map((user, index) => (
                  <Viewer
                    key={index}
                    firstName={user.firstName}
                    lastName={user.lastName}
                    username={user.username}
                    profilePicture={user.profilePicture}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileLikesPage;
