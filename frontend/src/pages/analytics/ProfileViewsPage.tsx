import { useEffect } from "react";
import { Header } from "../../components/Header";
import PageTitle from "../../components/PageTitle";
import Viewer from "../../components/Viewer";
import { useAnalyticsStore } from "../../store/useAnalyticsStore";
import useAuthStore from "../../store/useAuthStore";
import { users } from "../../users";

const ProfileViewsPage = () => {
    const {profileViews, getProfileViews} = useAnalyticsStore();
  
    useEffect(()=> {
      getProfileViews();
    }, [])


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-grow flex flex-col py-2  px-4 sm:px-6 lg:px-8">
        <PageTitle title="Who's viewed your profile" />
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border-gray-200 space-y-6 divide-y">
            <div className="flex flex-col">
              <span className="font-bold text-xl">{profileViews.length}</span>
              <span className="text-gray-600 text-sm">Profile viewers</span>
            </div>
            <div className="pt-6">
              <h2 className="font-bold text-xl">
                Viewers you might be interested in
              </h2>
              <div className="pt-6 flex flex-col  gap-4">
                {profileViews.map((view: any, index) => (
                  <Viewer
                    key={index}
                    id={view.viewer}
                    username={view.viewer_username}
                    profilePicture={view.viewer_profile_picture}
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

export default ProfileViewsPage;
