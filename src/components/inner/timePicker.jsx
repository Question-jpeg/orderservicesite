import React from "react";
import { useState, useEffect } from "react";
import { colors } from "./../../colors";
import { range } from "./../../utils/range";
import { getDateFromTimeString, getUTCDate } from "./../../utils/getDate";

const getCoordinates = (radius) => {
  return [
    ...range(-90, 12, 30).map((angle) => {
      const angleInRadians = (angle * Math.PI) / 180;
      return [
        Math.round(Math.cos(angleInRadians) * radius),
        Math.round(Math.sin(angleInRadians) * radius),
      ];
    }),
  ];
};

const types = {
  selected: {
    disabled: true,
    style: {
      backgroundColor: colors["color-lighten10"],
      color: "white",
      fontWeight: "700",
    },
  },
  out: {
    disabled: true,
    style: {
      backgroundColor: "transparent",
      color: colors["color-bg-4"],
      fontWeight: "400",
    },
  },
  neutral: {
    disabled: false,
    style: {
      backgroundColor: "transparent",
      color: "wheat",
      fontWeight: "400",
    },
  },
};

export default function TimePicker({
  selectedDate,
  setSelectedStartTime,
  setSelectedEndTime,
  initialStart,
  initialEnd,
  minTime,
  maxTime,
  minUnits,
  maxUnits,
}) {
  const [selectedHour, setSelectedHour] = useState(
    initialStart && getUTCDate(initialStart).getHours()
  );
  const [selectedMinute, setSelectedMinute] = useState(
    initialStart ? getUTCDate(initialStart).getMinutes() : 0
  );
  const [selectedDuration, setSelectedDuration] = useState(
    initialStart &&
      initialEnd &&
      (getUTCDate(initialEnd).getTime() - getUTCDate(initialStart).getTime()) /
        (1000 * 60 * 60)
  );
  const [currentKind, setCurrentKind] = useState("hour");

  const isIn = (timeString) => {
    const maxDate = new Date(
      getDateFromTimeString(maxTime).setHours(
        getDateFromTimeString(maxTime).getHours() - minUnits
      )
    );
    const mxTime = `${("0" + maxDate.getHours()).slice(-2)}:${(
      "0" + maxDate.getMinutes()
    ).slice(-2)}:00`;
    if (minTime <= mxTime) return minTime <= timeString && timeString <= mxTime;
    else return minTime <= timeString || timeString <= mxTime;
  };

  const isInWithoutOffset = (timeString) => {
    if (minTime <= maxTime)
      return minTime <= timeString && timeString <= maxTime;
    else return minTime <= timeString || timeString <= maxTime;
  };

  const getTimeString = (hours, minutes) =>
    `${("0" + (hours % 24)).slice(-2)}:${("0" + (minutes ? minutes : 0)).slice(
      -2
    )}:00`;

  const isOut = (units) => {
    if (currentKind === "hour") {
      return !isIn(getTimeString(units, selectedMinute));
    } else {
      return !isIn(getTimeString(selectedHour, units));
    }
  };

  const getType = (units) => {
    if (isOut(units)) return types.out;
    if (
      (currentKind === "hour" && selectedHour === units) ||
      (currentKind === "minute" && selectedMinute === units)
    )
      return types.selected;
    return types.neutral;
  };

  const getTimeBlocks = () => {
    if (selectedHour && (selectedMinute === 0 ? true : selectedMinute)) {
      return range(minUnits, maxUnits + 1 - minUnits, 1).filter((hours) =>
        isInWithoutOffset(getTimeString(selectedHour + hours, selectedMinute))
      );
    }
    return [];
  };

  useEffect(() => {
    if (
      selectedDate &&
      selectedHour &&
      (selectedMinute === 0 ? true : selectedMinute) &&
      selectedDuration
    ) {
      const selectedStart = new Date(
        new Date(selectedDate).setHours(selectedHour, selectedMinute)
      );
      setSelectedStartTime(selectedStart);
      setSelectedEndTime(
        new Date(
          new Date(selectedStart).setHours(
            selectedStart.getHours() + selectedDuration
          )
        )
      );
    }
  }, [selectedDate]);

  useEffect(() => {
    if (initialStart && initialEnd) {
      const start = getUTCDate(initialStart);
      const end = getUTCDate(initialEnd);

      setSelectedHour(start.getHours());
      setSelectedMinute(start.getMinutes());

      setSelectedDuration((end.getTime() - start.getTime()) / (1000 * 60 * 60));
    }
  }, [initialStart, initialEnd]);

  return (
    <div style={{ marginTop: 10 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 10,
        }}
      >
        <button
          onClick={() => setCurrentKind("hour")}
          style={{
            marginRight: 5,
            backgroundColor: "transparent",
            border:
              currentKind === "hour" ? `2px solid ${colors["color"]}` : "none",
            color: "white",
            fontSize: 36,
            borderRadius: 10,
            lineHeight: 0.6,
            padding: "0 15px 15px",
          }}
        >
          {selectedHour ? selectedHour : "--"}
        </button>
        {/* <p style={{ color: "white", fontSize: 48, margin: 0 }}>:</p> */}
        <button
          onClick={() => setCurrentKind("minute")}
          style={{
            backgroundColor: "transparent",
            color: "white",
            fontSize: 36,
            border:
              currentKind === "minute"
                ? `2px solid ${colors["color"]}`
                : "none",
            borderRadius: 10,
            lineHeight: 0.6,
            padding: "0 15px 15px",
          }}
        >
          {selectedMinute
            ? ("0" + selectedMinute).slice(-2)
            : selectedMinute === 0
            ? "00"
            : "--"}
        </button>
      </div>
      <div
        style={{
          width: 200,
          height: 200,
          borderRadius: "50%",
          backgroundColor: colors["color-bg-2"],
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        {getCoordinates(75).map(([x, y], index) => {
          const units = currentKind === "hour" ? index + 12 : index * 5;
          const type = getType(units);
          return (
            <button
              key={index}
              onClick={() => {
                if (!type.disabled) {
                  const change = (start) => {
                    if (selectedDuration) {
                      setSelectedStartTime(start);
                      setSelectedEndTime(
                        new Date(
                          new Date(start).setHours(
                            start.getHours() + selectedDuration
                          )
                        )
                      );
                    }
                  };
                  if (currentKind === "hour") {
                    setSelectedHour(units);
                    const selectedStart = new Date(
                      new Date(selectedDate).setHours(units, selectedMinute)
                    );
                    change(selectedStart);
                  } else {
                    setSelectedMinute(units);
                    const selectedStart = new Date(
                      new Date(selectedDate).setHours(selectedHour, units)
                    );
                    change(selectedStart);
                  }
                }
              }}
              style={{
                position: "absolute",
                cursor: "pointer",
                backgroundColor: type.style.backgroundColor,
                transform: `translate(${x}px, ${y}px)`,
                borderRadius: 20,
                border: "none",
              }}
            >
              <p
                style={{
                  fontSize: 30,
                  margin: "0 0 2px 0",
                  color: type.style.color,
                  fontWeight: type.style.fontWeight,
                }}
              >
                {units}
              </p>
            </button>
          );
        })}
        <div
          style={{
            width: 5,
            height: 5,
            borderRadius: 5,
            backgroundColor: "wheat",
          }}
        ></div>

        <div
          style={{
            width: 2,
            height: 50,
            backgroundColor: "wheat",
            position: "absolute",
            transform: `translateY(-22.5px) rotate(${
              currentKind === "hour"
                ? selectedHour
                  ? (selectedHour - 12) * 30
                  : 0
                : selectedMinute
                ? (selectedMinute / 5) * 30
                : 0
            }deg)`,
            transition: "transform 0.5s",
            transformOrigin: "0 50px",
          }}
        ></div>
      </div>
      <h2 style={{ textAlign: "center" }}>Забронировать на</h2>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          width: 300,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        {getTimeBlocks().map((hour) => {
          const isSelected = hour === selectedDuration;
          return (
            <button
              key={hour}
              style={{
                backgroundColor: isSelected ? colors["color"] : "transparent",
                border: `1px solid ${colors["color"]}`,
                borderRadius: 10,
                margin: 5,
              }}
              onClick={() => {
                setSelectedDuration(hour);
                const selectedStart = new Date(
                  new Date(selectedDate).setHours(selectedHour, selectedMinute)
                );
                setSelectedStartTime(selectedStart);
                setSelectedEndTime(
                  new Date(
                    new Date(selectedStart).setHours(
                      selectedStart.getHours() + hour
                    )
                  )
                );
              }}
            >
              <p
                style={{
                  color: "white",
                  margin: 0,
                  fontSize: 30,
                  fontWeight: isSelected ? "700" : "400",
                }}
              >
                {hour}
              </p>
              <p
                style={{
                  color: "white",
                  margin: 0,
                  fontWeight: isSelected ? "700" : "400",
                }}
              >
                {hour < 2 ? "Час" : hour < 5 ? "Часа" : "Часов"}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
