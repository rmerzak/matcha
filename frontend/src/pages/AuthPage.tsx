import { useState } from "react";
import LoginForm from "../components/LoginForm";
import SignUpForm from "../components/SignUpForm";
import ForgotPassForm from "../components/ForgotPassForm";

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isSignup, setIsSignup] = useState(false);
  const [isForgotpass, setIsForgotpass] = useState(false);

  return (
    <div
      className="min-h-screen flex items-center justify-center
 				 bg-gradient-to-br from-red-500 to-blue-500 p-4"
    >
      <div className="w-full max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-white mb-8">
          {isLogin && "Sign in to Matcha"}
          {isSignup && "Create a Matcha account"}
        </h2>
        <div className="bg-white shadow-xl rounded-lg p-8">
          {isLogin && <LoginForm />}
          {isSignup && <SignUpForm />}
          {isForgotpass && <ForgotPassForm />}
          <div className="mt-6 text-center">
            {isLogin && (
              <button
                onClick={() => {
                  setIsForgotpass(!isForgotpass);
                  setIsLogin(!isLogin);
                }}
                className="mb-2 text-blue-500 hover:text-blue-600 font-medium hover:underline"
              >
                Forgotten password?
              </button>
            )}
            <p className="mt-2 text-sm text-gray-600">
              {isLogin && "New to Matcha?"}
              {isSignup && "Already have an account?"}
            </p>
            {!isForgotpass && (
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setIsSignup(!isSignup);
                  setIsForgotpass(false);
                }}
                className="mt-1 text-lg text-red-600 hover:text-red-800 font-medium transition-colors
				duration-300"
              >
                {isLogin ? "Create a new accout" : "Sign in to your account"}
              </button>
            )}
			{isForgotpass && (
              <button
                onClick={() => {
                  setIsForgotpass(!isForgotpass);
                  setIsLogin(!isLogin);
                }}
                className="mb-2 text-red-500 hover:text-red-600 font-medium hover:underline"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
