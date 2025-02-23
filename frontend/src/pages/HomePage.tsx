import { Sidebar } from "../components/Sidebar";

type Props = {};

function HomePage({}: Props) {
  return (
    <div
      className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-br from-pink-100 to bg-purple-100
    overflow-hidden"
    >
      <Sidebar />
    </div>
  );
}

export default HomePage;
