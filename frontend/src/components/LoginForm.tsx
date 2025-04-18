import { useState } from "react";
import useAuthStore from "../store/useAuthStore";

type Props = {};

function LoginForm({}: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { checkAuth, signIn, loading } = useAuthStore();

  return (
    <form
      className="space-y-6"
      onSubmit={async (e) => {
        e.preventDefault();
        await signIn({ username, password });
        checkAuth();
      }}
    >
      <div>
        <label
          htmlFor="username"
          className="block text-sm font-medium text-gray-700"
        >
          Username
        </label>
        <div className="mt-1">
          <input
            type="username"
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

      <button
        type="submit"
        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md
		text-lg font-medium text-white ${
      loading
        ? "bg-blue-400 cursor-not-allowed"
        : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    }`}
        disabled={loading}
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}

export default LoginForm;
