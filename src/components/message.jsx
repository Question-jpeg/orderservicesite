import React from "react";
import { Link } from "react-router-dom";
import { colors } from "./../colors";

export default function Message({ location }) {
  const header = location.state?.header;
  const message = location.state?.message;
  const footerLabel = location.state?.footerLabel;

  const footers = {
    error: (
      <Link
        to="/"
        className="button"
        style={{
          textDecoration: "none",
          display: "flex",
          justifyContent: "center",
        }}
      >
        На главную
      </Link>
    ),
    success: (
      <>
        <p
          style={{
            margin: 0,
            fontSize: 20,
            color: "white",
            textAlign: "center",
          }}
        >
          Для подтверждения заказа необходимо внести предоплату
        </p>

        <p
          style={{
            margin: 0,
            fontSize: 32,
            color: "wheat",
            textAlign: "center",
          }}
        >
          2000₽
        </p>
        <div
          style={{
            display: "flex",
            marginLeft: "auto",
            marginRight: "auto",
            alignItems: "center",
          }}
        >
          <p style={{ fontSize: 20, margin: "0 10px", color: "white" }}>
            На номер
          </p>
          <p
            style={{
              margin: 0,
              fontSize: 28,
              color: "wheat",
              textAlign: "center",
              marginBottom: 10,
            }}
          >
            +79025607103
          </p>
        </div>
      </>
    ),
  };

  return (
    <div
      style={{
        maxWidth: 1000,
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      <div
        className="cart-container"
        style={{
          width: "100%",
          borderRadius: 15,
          flexDirection: "column",
          margin: "0 10px",
        }}
      >
        <h1 style={{ fontSize: 40 }}>{header}</h1>
        <div
          style={{ width: "100%", height: 1, backgroundColor: "wheat" }}
        ></div>
        <p style={{ fontSize: 28, color: "wheat" }}>{message}</p>
        {footers[footerLabel]}
      </div>
    </div>
  );
}
