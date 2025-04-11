export type User = {
  firstName: string;
  lastName: string;
  username: string;
  profilePicture: string;
  location: string;
  interests: string[];
  gender: string;
  sexualPreferences: "heterosexual" | "homosexual" | "bisexual";
  bio: string;
};

export const users: User[] = [
  {
    firstName: "Emma",
    lastName: "Johnson",
    username: "emma_johnson",
    profilePicture:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    location: "New York, NY",
    interests: ["#fashion", "#travel", "#photography", "#foodie"],
    gender: "female",
    sexualPreferences: "heterosexual",
    bio: "City girl with a passion for capturing life’s moments and tasting every cuisine along the way.",
  },
  {
    firstName: "Liam",
    lastName: "Patel",
    username: "liam_patel92",
    profilePicture:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d",
    location: "San Francisco, CA",
    interests: ["#tech", "#gaming", "#music", "#hiking"],
    gender: "male",
    sexualPreferences: "bisexual",
    bio: "Techie by day, gamer by night. Always up for a hike or a good playlist.",
  },
  {
    firstName: "Sophia",
    lastName: "Garcia",
    username: "sophiagarcia",
    profilePicture:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
    location: "Miami, FL",
    interests: ["#dance", "#beachlife", "#fitness", "#art"],
    gender: "female",
    sexualPreferences: "homosexual",
    bio: "Dancing through life with sand between my toes and a paintbrush in hand.",
  },
  {
    firstName: "Noah",
    lastName: "Kim",
    username: "noahkimofficial",
    profilePicture:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
    location: "Seattle, WA",
    interests: ["#coding", "#coffee", "#nature", "#books"],
    gender: "male",
    sexualPreferences: "heterosexual",
    bio: "Code runs on coffee, and I run on nature trails. Probably reading something nerdy right now.",
  },
  {
    firstName: "Olivia",
    lastName: "Smith",
    username: "oliviasmith_x",
    profilePicture:
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e",
    location: "Chicago, IL",
    interests: ["#yoga", "#vegan", "#travel", "#wellness"],
    gender: "female",
    sexualPreferences: "bisexual",
    bio: "Finding peace in every pose and every plant-based meal. Wanderlust is my fuel.",
  },
  {
    firstName: "Aiden",
    lastName: "Martinez",
    username: "aiden_mtz",
    profilePicture:
      "https://images.unsplash.com/photo-1568602471122-7832951cc4c5",
    location: "Houston, TX",
    interests: ["#sports", "#cars", "#music", "#bbq"],
    gender: "male",
    sexualPreferences: "heterosexual",
    bio: "Fast cars, loud tunes, and slow-smoked brisket—living the Texas dream.",
  },
  {
    firstName: "Isabella",
    lastName: "Nguyen",
    username: "bella_nguyen",
    profilePicture:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df",
    location: "Los Angeles, CA",
    interests: ["#acting", "#fashion", "#beauty", "#movies"],
    gender: "female",
    sexualPreferences: "homosexual",
    bio: "Chasing the spotlight and serving looks. Hollywood’s next big thing.",
  },
  {
    firstName: "Ethan",
    lastName: "Brown",
    username: "ethanb_99",
    profilePicture:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
    location: "Boston, MA",
    interests: ["#history", "#photography", "#running", "#beer"],
    gender: "male",
    sexualPreferences: "heterosexual",
    bio: "History buff with a camera in one hand and a craft beer in the other.",
  },
  {
    firstName: "Mia",
    lastName: "Rodriguez",
    username: "miarod",
    profilePicture:
      "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6",
    location: "Phoenix, AZ",
    interests: ["#art", "#hiking", "#cooking", "#dogs"],
    gender: "female",
    sexualPreferences: "bisexual",
    bio: "Painting the desert, hiking with my pup, and cooking up a storm.",
  },
  {
    firstName: "Jackson",
    lastName: "Lee",
    username: "jacklee_official",
    profilePicture:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7",
    location: "Portland, OR",
    interests: ["#music", "#craftbeer", "#outdoors", "#skateboarding"],
    gender: "male",
    sexualPreferences: "homosexual",
    bio: "Strumming tunes, sipping brews, and shredding the streets.",
  },
  {
    firstName: "Ava",
    lastName: "Taylor",
    username: "avataylor21",
    profilePicture: "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
    location: "Denver, CO",
    interests: ["#skiing", "#nature", "#fitness", "#travel"],
    gender: "female",
    sexualPreferences: "heterosexual",
    bio: "Skiing down mountains and chasing adventures wherever the wind takes me.",
  },
  {
    firstName: "Lucas",
    lastName: "Wilson",
    username: "lucaswilson",
    profilePicture:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
    location: "Austin, TX",
    interests: ["#music", "#tech", "#bbq", "#guitar"],
    gender: "male",
    sexualPreferences: "bisexual",
    bio: "Tech geek with a guitar in hand and a smoker full of ribs.",
  },
  {
    firstName: "Charlotte",
    lastName: "Davis",
    username: "charlie_davis",
    profilePicture:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
    location: "Atlanta, GA",
    interests: ["#fashion", "#foodie", "#dance", "#books"],
    gender: "female",
    sexualPreferences: "heterosexual",
    bio: "Styling my way through life, one book and one bite at a time.",
  },
  {
    firstName: "James",
    lastName: "Clark",
    username: "jamesc_88",
    profilePicture:
      "https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6",
    location: "Philadelphia, PA",
    interests: ["#sports", "#history", "#gaming", "#pizza"],
    gender: "male",
    sexualPreferences: "heterosexual",
    bio: "Philly sports fan, history nerd, and pizza connoisseur.",
  },
  {
    firstName: "Amelia",
    lastName: "Hernandez",
    username: "amelia_hdz",
    profilePicture:
      "https://images.unsplash.com/photo-1519699047748-de8e457a634e",
    location: "San Diego, CA",
    interests: ["#surfing", "#yoga", "#travel", "#cats"],
    gender: "female",
    sexualPreferences: "bisexual",
    bio: "Riding waves, striking poses, and cuddling my cats.",
  },
  {
    firstName: "Benjamin",
    lastName: "Moore",
    username: "benmoore",
    profilePicture:
      "https://plus.unsplash.com/premium_photo-1689977807477-a579eda91fa2",
    location: "Washington, D.C.",
    interests: ["#politics", "#photography", "#running", "#coffee"],
    gender: "male",
    sexualPreferences: "homosexual",
    bio: "Snapping pics, debating policy, and running on caffeine.",
  },
  {
    firstName: "Harper",
    lastName: "Thompson",
    username: "harper_t",
    profilePicture:
      "https://images.unsplash.com/photo-1517365830460-955ce3ccd263",
    location: "Nashville, TN",
    interests: ["#music", "#songwriting", "#fashion", "#dogs"],
    gender: "female",
    sexualPreferences: "heterosexual",
    bio: "Writing songs, rocking outfits, and spoiling my pups.",
  },
  {
    firstName: "Evelyn",
    lastName: "Walker",
    username: "evelynwalker_",
    profilePicture:
      "https://plus.unsplash.com/premium_photo-1690407617542-2f210cf20d7e",
    location: "Minneapolis, MN",
    interests: ["#art", "#nature", "#baking", "#books"],
    gender: "female",
    sexualPreferences: "homosexual",
    bio: "Creating art, baking treats, and getting lost in a good story.",
  },
  {
    firstName: "Logan",
    lastName: "Adams",
    username: "logan_adams22",
    profilePicture:
      "https://images.unsplash.com/photo-1480455624313-e29b44bbfde1",
    location: "Dallas, TX",
    interests: ["#sports", "#gaming", "#cars", "#travel"],
    gender: "male",
    sexualPreferences: "heterosexual",
    bio: "Living fast, gaming hard, and cheering louder.",
  },
  {
    firstName: "Lily",
    lastName: "White",
    username: "lilywhite_xo",
    profilePicture: "https://images.unsplash.com/photo-1554780336-390462301acf",
    location: "Charlotte, NC",
    interests: ["#beauty", "#fashion", "#fitness", "#foodie"],
    gender: "female",
    sexualPreferences: "bisexual",
    bio: "Serving looks and loving life’s little luxuries.",
  },
];
