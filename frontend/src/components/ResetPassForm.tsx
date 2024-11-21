import { useEffect, useState } from "react";
import useAuthStore from "../store/useAuthStore";
import { useNavigate, useSearchParams } from "react-router-dom";

type Props = {};

function ResetPassForm({}: Props) {
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();

  const { resetPassword, loading, status } = useAuthStore();

  useEffect(() => {
    if (status == "success") {
      setTimeout(() => navigate("/auth"), 1000);
    }
  });

  return (
    <form
      className="space-y-6"
      onSubmit={async (e) => {
        e.preventDefault();
        await resetPassword(newPassword, searchParams.get("token"));
      }}
    >
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          New Password
        </label>
        <div className="mt-1">
          <input
            type="password"
            id="password"
            name="password"
            autoComplete="current-password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
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
        {loading ? "Saving..." : "Save"}
      </button>
    </form>
  );
}

export default ResetPassForm;
