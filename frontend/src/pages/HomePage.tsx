import useAuthStore from "../store/useAuthStore";

type Props = {};

function HomePage({}: Props) {
  const { signOut } = useAuthStore();
  return (
    <div className="flex justify-between">
      HomePage
      <button className="border p-2 border-black" onClick={signOut}>sign Out</button>
    </div>
  );
}

export default HomePage;
