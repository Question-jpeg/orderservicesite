import React from "react";
import { useState, useEffect } from "react";

import { colors } from "../../colors";
import { getLocaleUTCString, getUTCDate } from "../../utils/getDate";
import * as Yup from "yup";
import { Formik } from "formik";
import TimePicker from "./timePicker";

const range = (startAt, size) => {
  return [...Array(size).keys()].map((i) => i + startAt);
};

const weekdays = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];
const months = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

const types = {
  selected: {
    disabled: false,
    style: { backgroundColor: colors["color-lighten10"], color: "white" },
    name: "selected",
  },
  selectedDisabled: {
    disabled: true,
    style: { backgroundColor: colors["color"], color: "white" },
    name: "selected",
  },
  selectedInvalid: {
    disabled: true,
    style: { backgroundColor: colors["dark-red"], color: "lightgrey" },
  },
  busy: {
    disabled: true,
    style: {
      backgroundColor: colors["color-bg-8"],
      color: colors["color-bg-5"],
      border: `1px solid ${colors["dark-red"]}`,
    },
  },
  specialInterval: {
    disabled: false,
    style: {
      backgroundColor: "transparent",
      border: `1px solid ${colors["color-bg-8"]}`,
      color: "white",
    },
  },
  out: {
    disabled: true,
    style: {
      backgroundColor: "transparent",
      color: colors["color-bg-4"],
    },
  },
  today: {
    disabled: false,
    style: {
      backgroundColor: "transparent",
      color: "white",
      border: `1px solid ${colors["color-bg-3"]}`,
    },
  },
  neutral: {
    disabled: false,
    style: {
      backgroundColor: "transparent",
      color: "white",
    },
  },
};

const quantityValidationSchema = Yup.object().shape({
  quantity: Yup.number()
    .typeError("Должно быть числом")
    .integer("Должно быть целочисленным")
    .min(1, "Должно быть больше 0")
    .max(20, "Должно быть меньше 21")
    .required("Должно быть заполнено"),
});

export default function Calendar({
  busyRanges = [],
  specialIntervals = [],
  allowedInterval = {},
  initialDates = {},
  isOne,
  isTime,
  minTime,
  maxTime,
  minUnits,
  maxUnits,
  isQuantity,
  quantityName,
  initialQuantity,
  onSubmit,
  onChange,
  onSelect,
  clear,
  buttonText,
  error,
}) {
  const currentDate = new Date(new Date().setHours(0, 0, 0, 0));
  const [viewDate, setViewDate] = useState(currentDate);
  const [currentKind, setCurrentKind] = useState("start");
  const [selectedStart, setSelectedStart] = useState(
    initialDates.start_datetime &&
      new Date(getUTCDate(initialDates.start_datetime).setHours(0, 0, 0, 0))
  );
  const [selectedEnd, setSelectedEnd] = useState(
    initialDates.end_datetime &&
      new Date(getUTCDate(initialDates.end_datetime).setHours(0, 0, 0, 0))
  );
  const [selectedStartTime, setSelectedStartTime] = useState();
  const [selectedEndTime, setSelectedEndTime] = useState();
  const [quantity, setQuantity] = useState(1);

  const isBusy = (date) => {
    const endDateInterval = busyRanges.find(
      (interval) =>
        getUTCDate(interval.end_datetime).setHours(0, 0, 0, 0) ===
        date.getTime()
    );
    const startDateInterval = busyRanges.find(
      (interval) =>
        getUTCDate(interval.start_datetime).setHours(0, 0, 0, 0) ===
        date.getTime()
    );
    return (
      busyRanges.filter(
        (interval) =>
          date.getTime() >
            getUTCDate(interval.start_datetime).setHours(0, 0, 0, 0) &&
          date.getTime() <
            getUTCDate(interval.end_datetime).setHours(0, 0, 0, 0)
      ).length > 0 ||
      (endDateInterval && startDateInterval)
    );
  };

  const isSpecialInterval = (date) => {
    return (
      specialIntervals.filter(
        (interval) =>
          (interval.is_weekends === true &&
            (date.getDay() === 0 || date.getDay() === 6)) ||
          (interval.start_datetime &&
            interval.end_datetime &&
            date.getTime() >=
              getUTCDate(interval.start_datetime).setHours(0, 0, 0, 0) &&
            date.getTime() <
              getUTCDate(interval.end_datetime).setHours(0, 0, 0, 0))
      ).length > 0
    );
  };

  const isOutOfAllowedInterval = (date) => {
    const allowedStart =
      allowedInterval.start_datetime &&
      getUTCDate(allowedInterval.start_datetime).setHours(0, 0, 0, 0);
    const allowedEnd =
      allowedInterval.end_datetime &&
      getUTCDate(allowedInterval.end_datetime).setHours(0, 0, 0, 0);
    return (
      allowedStart &&
      allowedEnd &&
      (date.getTime() < allowedStart || date.getTime() > allowedEnd)
    );
  };

  const isOut = (date) => {
    return (
      currentDate.getTime() > date.getTime() ||
      isBusy(date) ||
      isOutOfAllowedInterval(date)
    );
  };

  const isOnlyOut = (date) => {
    return (
      currentDate.getTime() > date.getTime() || isOutOfAllowedInterval(date)
    );
  };

  const isSelected = (date) => {
    return (
      (selectedStart && date.getTime() === selectedStart.getTime()) ||
      (!isOne && selectedEnd && date.getTime() === selectedEnd.getTime())
    );
  };

  const isInSelectedRange = (date) => {
    return (
      selectedStart &&
      selectedEnd &&
      date.getTime() > selectedStart.getTime() &&
      date.getTime() < selectedEnd.getTime()
    );
  };

  const isStartLargerThanEnd = (date) => {
    if (
      selectedEnd &&
      currentKind === "start" &&
      date.getTime() > selectedEnd.getTime()
    ) {
      setSelectedEnd(null);
      return true;
    } else if (
      selectedStart &&
      currentKind === "end" &&
      date.getTime() < selectedStart.getTime()
    ) {
      setSelectedStart(null);
      return true;
    }
    return false;
  };

  const isIntersection = (date, kind) => {
    const start = kind === "start" ? date : selectedStart;
    const end = kind === "end" ? date : selectedEnd;
    return (
      start &&
      end &&
      busyRanges.filter(
        (interval) =>
          getUTCDate(interval.start_datetime).setHours(0, 0, 0, 0) <
            end.getTime() &&
          getUTCDate(interval.end_datetime).setHours(0, 0, 0, 0) >
            start.getTime()
      ).length > 0
    );
  };

  const handleDateSelection = (date, quantity) => {
    onSelect && onSelect();
    if (!isOne) {
      let clear = !isStartLargerThanEnd(date);
      if (currentKind === "start") {
        if (isIntersection(date, currentKind)) {
          setSelectedEnd(null);
          clear = false;
        }
        setSelectedStart(date);
        onChange &&
          clear &&
          selectedEnd &&
          onChange(
            getLocaleUTCString(date),
            getLocaleUTCString(selectedEnd),
            quantity
          );
      } else {
        if (isIntersection(date, currentKind)) {
          setSelectedStart(null);
          clear = false;
        }
        setSelectedEnd(date);
        onChange &&
          clear &&
          selectedStart &&
          onChange(
            getLocaleUTCString(selectedStart),
            getLocaleUTCString(date),
            quantity
          );
      }
    } else {
      const end = new Date(new Date(date).setDate(date.getDate() + 1));
      setSelectedStart(date);
      setSelectedEnd(end);
      onChange(getLocaleUTCString(date), getLocaleUTCString(end), quantity);
    }
  };

  const isDisabled = (date, kind) => {
    const plusDay = kind === "start" ? 1 : -1;
    const dateToCheck = new Date(
      new Date(date).setDate(date.getDate() + plusDay)
    );
    return (
      (!isTime ? isOut(dateToCheck) : isOnlyOut(dateToCheck)) ||
      (kind === "start" &&
        busyRanges.find(
          (interval) =>
            getUTCDate(interval.start_datetime).setHours(0, 0, 0, 0) ===
            date.getTime()
        )) ||
      (kind === "end" &&
        busyRanges.find(
          (interval) =>
            getUTCDate(interval.end_datetime).setHours(0, 0, 0, 0) ===
            date.getTime()
        ))
    );
  };

  const getType = (date) => {
    if (isSelected(date))
      return isOut(date) ? types.selectedInvalid : types.selectedDisabled;
    if (isInSelectedRange(date))
      return isOut(date) ? types.selectedInvalid : types.selected;
    if (isOnlyOut(date)) return types.out;
    if (isBusy(date)) return types.busy;
    if (isDisabled(date, currentKind)) return types.out;
    if (isSpecialInterval(date)) return types.specialInterval;
    if (date.getTime() === currentDate.getTime()) return types.today;
    return types.neutral;
  };

  const plusMonth = (count) => {
    setViewDate(
      new Date(new Date(viewDate).setMonth(viewDate.getMonth() + count))
    );
  };

  const daysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getOffsetCount = () => {
    const dayOfWeek = new Date(new Date(viewDate).setDate(1)).getDay();
    if (dayOfWeek === 0) return 6;
    return dayOfWeek - 1;
  };

  const isValid = () => {
    return (
      selectedStart &&
      selectedEnd &&
      !(
        error ||
        (!isTime
          ? isOut(selectedStart) || isOut(selectedEnd)
          : isOnlyOut(selectedStart) || isOnlyOut(selectedEnd)) ||
        isDisabled(selectedStart, "start") ||
        (isTime ? false : isDisabled(selectedEnd, "end")) ||
        isIntersection(selectedStart, "start")
      )
    );
  };

  const handleQuantityChange = (value) => {
    setQuantity(value);
    handleDateSelection(
      currentKind === "start" ? selectedStart : selectedEnd,
      value
    );
  };

  const handleSubmit = () => {
    onSubmit(
      getLocaleUTCString(isTime ? selectedStartTime : selectedStart),
      getLocaleUTCString(isTime ? selectedEndTime : selectedEnd),
      isQuantity ? quantity : 1
    );
  };

  useEffect(() => {
    setCurrentKind("start");
    setSelectedStart(null);
    setSelectedEnd(null);
  }, [clear]);

  useEffect(() => {
    if (initialDates.start_datetime) {
      const start = getUTCDate(initialDates.start_datetime);
      setSelectedStart(new Date(start.setHours(0, 0, 0, 0)));
      if (isTime) setSelectedStartTime(start);
    }
    if (initialDates.end_datetime) {
      const end = getUTCDate(initialDates.end_datetime);
      setSelectedEnd(new Date(end.setHours(0, 0, 0, 0)));
      if (isTime) setSelectedEndTime(end);
    }
  }, [initialDates, isTime]);

  useEffect(() => {
    if (isQuantity && initialQuantity) setQuantity(initialQuantity);
  }, [initialQuantity, isQuantity]);

  useEffect(() => {
    if (selectedStartTime && selectedEndTime) {
      onChange(
        getLocaleUTCString(selectedStartTime),
        getLocaleUTCString(selectedEndTime),
        quantity
      );
    }
  }, [selectedStartTime, selectedEndTime]);

  const renderSubmitButton = (onClick, isFormValid) => (
    <button
      onClick={() => isFormValid && onClick()}
      disabled={!isFormValid}
      style={{
        width: "100%",
        margin: "15px 0",
        opacity: !isFormValid ? 0.3 : 1,
      }}
      className="button"
    >
      {buttonText}
    </button>
  );

  return (
    <div
      style={{
        lineHeight: 0,
        letterSpacing: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          borderRadius: "15px",
          padding: "10px 0",
          backgroundColor: colors["color-bg-1"],
          marginTop: 10,
        }}
      >
        <h2 style={{ alignSelf: "center" }}>
          Выбрать {isOne ? "Дату" : "Даты"}
        </h2>
        {!isOne && (
          <>
            <div
              style={{
                width: "100%",
                height: "1px",
                backgroundColor: "white",
                marginBottom: "10px",
              }}
            ></div>
            <div style={{ display: "flex", justifyContent: "space-around" }}>
              <button
                onClick={() => setCurrentKind("start")}
                style={{
                  backgroundColor:
                    currentKind === "start" ? colors["color"] : "transparent",
                  border:
                    currentKind === "start"
                      ? "none"
                      : `2px solid ${colors["color"]}`,
                }}
                className="calendar__date-button"
              >
                Старт
              </button>
              <button
                onClick={() => setCurrentKind("end")}
                style={{
                  backgroundColor:
                    currentKind === "end" ? colors["color"] : "transparent",
                  border:
                    currentKind === "end"
                      ? "none"
                      : `2px solid ${colors["color"]}`,
                }}
                className="calendar__date-button"
              >
                Конец
              </button>
            </div>
          </>
        )}
      </div>
      <div
        style={{
          backgroundColor: colors["color-bg-1"],
          borderRadius: "15px",
          marginTop: "10px",
          padding: "15px 10px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            margin: "0 10px",
          }}
        >
          <button
            onClick={() => plusMonth(-1)}
            style={{
              color: "white",
              fontSize: "16px",
              backgroundColor: "transparent",
              border: "none",
            }}
          >
            &#10094;
          </button>
          <p style={{ color: "white", fontSize: "24px" }}>
            {months[viewDate.getMonth()]}
          </p>
          <button
            onClick={() => plusMonth(1)}
            style={{
              color: "white",
              fontSize: "16px",
              backgroundColor: "transparent",
              border: "none",
            }}
          >
            &#10095;
          </button>
        </div>
        <div className="calendar__weekdays">
          {weekdays.map((day) => (
            <p
              key={day}
              style={{
                textTransform: "uppercase",
                color: "white",
                justifyContent: "center",
                display: "flex",
              }}
            >
              {day}
            </p>
          ))}
        </div>
        <div
          style={{
            width: "95%",
            height: "1px",
            backgroundColor: colors["color-darken10"],
            display: "flex",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        ></div>
        <div className="calendar__dates">
          {range(0, getOffsetCount()).map((n) => (
            <div key={n}></div>
          ))}
          {range(1, daysInMonth(viewDate)).map((day) => {
            const type = getType(new Date(new Date(viewDate).setDate(day)));
            return (
              <div
                key={day}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  border: `2px solid ${colors["color-bg-7"]}`,
                }}
              >
                <button
                  onClick={() => {
                    const date = new Date(new Date(viewDate).setDate(day));
                    handleDateSelection(date, quantity);
                  }}
                  disabled={type.disabled}
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: "10px",
                    fontSize: "24px",
                    fontWeight: type.name === "selected" ? "700" : "400",

                    border: "none",
                    padding: "3px 7.5px",
                    ...type.style,
                  }}
                >
                  {day}
                </button>
              </div>
            );
          })}
        </div>
      </div>
      {isTime && (
        <>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              borderRadius: "15px",
              padding: "10px 0",
              backgroundColor: colors["color-bg-1"],
              marginTop: 10,
            }}
          >
            <h2 style={{ alignSelf: "center" }}>Выбрать Время</h2>
          </div>
          {selectedStart && (
            <TimePicker
              selectedDate={selectedStart}
              minUnits={minUnits}
              maxUnits={maxUnits}
              setSelectedStartTime={setSelectedStartTime}
              setSelectedEndTime={setSelectedEndTime}
              onChange={(startString, endString) =>
                onChange(startString, endString, quantity)
              }
              allowedInterval={allowedInterval}
              initialStart={initialDates.start_datetime}
              initialEnd={initialDates.end_datetime}
              minTime={minTime}
              maxTime={maxTime}
            />
          )}
        </>
      )}
      {isQuantity ? (
        <Formik
          initialValues={{ quantity: 2 }}
          onSubmit={handleSubmit}
          validationSchema={quantityValidationSchema}
        >
          {({ handleChange, isValid: isFormValid, handleSubmit }) => (
            <>
              <p style={{ color: "wheat", fontSize: 20 }}>
                Количество {quantityName}
              </p>
              <input
                type="number"
                name="quantity"
                value={quantity}
                onChange={(e) => {
                  handleChange(e);
                  handleQuantityChange(e.target.value);
                }}
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
              {renderSubmitButton(handleSubmit, isValid() && isFormValid)}
            </>
          )}
        </Formik>
      ) : (
        renderSubmitButton(handleSubmit, isValid())
      )}
    </div>
  );
}
