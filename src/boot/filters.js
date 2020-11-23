import Vue from "vue";

Vue.filter("convertToRub", (value = 0, rate = 1) => {
  return (value * rate).toFixed(2);
});

Vue.filter("price", value => {
  return parseFloat(value || 0).toLocaleString("ru", {
    currency: "RUB",
    currencyDisplay: "symbol",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: "currency"
  });
});
