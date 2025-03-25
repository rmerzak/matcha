import { useEffect } from "react";
import { Header } from "../components/Header";
import { useNavigate } from "react-router-dom";
import PageTitle from "../components/PageTitle";
import FillProfileForm from "../components/FillProfileForm";

function FillProfilePage() {
  const navigate = useNavigate();

  useEffect(() => {
    // if (authUser?.gender) navigate("/profile", { replace: true });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-grow flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <PageTitle title="Fill your Profile" />
        <FillProfileForm />
      </div>
    </div>
  );
}

export default FillProfilePage;
