import client from "./client";
import cartService from "../services/cart";

const apiEndpoint = "carts/";
const apiChildEndpoint = (cartId) => `carts/${cartId}/items/`;

const post = (data) => {
  const cartId = cartService.getCartId();
  return !cartId && client.post(apiEndpoint, data);
};
const get = () => client.get(`${apiEndpoint}${cartService.getCartId()}/`);
const put = (data) =>
  client.put(`${apiEndpoint}${cartService.getCartId()}/`, data);

const addItem = (data) =>
  client.post(apiChildEndpoint(cartService.getCartId()), data);
const updateItem = (id, data) =>
  client.put(`${apiChildEndpoint(cartService.getCartId())}${id}/`, data);
const removeItem = (id) =>
  client.delete(`${apiChildEndpoint(cartService.getCartId())}${id}/`);

const getAllowedInterval = (product_id) =>
  client.post(
    `${apiChildEndpoint(cartService.getCartId())}get_allowed_interval/`,
    { product_id }
  );

const checkAffected = () =>
  client.get(`${apiChildEndpoint(cartService.getCartId())}is_valid/`);

export default {
  post,
  get,
  put,
  addItem,
  updateItem,
  removeItem,
  getAllowedInterval,
  checkAffected
};
