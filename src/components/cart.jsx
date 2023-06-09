import React from "react";
import { useEffect, useState } from "react";
import Calendar from "./inner/calendar";
import { colors } from "./../colors";
import useApi from "./../api/useApi";
import productsApi from "../api/products";
import ImageViewer from "./inner/imageViewer";
import { mainProductApiId, guestsProductApiId } from "./../config";
import ProductItem from "./inner/productItem";
import { MdOutlineGroups, MdHotel } from "react-icons/md";
import cartsApi from "../api/carts";
import cartService from "../services/cart";
import { Formik } from "formik";
import * as Yup from "yup";
import PriceInfo from "./inner/priceInfo";
import CartItem from "./inner/cartItem";
import Lottie from "lottie-react";
import { Link } from "react-router-dom";
import orderService from "../services/order";

const cartPersonsValidationSchema = Yup.object().shape({
  persons: Yup.number()
    .typeError("Поле должно быть числом")
    .integer("Поле должно быть целочисленным")
    .min(1, "Поле должно быть больше 0")
    .required("Поле должно быть заполнено"),
});

export default function Cart() {
  const {
    data: products,
    request: getProducts,
    loading: productsLoading,
  } = useApi(
    productsApi.get,
    (data) => {
      const guestsProduct = data.find(
        (product) =>
          product.id === guestsProductApiId && product.is_available === true
      );
      const result = data.filter(
        (product) =>
          product.id !== guestsProductApiId && product.is_available === true
      );
      return [...result, ...(guestsProduct ? [guestsProduct] : [])];
    },
    []
  );
  const {
    data: costInfo,
    setData: setCost,
    request: getCost,
    loading: costLoading,
  } = useApi(productsApi.getCost, (data) => data, {});
  const {
    data: busyRanges,
    request: getBusyRanges,
    loading: busyRangesLoading,
  } = useApi(productsApi.getTimeIntervals, (data) => data, []);
  const {
    data: cart,
    request: getCart,
    loading: cartLoading,
  } = useApi(cartsApi.get, (data) => data);
  const {
    data: allowedInterval,
    request: getAllowedInterval,
    loading: allowedIntervalLoading,
  } = useApi(cartsApi.getAllowedInterval, (data) => data, {});
  const {
    data: affectedData,
    request: checkAffected,
    loading: affectedLoading,
  } = useApi(cartsApi.checkAffected, (data) => data, {});

  const [requestLoading, setRequestLoading] = useState(false);

  const [selectedProductId, setSelectedProductId] = useState(mainProductApiId);
  const [selectedCartItemId, setSelectedCartItemId] = useState();
  const [cartId, setCartId] = useState(cartService.getCartId());
  const [createCartError, setCreateCartError] = useState();
  const [cartPersonsChanging, setCartPersonsChanging] = useState(false);
  const [clearCalendarSelection, setClearCalendarSelection] = useState(true);
  const [calendarSelectionError, setCalendarSelectionError] = useState(true);
  const [initialCalendarDates, setInitialCalendarDates] = useState({});

  const isLoading = () =>
    productsLoading ||
    costLoading ||
    busyRangesLoading ||
    cartLoading ||
    allowedIntervalLoading ||
    affectedLoading;

  const getProductFiles = () => {
    const product = products.find(
      (product) => product.id === selectedProductId
    );
    return product ? product.files : [];
  };

  const handlePersonsSubmit = async (values) => {
    setCreateCartError(null);
    if (!cartPersonsChanging) {
      const response = await cartsApi.post(values);
      if (response.ok) {
        const id = response.data.id;
        cartService.storeCartId(id);
        setCartId(id);
        getCart();
      } else {
        if (response.status === 400) setCreateCartError(response.data.message);
      }
    } else {
      const response = await cartsApi.put(values);
      if (response.ok) {
        getCart();
        setCartPersonsChanging(false);
        checkAffected();
      } else {
        if (response.status === 400) setCreateCartError(response.data.message);
      }
    }
  };

  const handleCalendarSubmit = async (start, end, quantity) => {
    setRequestLoading(true);
    if (selectedCartItemId) {
      const response = await cartsApi.updateItem(selectedCartItemId, {
        start_datetime: start,
        end_datetime: end,
        quantity,
      });
      if (response.ok) {
        getCart();
        checkAffected();
      } else if (response.status === 400) {
        alert(response.data.message);
      }
    } else {
      const response = await cartsApi.addItem({
        start_datetime: start,
        end_datetime: end,
        quantity,
        product: selectedProductId,
      });
      if (response.ok) {
        getCart();
        checkAffected();
        setClearCalendarSelection(!clearCalendarSelection);
        if (selectedProductId === mainProductApiId) {
          setSelectedProductId(getSecondaryProducts()[0]?.id);
        }
      } else if (response.status === 400) {
        alert(response.data.message);
      }
    }
    setRequestLoading(false);
  };

  const handleCalendarChange = async (
    start,
    end,
    quantity,
    productId = selectedProductId
  ) => {
    const response = await getCost(productId, {
      start_datetime: start,
      end_datetime: end,
      quantity,
      exclude_order_item_id: null,
    });
    if (!response.ok) {
      setCalendarSelectionError(true);
    } else {
      setCalendarSelectionError(false);
    }
    if (response.status === 400) {
      getTimeView(productId);
    }
  };

  const handleCalendarSelect = () => {
    setCost({});
  };

  const isMainProductInCart = () =>
    cart?.items.find((item) => item.product.id === mainProductApiId);

  const getSecondaryProducts = () =>
    products.filter((product) => product.id !== mainProductApiId);

  const getTimeView = (productId) =>
    getBusyRanges(productId, {
      current_datetime: new Date(),
      exclude_order_item_id: null,
    });

  const handleProductItemChange = (productId) => {
    setSelectedProductId(productId);
    getAllowedInterval(productId);
    getTimeView(productId);
    setClearCalendarSelection(!clearCalendarSelection);
    setInitialCalendarDates({
      start_datetime: null,
      end_datetime: null,
    });
    setCost({});

    setSelectedCartItemId(null);
  };

  const handleCartItemChange = (cartItem) => {
    if (cartItem.id !== selectedCartItemId) {
      const start = cartItem.start_datetime;
      const end = cartItem.end_datetime;
      const quantity = cartItem.quantity;
      const productId = cartItem.product.id;
      setSelectedProductId(productId);
      getAllowedInterval(productId);
      getTimeView(productId);
      setClearCalendarSelection(!clearCalendarSelection);
      setInitialCalendarDates({
        start_datetime: start,
        end_datetime: end,
      });
      handleCalendarChange(start, end, quantity, productId);
      setSelectedCartItemId(cartItem.id);
    }
  };

  const removeCartItem = async (cartItemId) => {
    const response = await cartsApi.removeItem(cartItemId);
    if (response.ok) {
      getCart();

      setClearCalendarSelection(!clearCalendarSelection);
      setSelectedCartItemId(null);

      checkAffected();
    } else if (response.status === 400) {
      alert(response.data.message);
    }
  };

  const init = async () => {
    const productsResponse = await getProducts();
    if (!productsResponse.ok) alert("Ошибка");
    else {
      if (cartService.getCartId()) {
        const cartResponse = await getCart();
        if (!cartResponse.ok) alert("Ошибка");
        else if (
          cartResponse.data.items.find(
            (item) => item.product.id === mainProductApiId
          )
        ) {
          const productId = productsResponse.data.filter(
            (product) => product.id !== mainProductApiId
          )[0]?.id;
          setSelectedProductId(productId);
          getAllowedInterval(productId);
          getTimeView(productId);
          checkAffected();
        }
      } else {
        getTimeView(selectedProductId);
      }
    }
  };

  useEffect(() => {
    init();
    window.scrollTo({ top: 0 });
  }, []);

  return cartId && !cartPersonsChanging ? (
    <div
      style={{
        display: "flex",
        height: "100vh",
        lineHeight: 0,
        letterSpacing: 0,
        flexDirection: "column",
        paddingTop: "100px",
        alignContent: "center",
      }}
    >
      <div
        className="cart-container"
        style={{ marginLeft: "auto", marginRight: "auto" }}
      >
        <div className="cart-workspace">
          <div>
            {selectedCartItemId && (
              <h2
                style={{
                  padding: 15,
                  borderRadius: 15,
                  backgroundColor: colors["color"],
                }}
              >
                Изменение позиции в заказе
              </h2>
            )}
            <h2 style={{ fontSize: 40 }}>
              {
                products.find((product) => product.id === selectedProductId)
                  ?.title
              }
            </h2>
            <ImageViewer
              width={400}
              height={300}
              images={getProductFiles()}
              icon={
                <MdOutlineGroups
                  color="white"
                  size={100}
                  style={{ width: 100, height: 100 }}
                />
              }
            />
            {products.find((product) => product.id === selectedProductId)
              ?.max_persons ? (
              <div
                style={{
                  maxWidth: "100%",
                  backgroundColor: colors["color-bg-2"],
                  borderRadius: 15,
                  marginTop: 10,
                  padding: "5px 20px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <MdHotel size={32} color="white" />
                  <p style={{ fontSize: 20, color: "white" }}>
                    Количество спальных мест
                  </p>
                  <p style={{ fontSize: 32, color: "wheat", margin: 0 }}>
                    {
                      products.find(
                        (product) => product.id === selectedProductId
                      )?.max_persons
                    }
                  </p>
                </div>
              </div>
            ) : null}
            <PriceInfo costInfo={costInfo} />
          </div>
          <div className="cart-container__divider"></div>
          <div>
            <Calendar
              onSubmit={handleCalendarSubmit}
              onChange={handleCalendarChange}
              onSelect={handleCalendarSelect}
              specialIntervals={
                products.find((product) => product.id === selectedProductId)
                  ?.product_special_intervals
              }
              busyRanges={[
                ...busyRanges,
                ...(cart
                  ? cart.items
                      .filter(
                        (item) =>
                          item.product.id === selectedProductId &&
                          item.id !== selectedCartItemId
                      )
                      .map((item) => ({
                        start_datetime: item.start_datetime,
                        end_datetime: item.end_datetime,
                      }))
                  : []),
              ]}
              allowedInterval={allowedInterval}
              clear={clearCalendarSelection}
              error={calendarSelectionError || isLoading() || requestLoading}
              initialDates={initialCalendarDates}
              buttonText={
                selectedCartItemId ? "Сохранить изменения" : "Добавить в заказ"
              }
              isOne={products.find(
                (product) =>
                  product.id === selectedProductId &&
                  ((product.time_unit === "D" && product.max_unit === 1) ||
                    product.time_unit === "H")
              )}
              isTime={products.find(
                (product) =>
                  product.id === selectedProductId && product.time_unit === "H"
              )}
              minTime={
                products.find((product) => product.id === selectedProductId)
                  ?.min_hour
              }
              maxTime={
                products.find((product) => product.id === selectedProductId)
                  ?.max_hour
              }
              minUnits={
                products.find((product) => product.id === selectedProductId)
                  ?.min_unit
              }
              maxUnits={
                products.find((product) => product.id === selectedProductId)
                  ?.max_unit
              }
              isQuantity={selectedProductId === guestsProductApiId}
              quantityName={"Гостей"}
              initialQuantity={
                selectedCartItemId
                  ? cart.items.find((item) => item.id === selectedCartItemId)
                      ?.quantity
                  : 1
              }
            />
            <div
              style={{
                height: 50,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {(isLoading() || requestLoading) && (
                <Lottie
                  animationData={require("../animations/loading.json")}
                  loop
                  autoPlay
                  style={{ width: 200, height: 200 }}
                />
              )}
            </div>
          </div>

          <div className="cart-container__divider second"></div>
        </div>

        <div>
          <h2>Добавить к заказу</h2>
          <div
            style={{
              width: "100%",
              height: "2px",
              backgroundColor: colors["color-bg-5"],
              marginBottom: "20px",
            }}
          ></div>
          {!isMainProductInCart() && (
            <h2 style={{ color: colors["color-lighten10"], marginBottom: 30 }}>
              Будет доступно после заказа дома
            </h2>
          )}
          {getSecondaryProducts().map((product) => (
            <ProductItem
              onClick={() => handleProductItemChange(product.id)}
              key={product.id}
              product={product}
              icon={
                product.id === guestsProductApiId ? (
                  <MdOutlineGroups
                    color="white"
                    size={100}
                    style={{ width: 100, height: 100 }}
                  />
                ) : null
              }
              locked={!isMainProductInCart()}
              active={selectedProductId === product.id && !selectedCartItemId}
            />
          ))}
        </div>
      </div>

      <div
        className="cart-list"
        style={{
          display: "flex",
          marginLeft: "auto",
          marginRight: "auto",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "2px",
            backgroundColor: colors["color-bg-5"],
            marginTop: 20,
          }}
        ></div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <h2 className="cart-list__header">
            Заказ на <span style={{ color: "wheat" }}>{cart?.persons}</span>{" "}
            чел.
          </h2>
          <button
            className="button"
            onClick={() => setCartPersonsChanging(true)}
            style={{
              padding: "5px 10px",
              marginLeft: 10,
              fontSize: 20,
              borderRadius: 15,
            }}
          >
            Изменить
          </button>
        </div>
        <div className="cart-list__content">
          {cart?.items.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onClick={() => handleCartItemChange(item)}
              active={selectedCartItemId === item.id}
              error={affectedData.cart_item_ids?.find((id) => id === item.id)}
              icon={
                item.product.id === guestsProductApiId && (
                  <MdOutlineGroups
                    color="white"
                    size={100}
                    style={{ width: 100, height: 100 }}
                  />
                )
              }
              onRemove={item.product.id !== mainProductApiId && removeCartItem}
              isOne={
                (item.product.time_unit === "D" &&
                  item.product.max_unit === 1) ||
                item.product.time_unit === "H"
              }
              quantity={item.product.id === guestsProductApiId && item.quantity}
              onlyDate={item.product.id === guestsProductApiId}
            />
          ))}
          {affectedData.is_valid && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "baseline",
                backgroundColor: colors["color-bg-3"],
                borderRadius: 25,
              }}
            >
              <h2
                style={{
                  fontSize: 32,
                  marginRight: 20,
                  color: colors["color-lighten10"],
                }}
              >
                Итого:
              </h2>
              <p style={{ fontSize: 40, color: "wheat" }}>
                {cart?.items.reduce(
                  (accumulator, { price }) => accumulator + price,
                  0
                )}
              </p>
              <p
                style={{
                  fontSize: 40,
                  color: "wheat",
                  marginLeft: 3,
                }}
              >
                &#8381;
              </p>
            </div>
          )}
        </div>
        {cart?.items.length > 0 && (
          <Link
            className="button"
            to={affectedData.is_valid ? "/order" : "#"}
            style={{
              margin: "5vh 0 20vh",
              textDecoration: "none",
              display: "flex",
              justifyContent: "center",
              padding: "10px 0",
              backgroundColor: affectedData.is_valid
                ? ""
                : colors["dark-red-darken"],
            }}
          >
            <p
              style={{
                fontSize: 32,
                color: affectedData.is_valid ? "" : "lightgray",
              }}
            >
              {affectedData.message ? affectedData.message : "Оформить Заказ"}
            </p>
          </Link>
        )}
      </div>
    </div>
  ) : (
    <Formik
      initialValues={{ persons: 2 }}
      validationSchema={cartPersonsValidationSchema}
      onSubmit={handlePersonsSubmit}
    >
      {({
        values,
        handleChange,
        handleSubmit,
        errors,
        touched,
        isValid,
        isSubmitting,
      }) => (
        <div
          style={{
            height: "100vh",
            display: "flex",
          }}
        >
          <div
            className="cart-container"
            style={{
              width: 200,
              marginLeft: "auto",
              marginRight: "auto",
              marginTop: "35vh",
              marginBottom: "auto",
              display: "flex",
              flexDirection: "column",
              padding: "10px 20px 30px",
            }}
          >
            <h2>Количество гостей</h2>
            {errors.persons && touched.persons && (
              <p style={{ color: colors["color"], fontSize: 16 }}>
                {errors.persons}
              </p>
            )}
            <input
              type="number"
              name="persons"
              value={values.persons}
              onChange={handleChange}
              style={{
                backgroundColor: colors["color-bg-1"],
                border: "none",
                borderRadius: 10,
                padding: "5px 15px",
                fontSize: 28,
                color: "white",
                outline: "none",
              }}
            />
            {createCartError && (
              <p style={{ color: colors["color"], fontSize: 18 }}>
                {createCartError}
              </p>
            )}
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={!isValid || isSubmitting}
              className="button"
              style={{
                marginTop: 20,
                opacity: isValid && !isSubmitting ? 1 : 0.5,
              }}
            >
              {isSubmitting ? "Корзина формируется" : "Далее"}
            </button>
          </div>
        </div>
      )}
    </Formik>
  );
}
