import client from "./client";

const apiEndpoint = 'products/'

const get = () => client.get(apiEndpoint)
const getTimeIntervals = (id, data) => client.post(`${apiEndpoint}${id}/timeView/`, data)
const getCost = (id, data) => client.post(`${apiEndpoint}${id}/getPrice/`, data)

export default {
    get,
    getTimeIntervals,
    getCost
}
