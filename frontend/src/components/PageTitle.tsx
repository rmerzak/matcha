export default function PageTitle({title}: {title: string}) {
  return (
    <div className="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
        {title}
      </h2>
    </div>
  );
}
