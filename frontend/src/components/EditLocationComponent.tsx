import React from "react";

interface EditLocationProps {
  latitude: string;
  longitude: string;
  setLatitude: (lat: string) => void;
  setLongitude: (lon: string) => void;
}

const EditLocationComponent: React.FC<EditLocationProps> = ({
  latitude,
  longitude,
  setLatitude,
  setLongitude,
}) => {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Location
        </label>
        <div className="flex gap-1 flex-wrap">
          <label className="text-sm flex items-center gap-1">
            Latitude:
            <input
              type="text"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="e.g., 37.7749"
              className="appearance-none block px-1 py-1 border border-gray-300 rounded-md shadow-sm
          placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-sm"
            />
          </label>
          <label className="text-sm flex items-center gap-1">
            Longitude:
            <input
              type="text"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="e.g., -122.4194"
              className="appearance-none block px-1 py-1 border border-gray-300 rounded-md shadow-sm
              placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-sm"
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default EditLocationComponent;
