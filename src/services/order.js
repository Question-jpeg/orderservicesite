
const phoneKey = "phone";
const codeKey = 'order-code'
const orderIdKey = 'order-id'
const isCodeWaiting = 'is-waiting'

const storePhone = (phone) => localStorage.setItem(phoneKey, phone);
const storeCode = (code) => localStorage.setItem(codeKey, code)
const storeOrderId = (id) => localStorage.setItem(orderIdKey, id)
const storeCodeWaiting = (status) => localStorage.setItem(isCodeWaiting, status)

const getPhone = () => localStorage.getItem(phoneKey)
const getCode = () => localStorage.getItem(codeKey)
const getOrderId = () => localStorage.getItem(orderIdKey)
const getCodeWaiting = () => localStorage.getItem(isCodeWaiting)

const removeCodeWaiting = () => localStorage.removeItem(isCodeWaiting)

export default {
  storePhone,
  storeCode,
  storeOrderId,
  storeCodeWaiting,
  getPhone,
  getCode,
  getOrderId,
  getCodeWaiting,
  removeCodeWaiting
};
