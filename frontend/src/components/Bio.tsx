export default function Bio({ bio }: { bio: string | undefined }) {
  return (
    <div className="flex flex-col space-y-1">
      <h2 className="font-bold text-base">About me</h2>
      <p className="text-sm">{bio}</p>
    </div>
  );
}
