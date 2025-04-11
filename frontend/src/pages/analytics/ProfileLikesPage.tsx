import { useEffect } from "react";
import { Header } from "../../components/Header";
import PageTitle from "../../components/PageTitle";
import Viewer from "../../components/Viewer";
import { useAnalyticsStore } from "../../store/useAnalyticsStore";

const ProfileLikesPage = () => {
  const {likes, getLikes} = useAnalyticsStore();
    
      useEffect(()=> {
        getLikes();
      }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-grow flex flex-col py-2  px-4 sm:px-6 lg:px-8">
        <PageTitle title="Who's liked your profile" />
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border-gray-200 space-y-6 divide-y">
            <div className="flex flex-col">
              <span className="font-bold text-xl">{likes.length}</span>
              <span className="text-gray-600 text-sm">Likes</span>
            </div>
            <div className="pt-6">
              <h2 className="font-bold text-xl">
                Likes you might be interested in
              </h2>
              <div className="pt-6 flex flex-col  gap-4">
                {likes.map((liker: any, index) => (
                  <Viewer
                    key={index}
                    id={liker.id}
                    username={liker.username}
                    profilePicture={liker.profile_picture}
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
