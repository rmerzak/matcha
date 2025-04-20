interface LabeledInterest {
  value: string;
  label: string;
}

export default function Interests({
  interests,
}: {
  interests: [] | undefined | LabeledInterest[];
}) {
  return (
    <div className="flex flex-col space-y-1">
      <h2 className="font-bold text-base">Interests</h2>
      {/* <p className="text-sm">{interests}</p> */}
      <div>
        <div className="">
          {interests?.map(
            (interest: { label: string; value: string }, index) => (
              <span
                key={index}
                className="border rounded-2xl m-1 py-1 px-3 inline-block"
              >
                {interest.label}
              </span>
            )
          )}
        </div>
      </div>
    </div>
  );
}
