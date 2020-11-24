import { mount, shallowMount, createLocalVue } from "@vue/test-utils";
// import Vue from "vue";
import GoodsGroup from "@/components/GoodsGroup.vue";
import Element from "element-ui";
import "@/boot/filters.js";

const localVue = createLocalVue();
localVue.use(Element);

describe("GoodsGroup.vue", () => {
  it("renders props.data when transferred", () => {
    let data = JSON.parse(
      `[ { "cost": "12008.00", "id": 1, "idGroup": 1, "inStockQuantity": 1, "name": "Алгоритмы. Построение и анализ. Т. Кормен, Ч. Лейзерсон, Р. Ривест, К. Штайн.", "costStatus": 0 }, { "cost": "14972.00", "id": 2, "idGroup": 1, "inStockQuantity": 99, "name": "Совершенный код. Стив Макконнелл.", "costStatus": 0 }, { "cost": "1368.00", "id": 3, "idGroup": 1, "inStockQuantity": 31, "name": "JavaScript. Подробное руководство. Дэвид Флэнаган.", "costStatus": 0 } ]`
    );
    const wrapper = mount(GoodsGroup, {
      localVue,
      propsData: {
        data,
        settingsForm: {
          editMode: false
        }
      }
    });
    expect(wrapper.findAll("table.el-table__body tbody > tr").length).toBe(3);
  });

  it("emit addToCart", () => {
    const wrapper = shallowMount(GoodsGroup, {
      localVue
    });
    wrapper.vm.$emit("addToCart");
    wrapper.vm.$emit("addToCart", { id: 1 });
    wrapper.vm.$emit("addToCart", { id: 1 });
    expect(wrapper.emitted().addToCart).toBeTruthy();
    expect(wrapper.emitted().addToCart.length).toBe(3);
    expect(wrapper.emitted().addToCart[2]).toEqual([{ id: 1 }]);
  });
});
