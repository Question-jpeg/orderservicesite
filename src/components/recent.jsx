import React from "react";
import { useEffect } from "react";
import ordersApi from "../api/orders";
import orderService from "../services/order";
import { guestsProductApiId } from "../config";
import { MdOutlineGroups } from "react-icons/md";
import useApi from "./../api/useApi";
import CartItem from "./inner/cartItem";

export default function Recent({ history }) {
  const {
    data: order,
    loading,
    request: getOrder,
  } = useApi(
    ordersApi.get,
    (data) => {
      data.items.sort(({ product: first }, { product: second }) =>
        first.required_product ? 1 : -1
      );
      return data
    },
    {}
  );

  useEffect(() => {
    if (
      orderService.getCode() &&
      orderService.getOrderId() &&
      orderService.getPhone() &&
      !orderService.getCodeWaiting()
    ) {
      window.scrollTo({ top: 0 });
      getOrder();
    } else {
      history.goBack();
    }
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 100,
        minWidth: 500,
      }}
    >
      {loading ? (
        <h1>Пожалуйста, подождите</h1>
      ) : (
        <div style={{ maxWidth: 1200, width: "100%" }}>
          <button onClick={history.goBack} className="button" style={{ marginLeft: -5 }}>
            Вернуться
          </button>
          <div
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <div
              style={{ flex:1, height: 1, backgroundColor: "white" }}
            ></div>
            <h1 style={{ textAlign: "center", margin: '25px 30px' }}>Ваш заказ</h1>
            <div
              style={{ flex: 1, height: 1, backgroundColor: "white" }}
            ></div>
          </div>
          {order.items?.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              icon={
                item.product.id === guestsProductApiId && (
                  <MdOutlineGroups
                    color="white"
                    size={100}
                    style={{ width: 100, height: 100 }}
                  />
                )
              }
              isOne={
                (item.product.time_unit === "D" &&
                  item.product.max_unit === 1) ||
                item.product.time_unit === "H"
              }
              quantity={item.product.id === guestsProductApiId && item.quantity}
              onlyDate={item.product.id === guestsProductApiId}
            />
          ))}
          <button
            className="button"
            onClick={history.goBack}
            style={{
              width: "100%",
              maxWidth: 1000,
              marginLeft: "auto",
              marginRight: "auto",
              marginBottom: 100,
              marginTop: 30,
              display: "flex",
              justifyContent: "center",
            }}
          >
            Вернуться
          </button>
        </div>
      )}
    </div>
  );
}
