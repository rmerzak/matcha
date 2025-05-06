export default function Gender({ gender }: { gender: string | undefined }) {
	return (
	  <div className="flex gap-2 items-baseline">
		<h2 className="font-bold text-base">Gender:</h2>
		<p className="text-sm">{gender}</p>
	  </div>
	);
  }
  