import { useState, useEffect } from "react";
import { Header } from "../components/Header";
import Bio from "../components/Bio";
import Interests from "../components/Interests";
import ProfilePictures from "../components/ProfilePictures";
import ProfilePicture from "../components/ProfilePicture";
import UserName from "../components/UserName";
import UserLocation from "../components/UserLocation";
import FameRating from "../components/FameRating";
import { useParams } from "react-router-dom";
import { useUserStore } from "../store/useUserStore";

interface LabeledInterest {
  value: string;
  label: string;
}

export default function UsersPage() {
  const { username } = useParams();
  const { user, getUserByUsername } = useUserStore();
  const [labeledInterests, setLabeledInterests] = useState<LabeledInterest[]>([]);

  useEffect(() => {
    if (username) {
      getUserByUsername(username);
    }
  }, [username, getUserByUsername]);

  useEffect(() => {
    if (user?.interests) {
      const newLabeledInterests = user.interests.map((interest: string) => ({
        value: interest,
        label: `#${interest}`,
      }));
      setLabeledInterests(newLabeledInterests);
    } else {
      setLabeledInterests([]); // Clear interests if none exist
    }
  }, [user]);

  // Show loading state while user is being fetched
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-grow flex justify-center items-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-grow flex flex-col py-2 px-4 sm:px-6 lg:px-8">
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border-gray-200 space-y-2">
            <ProfilePicture profilePicture={user.profile_picture} />
            <div className="flex justify-between">
              <div className="flex flex-col">
                <UserName firstName={user.first_name} lastName={user.last_name} />
                <UserLocation location={user.location} />
                <FameRating fameRating={user.fame_rating} />
              </div>
              {/* <EditProfileButton /> */}
            </div>
            <Bio bio={user.bio || ""} />
            <Interests interests={labeledInterests} />
            <ProfilePictures pictures={user.pictures || []} />
          </div>
        </div>
      </div>
    </div>
  );
}