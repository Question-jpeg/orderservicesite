import { useState } from "react";

const useApi = (apiFunc, postProcessFunc, initialValue = null) => {
  const [data, setData] = useState(initialValue);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const request = async (...args) => {
    setError(false);
    setLoading(true);
    const response = await apiFunc(...args);
    setLoading(false);

    if (response.ok) {
      const data = postProcessFunc(response.data);
      setData(data);
    } else {
      setError(
        response.data
          ? response.data.message
            ? response.data.message
            : response.data
          : true
      );
      setData(initialValue)
    }
    return response;
  };

  return { request, data, setData, error, setError, loading };
};

export default useApi
