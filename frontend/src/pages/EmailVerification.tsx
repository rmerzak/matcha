import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";


const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { status, verifyEmail, authUser } = useAuthStore();

  useEffect(() => {
    verifyEmail(searchParams.get("token"));
	console.log("from the useeffect", authUser)
  }, [searchParams, navigate]);

  const renderContent = () => {
    switch (status) {
      case "verifying":
        return (
          <>
            <h2 className="text-2xl font-bold mb-4">Verifying Your Email</h2>
            <p className="text-gray-600">
              Please wait while we verify your email address...
            </p>
            <div className="mt-4 animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent mx-auto"></div>
          </>
        );
      case "success":
		// setTimeout(() => navigate('/auth'), 5000);
        return (
          <>
            <h2 className="text-2xl font-bold text-green-600 mb-4">
              Email Verified!
            </h2>
            <p className="text-gray-600">
              Your email has been successfully verified.
            </p>
            <p className="text-gray-600 mt-2">Redirecting to login page...</p>
          </>
        );
      case "error":
		// setTimeout(() => navigate('/auth'), 5000);
        return (
          <>
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Verification Failed
            </h2>
            <p className="text-gray-600">
              There was a problem verifying your email.
            </p>
            <p className="text-gray-600 mt-2">Redirecting to login page...</p>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">{renderContent()}</div>
      </div>
    </div>
  );
};

export default EmailVerification;
