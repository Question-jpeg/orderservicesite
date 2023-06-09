const cartIdKey = "cart-id";

const storeCartId = (id) => localStorage.setItem(cartIdKey, id);
const getCartId = () => localStorage.getItem(cartIdKey);
const removeCartId = () => localStorage.removeItem(cartIdKey)

export default {
  storeCartId,
  getCartId,
  removeCartId
};
