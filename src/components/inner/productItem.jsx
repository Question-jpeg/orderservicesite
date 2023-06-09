import React from "react";
import { colors } from "../../colors";
import { MdHotel } from "react-icons/md";

export default function ProductItem({
  product,
  icon,
  active,
  locked,
  onClick,
}) {
  return (
    <div
      onClick={() => !locked && onClick()}
      className={`product-list-item ${active && "active"}`}
      style={{
        display: "flex",
        marginBottom: 10,
        backgroundColor: colors["color-bg-2"],
        borderRadius: 20,
        padding: 15,
        cursor: locked ? "not-allowed" : "pointer",
      }}
    >
      {icon ? (
        icon
      ) : (
        <img
          style={{ width: "100px", height: "100px", borderRadius: 15 }}
          src={product.files[0]?.file_thumbnail}
          alt=""
        />
      )}
      <div style={{ marginLeft: 20, width: 300 }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <h2>{product.title}</h2>
          {product.max_persons ? (
            <>
              <MdHotel size={24} color="white" style={{ marginLeft: 10 }} />
              <h2 style={{ margin: "0 0 0 5px", fontSize: 32 }}>
                {product.max_persons}
              </h2>
            </>
          ) : null}
        </div>
        <div
          style={{
            width: "100%",
            height: 1,
            backgroundColor: colors["color-bg-5"],
          }}
        ></div>
        <p style={{ color: "wheat", fontSize: 20, lineHeight: 1 }}>
          {product.description}
        </p>
      </div>
    </div>
  );
}
