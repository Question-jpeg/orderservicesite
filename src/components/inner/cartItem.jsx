import React from "react";
import { colors } from "./../../colors";
import { getUTCDate, getTimeTextFromDate } from "./../../utils/getDate";
import { MdArrowRightAlt, MdHotel } from "react-icons/md";

export default function CartItem({
  item,
  onClick,
  onRemove,
  active,
  icon,
  error,
  isOne,
  quantity,
  onlyDate,
}) {
  const product = item.product;
  const start = getUTCDate(item.start_datetime);
  const end = getUTCDate(item.end_datetime);

  const renderNights = () => {
    const count = Math.round(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    return (
      <div
        style={{
          border: "2px solid wheat",
          borderRadius: 5,
          marginLeft: 15,
          padding: "5px 7px",
          display: "flex",
          alignItems: "baseline",
        }}
      >
        <p
          style={{
            color: "white",
            fontSize: 24,
            margin: 0,
          }}
        >
          {count}
        </p>
        <p style={{ color: "white", fontSize: 24, margin: 0, marginLeft: 5 }}>
          {(count > 10 && count < 15) || count % 10 > 4 || count % 10 < 1
            ? "Ночей"
            : count % 10 < 2
            ? "Ночь"
            : "Ночи"}
        </p>
      </div>
    );
  };

  return (
    <div
      className={`cart-list__item ${active && "active"}`}
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: colors["color-bg-2"],
        lineHeight: 1,
        marginBottom: 15,
      }}
    >
      <div style={{ display: "flex" }}>
        <div
          className="cart-list__image-underneath"
          style={{
            backgroundColor: colors["color-bg-8"],
            borderRadius: 30,
            alignSelf: "flex-start",
          }}
        >
          {icon ? (
            icon
          ) : (
            <img
              className="cart-list__image"
              src={product.files[0].file_thumbnail}
              style={{ borderRadius: 20 }}
              alt=""
            />
          )}
        </div>
        <div style={{ width: "100%", marginLeft: 20 }}>
          <div className="cart-item__title">
            <h2 style={{ lineHeight: 0, fontSize: 32 }}>{product.title}</h2>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginLeft: 15,
              }}
            >
              <div
                style={{
                  padding: "5px 7px",
                  backgroundColor: !error
                    ? colors["color"]
                    : colors["dark-red"],
                  color: !error ? "white" : "lightgray",
                  fontWeight: "700",
                  fontSize: 24,
                  borderRadius: 10,
                }}
              >
                {start.getDate()}
              </div>
              {!isOne && (
                <>
                  <MdArrowRightAlt size={24} color="white" />
                  <div
                    style={{
                      padding: "5px 7px",
                      backgroundColor: !error
                        ? colors["color"]
                        : colors["dark-red"],
                      color: !error ? "white" : "lightgray",
                      fontWeight: "700",
                      fontSize: 24,
                      borderRadius: 10,
                    }}
                  >
                    {end.getDate()}
                  </div>
                  {renderNights()}
                </>
              )}
            </div>            
          </div>
          {product.max_persons && (
              <div
                style={{
                  maxWidth: 200,
                  width: '100%',
                  backgroundColor: colors["color-bg-1"],
                  borderRadius: 15,
                  marginTop: 10,
                  marginBottom: 10,
                  padding: "10px 30px",
                  display: "flex",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 15
                  }}
                >
                  <MdHotel size={32} color="white" />
                  <p style={{ fontSize: 20, color: "white", margin: 0 }}>
                    Количество спальных мест
                  </p>
                  <p style={{ fontSize: 32, color: "wheat", margin: 0 }}>
                    {product.max_persons}
                  </p>
                </div>
              </div>
            )}
          {!error ? (
            <div style={{ marginLeft: 15 }}>
              {!onlyDate && (
                <>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <p
                      style={{
                        color: "white",
                        fontSize: 22,
                        margin: "0 10px 0 0",
                        marginBottom: 10,
                      }}
                    >
                      Время старта услуги
                    </p>
                    <div
                      style={{
                        color: "white",
                        fontWeight: "700",
                        width: "fit-content",
                        fontSize: 24,
                        borderRadius: 10,
                        padding: 5,
                        marginBottom: 5,
                      }}
                    >
                      {getTimeTextFromDate(start)}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      margin: "5px 0 10px",
                    }}
                  >
                    <p
                      style={{
                        color: "white",
                        fontSize: 22,
                        margin: "0 10px 0 0",
                      }}
                    >
                      Время окончания услуги
                    </p>
                    <div
                      style={{
                        color: "white",
                        fontWeight: "700",
                        width: "fit-content",
                        fontSize: 24,
                        borderRadius: 10,
                        padding: 5,
                      }}
                    >
                      {getTimeTextFromDate(end)}
                    </div>
                  </div>
                </>
              )}
              {quantity && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    width: "fit-content",
                    lineHeight: 0,
                  }}
                >
                  <p
                    style={{
                      color: "white",
                      fontWeight: "700",
                      fontSize: 24,
                      marginRight: 10,
                    }}
                  >
                    Количество:
                  </p>

                  <p
                    style={{
                      color: "wheat",
                      fontWeight: "700",
                      fontSize: 32,
                    }}
                  >
                    {quantity}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div
              style={{ backgroundColor: colors["dark-red"], borderRadius: 15 }}
            >
              <p
                style={{
                  fontSize: 24,
                  color: "lightgray",
                  padding: "7px 15px",
                  fontWeight: "700",
                }}
              >
                Переназначьте дату
              </p>
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          lineHeight: 0,
          padding: "0 20px 10px 0",
          alignItems: "baseline",
        }}
      >
        {onRemove && (
          <button
            className="delete-button"
            style={{
              color: "lightgray",
              border: "none",
              width: "100%",
              marginRight: 20,
              marginTop: 15,
            }}
            onClick={() => onRemove(item.id)}
          >
            Удалить позицию
          </button>
        )}
        {!error && (
          <>
            <p
              style={{
                color: "wheat",
                fontSize: 28,
                marginRight: 20,
                marginLeft: "auto",
              }}
            >
              Цена:
            </p>
            <p
              style={{
                color: "wheat",
                fontSize: 32,
              }}
            >
              {item.price || item.total_price}
            </p>
            <p
              style={{
                fontSize: 32,
                color: "wheat",
                marginLeft: 3,
              }}
            >
              &#8381;
            </p>
          </>
        )}
      </div>
    </div>
  );
}
