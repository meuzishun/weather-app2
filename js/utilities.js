export const removeElementContents = function (element) {
  const children = [...element.children];
  if (children.length > 0) {
    children.forEach((child) => {
      element.removeChild(child);
    });
  }
};

export const removeElement = function (element) {
  const parent = element.parentElement;
  parent.removeChild(element);
};

export const temperatureConversion = function (typeTo, typeFrom, value) {
  const conversionLookup = {
    celsius: {
      fahrenheit: function (temp) {
        return (5 / 9) * (temp - 32);
      },
      kelvin: function (temp) {
        return temp - 273;
      },
    },
    fahrenheit: {
      celsius: function (temp) {
        return (9 / 5) * temp + 32;
      },
      kelvin: function (temp) {
        return (9 / 5) * (temp - 273) + 32;
      },
    },
    kelvin: {
      celsius: function (temp) {
        return temp + 273;
      },
      fahrenheit: function (temp) {
        return (5 / 9) * (temp - 32) + 273;
      },
    },
  };
  return conversionLookup[typeTo][typeFrom](value);
};

export const formatTime = function (val, tz) {
  const here = new Date();
  const localTimeZoneOffset = here.getTimezoneOffset() * 60;
  const now = new Date((val + (localTimeZoneOffset + tz)) * 1000);
  let pastNoon = false;
  let hrs = now.getHours();
  if (hrs > 12) {
    pastNoon = true;
    hrs %= 12;
  }
  let min = now.getMinutes();
  if (min < 10) {
    min = `0${min}`;
  }
  return `${hrs}:${min} ${pastNoon ? 'PM' : 'AM'}`;
};

export const convert_metersSec_to_mph = function (val) {
  return val * 2.2369;
};

export const getDayOfWeek = function (num) {
  return [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ][num];
};

export const propConversionLookup = {
  dt: 'time',
  name: 'city',
  zip: 'zipcode',
  lat: 'latitude',
  lon: 'longitude',
};
