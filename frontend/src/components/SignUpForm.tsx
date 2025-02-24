import { useState } from "react";
import useAuthStore from "../store/useAuthStore";

export default function SignUpForm() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [password, setPassword] = useState("");


    const { signUp, loading } = useAuthStore()

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        signUp({email, username, lastName, firstName, password});
      }}
    >
      {/* EMAIL  */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email address
        </label>
        <div className="mt-1">
          <input
            type="email"
            id="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md
			shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 
			focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>

      {/* USERNAME */}
      <div>
        <label
          htmlFor="username"
          className="block text-sm font-medium text-gray-700"
        >
          Username
        </label>
        <div className="mt-1">
          <input
            type="text"
            id="username"
            name="username"
            autoComplete="username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md
			shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 
			focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>

      {/* FIRSTNAME */}
      <div>
        <label
          htmlFor="firstname"
          className="block text-sm font-medium text-gray-700"
        >
          First name
        </label>
        <div className="mt-1">
          <input
            type="text"
            id="firstname"
            name="firstname"
            autoComplete="firstname"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md
			shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 
			focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>

      {/* LASTNAME */}
      <div>
        <label
          htmlFor="lastname"
          className="block text-sm font-medium text-gray-700"
        >
          Last name
        </label>
        <div className="mt-1">
          <input
            type="text"
            id="lastname"
            name="lastname"
            autoComplete="lastname"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md
			shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 
			focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>


      {/* PASSWORD  */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <div className="mt-1">
          <input
            type="password"
            id="password"
            name="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md
			shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 
			focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          }`}
          disabled={loading}
        >
          {loading ? "Signing up..." : "Sign up"}
        </button>
      </div>
    </form>
  );
}
