import Vue from "vue";
Vue.filter("price", value => {
  return parseFloat(value || 0).toLocaleString("ru", {
    currency: "RUB",
    currencyDisplay: "symbol",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: "currency"
  });
});
