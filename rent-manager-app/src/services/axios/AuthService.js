import axios from "axios"
import { ACCESS_TOKEN } from "../../constants/Connect";

const BASE_URL = "http://localhost:8080/"

class AuthService {

    uploadAvatar(formData) {
    return axios.post(BASE_URL + 'auth/upload-avatar', formData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`
        }
      }
    );

  }

  uploadProfile(formData) {
    return axios.post(BASE_URL + 'auth/upload-profile', formData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`
        }
      }
    );

  }
}
export default new AuthService();