export const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export const postRequest = async (url: string, body: any) => {
	  const response = await fetch(url, {
	method: "POST",
	headers: {
	  "Content-Type": "application/json",
	},
	body,
  });

  const data = await response.json();

  if (!response.ok) {
	let message;
	if (data?.message) {
	  message = data.message;
	} else {
		message = data;
	}
	return  {error: true, message};
  }

return data;
};

export const getRequest = async (url: string) => {
	const token = localStorage.getItem("jwt");

	const response = await fetch(url, {
		headers: {
			...(token ? { Authorization: `Bearer ${token}` } : {}),
		},
	});

	const data = await response.json();

	if (!response.ok) {
		let message = "An error occurred...";

		if (data?.message) {
			message = data.message;
		}

		return { error: true, message };
	}
	return data;
};