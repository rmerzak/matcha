// import { create } from "zustand";
// import { axiosInstance } from "../lib/axios";

// type AuthState = {
//   authUser: string | null;
//   checkingAuth: boolean;
//   checkAuth: () => Promise<void>; 
// };

// const useAuthStore = create<AuthState>((set) => ({
//   authUser: null,
//   checkingAuth: true,

//   signup: async ({username, firstName, lastLame, email, password}) => {
// 	try {
		
// 	} catch (error) {
		
// 	}
//   }

//   checkAuth: async () => {
// 	try {
// 		const res = await axiosInstance.post("/auth/verifyToken")
// 	} catch (error) {
// 		console.log(error)
// 	}
//   }
// }));

// export default useAuthStore;
