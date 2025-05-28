import { useState, useEffect, useRef } from "react";
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
import Age from "../components/Age";
import Gender from "../components/Gender";
// import SexualPreference from "../components/SexualPreference";
import { useAnalyticsStore } from "../store/useAnalyticsStore";
import LikeButton from "../components/LikeButton";
import BlockButton from "../components/BlockButton";

interface LabeledInterest {
  value: string;
  label: string;
}

export default function UsersPage() {
  const { username } = useParams();
  const { user, getUserByUsername } = useUserStore();
  const { addView } = useAnalyticsStore();
  const [labeledInterests, setLabeledInterests] = useState<LabeledInterest[]>(
    []
  );

  useEffect(() => {
    if (username) {
      getUserByUsername(username);
    }
  }, [username, getUserByUsername]);

  const hasViewedRef = useRef<string | null>(null);

  useEffect(() => {
    if (user) {
      if (hasViewedRef.current !== user.id) {
        addView(user.id);
        hasViewedRef.current = user.id;
      }
      if (user?.interests) {
        const newLabeledInterests = user.interests.map((interest: string) => ({
          value: interest,
          label: `#${interest}`,
        }));
        setLabeledInterests(newLabeledInterests);
      } else {
        setLabeledInterests([]); // Clear interests if none exist
      }
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
                <UserName
                  firstName={user.first_name}
                  lastName={user.last_name}
                  username={user.username}
                />
                <UserLocation location={user.location} />
                <FameRating fameRating={user.fame_rating} />
              </div>
              <LikeButton likedUserId={user.id} />
            </div>
            <div className="flex gap-4">
              <Age age={user.age} />
              <Gender gender={user.gender} />
            </div>
            {/* <SexualPreference sexualPreference={user.sexual_preferences} /> */}
            <Bio bio={user.bio || ""} />
            <Interests interests={labeledInterests} />
            <ProfilePictures pictures={user.pictures || []} />
            <div className="items-center justify-center flex">
              <BlockButton userId={user.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
