import React from "react";
import { useEffect } from "react";

import { GiHouse, GiPineTree } from "react-icons/gi";
import { MdHotelClass } from 'react-icons/md'
import { colors } from "../colors";
import ImageViewer from "./inner/imageViewer";
import useApi from "./../api/useApi";
import productsApi from "../api/products";
import { mainProductApiId } from "./../config";
import { Link } from "react-router-dom";
import orderService from "../services/order";

export default function Main(props) {
  const {
    data: products,
    request: getProducts,
    error: getProductsError,
  } = useApi(productsApi.get, (data) => data, []);

  const getPrimaryProductFiles = () => {
    const product = products.find((product) => product.id === mainProductApiId);
    return product ? product.files : [];
  };

  useEffect(() => {
    getProducts();
  }, []);

  return (
    <>
      <div className="start-page">
        <div
          className="start-page__bg"
          style={{
            backgroundImage: `url(${
              getPrimaryProductFiles()?.find((file) => file.is_primary === true)
                ?.file
            })`,
          }}
        >
          <div className="start-page__bg-gradient"></div>
        </div>
        <div className="start-page__side-line"></div>
        <div className="start-page__body">
          <div className="start-page__line"></div>
          <h1 className="start-page__header">Forest House</h1>
          <h2 className="start-page__subheader">
            <p>Загородный дом с атрибутами хорошей жизни</p>
          </h2>
          <Link
            to={"/cart"}
            className="button"
            style={{ textDecoration: "none" }}
          >
            Забронировать
          </Link>
          {orderService.getCode() &&
            orderService.getOrderId() &&
            orderService.getPhone() &&
            !orderService.getCodeWaiting() && (
              <Link to="/recent" className="button" style={{textDecoration: 'none', marginLeft: 20}}>Ваш заказ</Link>
            )}
        </div>
      </div>
      <section style={{ marginBottom: "10rem" }} className="about">
        <div className="about__header-wrapper">
          <div className="about__header-line"></div>
          <h2 className="about__header">О нас</h2>
          <div className="about__header-line"></div>
        </div>
        <ImageViewer images={getPrimaryProductFiles()} navMinis />
        <div className="about__divider"></div>
        <div
          className="about__info-container"
          style={{
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <div
            className="about__topic"
            style={{
              display: "flex",
              flexDirection: "row",
              backgroundColor: colors["color-bg-10"],
              borderRadius: "1rem",
            }}
          >
            <div
              style={{
                border: `2px solid ${colors.color}`,
                margin: "1rem",
                borderRadius: "10px",
              }}
            >
              <GiHouse className="icon" size={100} color="white" />
            </div>
            <p className="about__topic__header">Уютная атмосфера</p>
          </div>
          <div
            className="about__topic"
            style={{
              display: "flex",
              flexDirection: "row",
              backgroundColor: colors["color-bg-10"],
              borderRadius: "1rem",
            }}
          >
            <div
              style={{
                border: `2px solid ${colors.color}`,
                margin: "1rem",
                borderRadius: "10px",
              }}
            >
              <GiPineTree size={100} className="icon" color="white" />
            </div>
            <p className="about__topic__header">Наедине с природой</p>
          </div>
          <div
            className="about__topic"
            style={{
              display: "flex",
              flexDirection: "row",
              backgroundColor: colors["color-bg-10"],
              borderRadius: "1rem",
            }}
          >
            <div
              style={{
                border: `2px solid ${colors.color}`,
                margin: "1rem",
                borderRadius: "10px",
              }}
            >
              <MdHotelClass size={100} className="icon" color="white" />
            </div>
            <p className="about__topic__header">
              Есть дополнительные услуги
            </p>
          </div>
          <Link
            to="/cart"
            style={{
              width: "100%",
              padding: "1.5rem 0",
              textDecoration: "none",
              display: "flex",
              justifyContent: "center",
            }}
            className="button"
          >
            Забронировать
          </Link>
        </div>
      </section>
    </>
  );
}
