<template>
  <div>
    <el-row class="settings-group" :gutter="10">
      <el-divider content-position="left">Настройки</el-divider>
      <el-col :span="24">
        <el-form
          :model="settingsForm"
          @submit.native.prevent
          label-width="200px"
          ref="settingsForm"
        >
          <el-form-item label="Курс доллара">
            <el-input-number
              :max="80"
              :min="20"
              :precision="2"
              :step="0.01"
              placeholder="Введите курс"
              step-strictly
              type="number"
              v-model="rates.USD"
            ></el-input-number>
          </el-form-item>
          <el-form-item label="Генерация случайных цен">
            <el-switch v-model="settingsForm.randomMode"></el-switch>
          </el-form-item>
          <el-form-item label="Режим редактирования">
            <el-switch v-model="settingsForm.editMode"></el-switch>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <el-col :xs="24" :sm="24" :md="12">
        <el-divider content-position="left">Товары</el-divider>
        <el-collapse v-model="activeGroups">
          <el-collapse-item
            :key="group.id"
            :name="group.id"
            :title="group.name"
            class="group-header"
            v-for="group in goodsParsed"
          >
            <goods-group
              :cart="cart"
              :data="group.children"
              :names="names"
              :rates="rates"
              :settings-form="settingsForm"
            ></goods-group>
          </el-collapse-item>
        </el-collapse>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12">
        <el-divider content-position="left">Корзина покупок</el-divider>
        <el-table :data="cart.items" style="width: 100%">
          <el-table-column label="Наименование товара и описание">
            <template slot-scope="scope">
              <span>
                <strong>{{ scope.row.groupName }}.</strong> {{ scope.row.name }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="Количество">
            <template slot-scope="scope">
              <el-input
                :max="scope.row.inStockQuantity"
                :min="1"
                :precision="0"
                :step="1"
                placeholder="Введите количество"
                step-strictly
                type="number"
                v-model="scope.row.quantity"
              >
                <template slot="append">
                  <span>шт.</span>
                </template>
              </el-input>
              <el-alert
                :closable="false"
                description="Количество ограничено"
                show-icon
                type="warning"
                v-show="isQuantityLimited(scope.row)"
              ></el-alert>
            </template>
          </el-table-column>
          <el-table-column :width="100" label="Цена">
            <template slot-scope="scope">
              <span>
                <strong>{{ scope.row.cost | price }}.</strong> / шт.
              </span>
            </template>
          </el-table-column>
          <el-table-column :width="70">
            <template slot-scope="scope">
              <el-button
                @click="deleteFromCart(scope.row)"
                circle
                icon="el-icon-delete"
              ></el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="total-cost">
          Общая сумма: <b>{{ totalCost | price }}</b>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import GoodsGroup from "@/components/GoodsGroup.vue";
import Vue from "vue";
import names from "@/data/names.json";

export default {
  beforeDestroy() {
    // delete interval timers for periodically getting data.json
    clearInterval(this.getJsonInterval);
  },
  components: {
    GoodsGroup
  },
  computed: {
    // object - structure for collect tree-like grouped goods
    goodsParsed: function() {
      let result = {};
      this.goods.forEach(el => {
        !result[el.G] &&
          (result[el.G] = {
            children: [],
            id: el.G,
            name: this.names[el.G].G
          });
        result[el.G].children.push({
          cost: this.$options.filters.convertToRub(el.C, this.rates.USD),
          id: el.T,
          idGroup: el.G,
          inStockQuantity: el.P,
          name: this.names[el.G].B[el.T].N,
          priceStatus: 0
        });
      });
      return result;
    },
    totalCost: function() {
      return this.cart.items.reduce(
        (acc, currItem) => acc + currItem.quantity * currItem.cost,
        0
      );
    }
  },
  async created() {
    // initial getting data from data.json
    await this.getJsonData();

    // initial expand all groups of goods
    Object.keys(this.goodsParsed).forEach((el, index) => {
      Vue.set(this.activeGroups, index, +el);
    });

    // Getting data from data.json at an interval of settingsForm.updateInterval ms
    this.getJsonInterval = setInterval(
      function() {
        this.getJsonData();
      }.bind(this),
      this.settingsForm.updateInterval
    );
  },
  data() {
    return {
      activeGroups: [],
      cart: {
        items: []
      },
      getJsonInterval: null,
      goods: [],
      names: names,
      rates: {
        USD: 76
      },
      settingsForm: {
        editMode: false,
        randomMode: false,
        updateInterval: 15000
      }
    };
  },
  methods: {
    deleteFromCart(good) {
      this.cart.items = this.cart.items.filter(el => el.id != good.id);
    },
    // getting data.json
    async getJsonData() {
      let data = await this.$axios.get("/data.json");
      let goods = data.data.Value.Goods;
      if (this.settingsForm.randomMode) {
        console.log("---getJsonData---", new Date());
        goods = goods.map(el => {
          el.C = 0.01 + (2 * el.C - 0.01) * Math.random();
          return el;
        });
      }
      this.goods = goods;
    },
    isQuantityLimited(good) {
      return good.quantity > good.inStockQuantity - 1;
    }
  },
  name: "PageHome"
};
</script>

<style lang="sass">
.group-header .el-collapse-item__header
  background-color: $color-primary
  font-weight: 700
  padding-left: 10px

.settings-group
  margin: 40px 0
  text-align: left

.total-cost
  margin-top: 40px
  b
    color: #F56C6C
</style>
