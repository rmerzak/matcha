import { useState } from "react";
import useAuthStore from "../store/useAuthStore";

type Props = {};

function ForgotPassForm({}: Props) {
  const [email, setEmail] = useState("");

  const { requestPasswordReset, loading } = useAuthStore();

  return (
    <form
      className="space-y-6"
      onSubmit={async (e) => {
        e.preventDefault();
		await requestPasswordReset(email);
      }}
    >
      <p className="mt-2 text-sm text-center text-gray-600">
        We'll email you a link to reset your passwrod 
      </p>
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email
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
        {loading ? "Sending email..." : "Send email"}
      </button>
    </form>
  );
}

export default ForgotPassForm;
