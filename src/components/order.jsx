import React from "react";
import { useEffect, useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import "yup-phone";
import cartService from "../services/cart";
import { colors } from "./../colors";
import Public from "./public";
import ordersApi from "../api/orders";
import orderService from "../services/order";
import { mainProductApiId } from "./../config";
import { getUTCDateTimeText } from "../utils/getDate";
import { Link } from "react-router-dom";

const validationSchema = Yup.object().shape({
  phone: Yup.string()
    .phone("RU", undefined, "Некорректный ввод номера мобильного телефона")
    .required("Обязательное поле"),
  name: Yup.string()
    .min(3, "Не менее 3 символов")
    .max(50, "Не более 50 символов")
    .required("Обязательное поле"),
  agreement: Yup.boolean().oneOf([true], "Согласитесь с условиями оферты"),
});

const codeValidationSchema = Yup.object().shape({
  code: Yup.string().min(4).max(4).required(),
});

const formFieldStyle = {
  backgroundColor: colors["color-bg-1"],
  border: "none",
  borderRadius: 10,
  padding: "5px 15px",
  fontSize: 28,
  color: "white",
  fontWeight: "500",
  outline: "none",
  width: "90%",
};

export default function Order({ history }) {
  const [isRules, setIsRules] = useState(false);
  const [codeError, setCodeError] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);

  const handleSubmit = async (values) => {
    const response = await ordersApi.post(values);
    if (response.ok) {
      orderService.storeCodeWaiting(true);
      orderService.storePhone(values.phone);
      orderService.storeOrderId(response.data.id);
      cartService.removeCartId();
    } else {
      alert(response.data.message);
    }
  };

  const handleCodeSubmit = async (values) => {
    const response = await ordersApi.verify(values.code);
    if (response.ok) {
      orderService.storeCode(values.code);
      orderService.removeCodeWaiting();
      const orderResponse = await ordersApi.get();
      let mainProductItem = false;
      if (orderResponse.ok) {
        const order = orderResponse.data;
        mainProductItem = order.items.find(
          (item) => item.product.id === mainProductApiId
        );
      }
      history.replace("message", {
        header: "Заказ принят",
        message: mainProductItem
          ? `Ждём вас ${getUTCDateTimeText(mainProductItem.start_datetime)} !`
          : "Ждём вас!",
        footerLabel: "success",
      });
    } else {
      if (response.status === 403) {
        history.replace("message", {
          message: response.data.message,
          header: "Ошибка",
          footerLabel: "error",
        });
        orderService.removeCodeWaiting();
      } else if (response.status >= 500) {
        alert("Ошибка на сервере");
      } else {
        setCodeError(response.data.message);
      }
    }
  };

  const handleResend = async () => {
    setResendDisabled(true);
    const response = await ordersApi.getNewCode();
    setTimeout(() => setResendDisabled(false), 20000);
    if (!response.ok) {
      setCodeError(response.data.message);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0 });
    const cartId = cartService.getCartId();
    if (!cartId && !orderService.getCodeWaiting()) history.goBack();
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: isRules ? "flex-start" : "center",
        overflowX: "hidden",
      }}
    >
      <Formik
        initialErrors={{ agreement: "123" }}
        initialValues={{
          phone: orderService.getPhone() || 7,
          name: "",
          agreement: false,
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleSubmit,
          isValid,
          isSubmitting,
        }) =>
          !isRules ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                maxWidth: "90%",
                margin: "100px 0",
              }}
            >
              {!orderService.getCodeWaiting() && (
                <button
                  onClick={() => history.goBack()}
                  className="button"
                  style={{ width: 200, marginBottom: 10, padding: "10px 0" }}
                >
                  Вернуться
                </button>
              )}
              <div
                style={{
                  backgroundColor: colors["color-bg-8"],
                  padding: "10px 20px",
                  borderRadius: 15,
                }}
              >
                <div className="form__field-container">
                  <h2 style={{ lineHeight: 0, fontWeight: "400" }}>Телефон</h2>
                  {errors.phone && touched.phone && <p>{errors.phone}</p>}
                  <input
                    onChange={handleChange}
                    style={formFieldStyle}
                    value={values.phone}
                    type="number"
                    name="phone"
                  />
                </div>
                <div className="form__field-container">
                  <h2 style={{ lineHeight: 0, fontWeight: "400" }}>Имя</h2>
                  {errors.name && touched.name && <p>{errors.name}</p>}
                  <input
                    onChange={handleChange}
                    style={formFieldStyle}
                    value={values.name}
                    type="text"
                    name="name"
                  />
                </div>
                <div
                  className="form__field-container"
                  style={{ justifyContent: "center", display: "flex" }}
                >
                  {errors.agreement && touched.agreement && (
                    <p>{errors.agreement}</p>
                  )}
                  <div
                    style={{
                      display: "flex",
                      marginTop: 20,
                      alignItems: "center",
                    }}
                  >
                    <p style={{ margin: "0 3px 0 0", color: "wheat" }}>
                      Соглашаюсь с условиями
                    </p>
                    <p
                      onClick={() => setIsRules(true)}
                      style={{
                        color: "wheat",
                        lineHeight: 0,
                        textDecoration: "underline",
                        cursor: "pointer",
                      }}
                    >
                      Оферты
                    </p>
                    <input
                      onChange={handleChange}
                      value={values.agreement}
                      style={{
                        accentColor: "wheat",
                        width: 15,
                        height: 15,
                        marginLeft: 20,
                        outline: `1px solid wheat`,
                      }}
                      type="checkbox"
                      name="agreement"
                    />
                  </div>
                </div>
              </div>
              {orderService.getCodeWaiting() && (
                <Formik
                  initialValues={{ code: "" }}
                  validationSchema={codeValidationSchema}
                  onSubmit={handleCodeSubmit}
                >
                  {({ handleChange, isValid, isSubmitting, handleSubmit }) => (
                    <div>
                      <div
                        style={{
                          backgroundColor: colors["color-bg-8"],
                          padding: "10px 20px",
                          borderRadius: 15,
                          marginTop: 10,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      >
                        <h2
                          style={{
                            fontWeight: "400",
                            margin: 0,
                            textAlign: "center",
                            marginTop: 5,
                          }}
                        >
                          Необходимо подтвердить номер телефона
                        </h2>
                        <div
                          style={{
                            width: "100%",
                            height: 1,
                            backgroundColor: colors["color"],
                            marginBottom: 10,
                            marginTop: 5,
                          }}
                        ></div>
                        <h2
                          style={{
                            fontWeight: "400",
                            margin: 0,
                            textAlign: "center",
                            marginTop: 5,
                          }}
                        >
                          Cмс с кодом было отправлено на
                        </h2>

                        <h2
                          style={{
                            fontWeight: "400",
                            margin: 0,
                            marginBottom: 10,
                            color: "wheat",
                            fontSize: 32,
                          }}
                        >
                          +{orderService.getPhone()}
                        </h2>
                      </div>
                      <div
                        style={{
                          backgroundColor: colors["color-bg-8"],
                          padding: "10px 20px",
                          borderRadius: 15,
                          marginTop: 10,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      >
                        {codeError && (
                          <p
                            style={{
                              color: "wheat",
                              fontSize: 24,
                              margin: 0,
                              marginBottom: 10,
                            }}
                          >
                            {codeError}
                          </p>
                        )}
                        <div
                          style={{ display: "flex", justifyContent: "center" }}
                        >
                          <input
                            name="code"
                            type="number"
                            style={formFieldStyle}
                            onChange={handleChange}
                            placeholder="Код"
                          />
                          <button
                            className="button"
                            onClick={handleResend}
                            disabled={resendDisabled}
                            style={{
                              padding: "5px 0",
                              marginLeft: 10,
                              fontSize: 18,
                              width: "90%",
                              borderRadius: 10,
                              opacity: resendDisabled ? 0.5 : 1,
                            }}
                          >
                            Выслать код повторно
                          </button>
                        </div>
                      </div>
                      <button
                        disabled={!isValid || isSubmitting}
                        type="submit"
                        onClick={handleSubmit}
                        className="button"
                        style={{
                          width: "100%",
                          marginTop: 10,
                          padding: "10px 0",
                          opacity: !isValid || isSubmitting ? 0.5 : 1,
                        }}
                      >
                        {isSubmitting ? "Подтверждение" : "Подтвердить"}
                      </button>
                    </div>
                  )}
                </Formik>
              )}
              {!orderService.getCodeWaiting() && (
                <button
                  className="button"
                  type="submit"
                  disabled={!isValid || isSubmitting}
                  style={{
                    opacity: !isValid || isSubmitting ? 0.5 : 1,
                    marginTop: 10,
                  }}
                  onClick={handleSubmit}
                >
                  {isSubmitting ? "Заказ оформляется" : "Оформить заказ"}
                </button>
              )}
            </div>
          ) : (
            <div style={{ marginTop: 100, padding: 30 }}>
              <button className="button" onClick={() => setIsRules(false)}>
                Вернуться
              </button>
              <Public />
              <button
                className="button"
                style={{ width: "100%", marginBottom: 100 }}
                onClick={() => setIsRules(false)}
              >
                Вернуться
              </button>
            </div>
          )
        }
      </Formik>
    </div>
  );
}
