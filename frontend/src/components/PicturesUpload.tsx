import React, { useRef } from "react";

interface PicturesUploadProps {
  pictures: string[];
  setPictures: (pictures: string[]) => void;
}

const PicturesUpload: React.FC<PicturesUploadProps> = ({
  pictures,
  setPictures,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addPicture = (newPicture: any) => {
    const picturesToAdd = Array.isArray(newPicture) ? newPicture : [newPicture];
    const canAdd = 4 - pictures.length;
    if (canAdd > 0) {
      const newPictures = picturesToAdd.slice(0, canAdd);
      setPictures([...pictures, ...newPictures]);
    } else {
      console.warn("Cannot add more images; limit reached.");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        addPicture(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePicture = (indexToRemove: number) => {
    setPictures(pictures.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        Pictures
      </label>
      <div className="mt-1 mb-1 flex items-center flex-wrap">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm
            text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2
            focus:ring-offset-2 focus:ring-purple-500 flex-col"
        >
          <span>Upload Picture</span>
        </button>
      </div>
      <div>
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
          multiple
          disabled={pictures.length >= 4}
        />
      </div>
      <span className="ml-2 text-sm text-gray-400">
        Up to {4 - pictures.length} pictures
      </span>
      <p className="ml-2 text-sm text-gray-400">
        {pictures.length}/4 pictures uploaded.
      </p>
      <div className="flex gap-2 flex-wrap mx-auto  pt-2 pl-2">
        {pictures.map((image, index) => (
          <div key={index} className="relative ">
            <img
              src={image}
              alt={`Uploaded image ${index}`}
              className="w-40 h-full object-cover rounded-md"
              />
            <button
              type="button"
              onClick={() => removePicture(index)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 focus:outline-none"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PicturesUpload;