import ResetPassForm from "../components/ResetPassForm";

function ResetPassword() {
  return (
    <div
      className="min-h-screen flex items-center justify-center
 				 bg-gradient-to-br from-red-500 to-blue-500 p-4"
    >
      <div className="w-full max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-white mb-8">
          Reset password
        </h2>
        <div className="bg-white shadow-xl rounded-lg p-8">
          <ResetPassForm />
          <div className="mt-6 text-center"></div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
