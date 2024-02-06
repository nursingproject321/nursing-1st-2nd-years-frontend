import axios from "axios";
// console.log("API URL:", process.env.REACT_APP_API_URL);
//axios.defaults.baseURL = "http://localhost:8000/api";
axios.defaults.baseURL = "https://brainy-gown-foal.cyclic.cloud/api";

export const getAuthTokenFromLocalStorage = () =>
  localStorage.getItem("auth-token");

export const setTokenInHeader = () => {
  axios.defaults.headers.common["x-auth-token"] =
    getAuthTokenFromLocalStorage();
};

export const setAuthTokenToLocalStorage = (authToken) => {
  localStorage.setItem("auth-token", authToken);
  setTokenInHeader();
};
