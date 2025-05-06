export default function SexualPreference({ sexualPreference }: { sexualPreference: string | undefined }) {
	return (
	  <div className="flex flex-col space-y-1">
		<h2 className="font-bold text-base">Sexual preference</h2>
		<p className="text-sm">{sexualPreference}</p>
	  </div>
	);
  }
  