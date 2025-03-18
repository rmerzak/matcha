import useAuthStore from "../store/useAuthStore";

function CommonTags() {
    const {authUser} = useAuthStore();

    return (
      <span className="flex flex-wrap">
        {authUser?.interests?.map((interest: any, index) => (
          <button 
            key={index} 
            className="border rounded-2xl m-1 py-1 px-3 inline-block"
          >
            {interest.label}
          </button>
        ))}
      </span>
    );
  }
  
  export default CommonTags;
  