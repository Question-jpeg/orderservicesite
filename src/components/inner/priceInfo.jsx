import React from "react";

import { colors } from "../../colors";

export default function PriceInfo({ costInfo }) {
  return (
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
          alignItems: "baseline",
          justifyContent: "space-between",
        }}
      >
        <p style={{ color: "white", fontSize: 24 }}>Стоимость:</p>
        <div style={{ display: "flex" }}>
          <p style={{ fontSize: 30, color: "wheat" }}>{costInfo.total_price}</p>
          <p style={{ fontSize: 30, color: "wheat", marginLeft: 3 }}>&#8381;</p>
        </div>
      </div>
    </div>
  );
}
