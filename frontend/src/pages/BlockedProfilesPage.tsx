import { useEffect } from "react";
import { useAnalyticsStore } from "../store/useAnalyticsStore";
import { Header } from "../components/Header";
import PageTitle from "../components/PageTitle";
import Viewer from "../components/Viewer";
import { useBlockStore } from "../store/useBlockStore";

const BlockedProfilesPage = () => {
  const { blockedProfiles, getBlockedProfiles } = useBlockStore();

  useEffect(() => {
    getBlockedProfiles();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-grow flex flex-col py-2  px-4 sm:px-6 lg:px-8">
        <PageTitle title="Profiles you blocked" />
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border-gray-200 space-y-6 divide-y">
              <div className="pt-6 flex flex-col  gap-4">
                {blockedProfiles.map((profile: any, index) => (
                  <Viewer
                    key={index}
                    id={profile.id}
                    username={profile.username}
                    profilePicture={profile.profile_picture}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};

export default BlockedProfilesPage;
