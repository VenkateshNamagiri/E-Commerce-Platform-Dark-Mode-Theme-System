import axios from 'axios'

// backend origin, used to build full URLs for uploaded images
export const API_BASE_URL = 'http://localhost:5000'

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true, // send/receive the Flask session cookie
})

export default api
