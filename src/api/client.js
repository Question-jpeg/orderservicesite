import { create } from "apisauce";

const client = create({
  baseURL: "https://forest--house-api.ru/api/",
});

// client.axiosInstance.interceptors.response.use(null, (error) => {
//   error.response &&
//     error.response.status >= 500 &&
//     alert("Неполадки на сервере. Приносим свои извинения");
//   return Promise.reject();
// });

export default client;
