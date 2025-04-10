import { Header } from "../components/Header";
import PageTitle from "../components/PageTitle";
import EditProfileForm from "../components/EditProfileForm";


function EditProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-grow flex flex-col py-2 px-4 sm:px-6 lg:px-8">
        <PageTitle title="Edit Your Profile" />
        <EditProfileForm />
      </div>
    </div>
  );
}

export default EditProfilePage;
