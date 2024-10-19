import axios from "axios"


// TODO UPDATE THE BASE URL HERE SO THAT IT WORKS IN THE DEPLOYEMENT AS WELL
export const axiosInstance = axios.create({
	baseURL: "/api/api/v1",
	withCredentials: true
})