import cartService from "../services/cart";
import orderService from "../services/order";
import client from "./client";

const apiEndpoint = "orders/";

const post = (data) =>
  client.post(apiEndpoint, { ...data, cart_id: cartService.getCartId() });
const get = () =>
  client.post(`${apiEndpoint}${orderService.getOrderId()}/get_order/`, {
    code: orderService.getCode(),
    phone: orderService.getPhone(),
  });
const verify = (code) =>
  client.post(`${apiEndpoint}${orderService.getOrderId()}/verify_order/`, {
    code,
    phone: orderService.getPhone(),
  });

const getNewCode = () =>
  client.post(`${apiEndpoint}${orderService.getOrderId()}/get_new_code/`, {
    phone: orderService.getPhone(),
  });

export default {
  post,
  get,
  verify,
  getNewCode
};
