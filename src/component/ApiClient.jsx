// src/utils/apiClient.js
import { useNavigate } from "react-router-dom";
//VITE_APP_APITYPE nfdc-web-api
const BASE_URL_API = `${import.meta.env.VITE_BASE_URL}/${import.meta.env.VITE_APP_APITYPE}/`;
console.log({ BASE_URL_API })
const ApiClient = () => {
  const token = localStorage.getItem("token");

  const navigate = useNavigate();
  const postRequestApi = async (endpoint, options = {}) => {
    //const formData = new FormData();
    const jsondata = JSON.stringify(options);

    try {
      const response = await fetch(`${BASE_URL_API}${endpoint}`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",

        },
        body: jsondata,
        credentials: "include",
      });
      // console.log(BASE_URL_API, "url")


      // Parse JSON response if the status code is not 401
      const data = await response.json();

      return data;
    } catch (error) {
      console.error("API request error:", error);
      // throw error;
    }
  };
  const getRequestApi = async (endpoint, options = {}) => {
    try {
      const params = new URLSearchParams(options);
      let apiUrl = `${BASE_URL_API}${endpoint}`;
      if (params) {
        // console.log({ params })
        apiUrl += `?${params}`;
      }
      const response = await fetch(apiUrl, {
        method: "get",
        headers: {
          // "Content-Type": "application/json",
          //  Authorization: 'Bearer ' + token
        },
        credentials: "include",
      });



      // Parse JSON response if the status code is not 401
      const data = await response.json();
      return data;
    } catch (error) {

    }
  };

  const postRequestApiwithLogin = async (endpoint, options = {}) => {
    //const formData = new FormData();
    const jsondata = JSON.stringify(options);

    try {
      const response = await fetch(`${BASE_URL_API}${endpoint}`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Authorization: 'Bearer ' + token
        },
        body: jsondata,
        credentials: "include",
      });
      // console.log(BASE_URL_API, "url")

      if (response.status == 401) {
        // Redirect to login page
        return;
      }

      // Parse JSON response if the status code is not 401
      const data = await response.json();

      return data;
    } catch (error) {
      console.error("API request error:", error);
      // throw error;
    }
  };
  const getRequestApiwithLogin = async (endpoint, options = {}) => {
    try {
      const params = new URLSearchParams(options);
      let apiUrl = `${BASE_URL_API}${endpoint}`;
      if (params) {
        // console.log({ params })
        apiUrl += `?${params}`;
      }
      const response = await fetch(apiUrl, {
        method: "get",
        headers: {
          "Content-Type": "application/json",
          Authorization: 'Bearer ' + token
        },
        credentials: "include",
      });

      if (response.status == 401) {
        // localStorage.removeItem("token");
        // navigate("/login"); // Redirect to login page
        // return;
      }

      // Parse JSON response if the status code is not 401
      const data = await response.json();
      return data;
    } catch (error) {
      //  localStorage.removeItem("token");
      console.error("API request error:", error);
      navigate("/login");
      //throw error;
    }
  };
  const postFormDataApiwithLogin = async (endpoint, formData) => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${BASE_URL_API}${endpoint}`, {
        method: "POST",
        headers: {
          "Authorization": 'Bearer ' + token
          // DO NOT set Content-Type header for FormData
        },
        body: formData,
        credentials: "include",
      });

      if (response.status === 401) {
        // Handle unauthorized
        return;
      }

      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error("API request error:", error);
      throw error;
    }
  };
  return {
    getRequestApi, postRequestApi, postRequestApiwithLogin, getRequestApiwithLogin, postFormDataApiwithLogin
  };
};

export default ApiClient;
