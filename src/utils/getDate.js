export const getUTCDate = (dateString) => {
  const date = new Date(dateString);
  return new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
    date.getUTCMilliseconds()
  );
};

export const getLocaleUTCString = (dat) => {
  const date = new Date(dat);
  return `${date.getFullYear()}-${("0" + (date.getMonth() + 1)).slice(-2)}-${(
    "0" + date.getDate()
  ).slice(-2)}T${("0" + date.getHours()).slice(-2)}:${(
    "0" + date.getMinutes()
  ).slice(-2)}:00.000Z`;
};

export const getDateFromTimeString = (timeString, nextDay = false) => {
  const hours = parseInt(timeString.slice(0, 2));
  const minutes = parseInt(timeString.slice(3, 5));
  const date = new Date();
  nextDay && date.setDate(date.getDate() + 1);
  return new Date(date.setHours(hours, minutes, 0, 0));
};

export const getTimeTextFromTimeString = (timeString) => {
  if (timeString.charAt(0) === "0") timeString = timeString.slice(1);
  timeString = timeString.slice(0, -3);
  return timeString;
};

export const getTimeDateFromDate = (dat, toDate) => {
  const date = new Date(dat);
  return new Date(
    new Date(toDate).setHours(date.getHours(), date.getMinutes())
  );
};

export const getUTCTimeTextFromDate = (dat) => {
  const date = new Date(dat);
  return `${date.getUTCHours()}:${("0" + date.getUTCMinutes()).slice(-2)}`;
};

export const getTimeTextFromDate = (dat) => {
  const date = new Date(dat);
  return `${date.getHours()}:${("0" + date.getMinutes()).slice(-2)}`;
};

export const getUTCDateText = (dat) => {
  const date = new Date(dat);
  return `${("0" + date.getUTCDate()).slice(-2)}.${(
    "0" +
    (date.getUTCMonth() + 1)
  ).slice(-2)}.${date.getUTCFullYear()}`;
};

export const getDateTimeText = (dat) => {
  const date = new Date(dat);
  return `${("0" + date.getDate()).slice(-2)}.${(
    "0" +
    (date.getMonth() + 1)
  ).slice(-2)}.${date.getFullYear()}   ${("0" + date.getHours()).slice(-2)}:${(
    "0" + date.getMinutes()
  ).slice(-2)}`;
};

export const getUTCDateTimeText = (dat) => {
  const date = getUTCDate(dat);
  return getDateTimeText(date);
};
