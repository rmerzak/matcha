import { useState } from "react";
import LoginForm from "../components/LoginForm";
import SignUpForm from "../components/SignUpForm";

type Props = {};

function AuthPage({}: Props) {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div
      className="min-h-screen flex items-center justify-center
 				 bg-gradient-to-br from-red-500 to-blue-500 p-4"
    >
      <div className="w-full max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-white mb-8">
          {isLogin ? "Sign in to Matcha" : "Create a Matcha account"}
        </h2>
        <div className="bg-white shadow-xl rounded-lg p-8">
          {isLogin ? <LoginForm /> : <SignUpForm />}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              {isLogin ? "New to Matcha?" : "Already have an account?"}
            </p>
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="mt-2 text-red-600 hover:text-red-800 font-medium transition-colors
				duration-300"
            >
              {isLogin ? "Create a new accout" : "Sign in to your account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
