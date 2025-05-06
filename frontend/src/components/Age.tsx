export default function Age({ age }: { age: string | undefined }) {
	return (
	  <div className="flex gap-2 items-baseline">
		<h2 className="font-bold text-base">Age:</h2>
		<p className="text-sm">{age}</p>
	  </div>
	);
  }
  