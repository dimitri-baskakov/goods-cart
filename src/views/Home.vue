<template>
  <div>
    <el-row class="settings-group" :gutter="10">
      <el-divider content-position="left">Настройки</el-divider>
      <el-col :span="12">
        <el-form
          :model="settingsForm"
          @submit.native.prevent
          label-width=""
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
            <el-form-item label="Генерация случайных цен">
              <el-switch v-model="settingsForm.randomMode"></el-switch>
            </el-form-item>
            <el-form-item label="Режим редактирования">
              <el-switch v-model="settingsForm.editMode"></el-switch>
            </el-form-item>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <el-divider content-position="left">Товары и покупки</el-divider>
      <el-col :span="12">
        <div>Товары</div>
        <el-collapse @change="() => {}" v-model="activeGroups">
          <el-collapse-item
            :key="group.id"
            :name="group.id"
            :title="group.name"
            class="group-header"
            v-for="group in goodsParsed"
          >
            <!-- :cell-class-name="cellClassName" -->
            <!-- {{ group.children }} -->
            <goods-group
              :cart="cart"
              :data="group.children"
              :settings-form="settingsForm"
              :names="names"
              :rates="rates"
            >
            </goods-group>
            <!-- <el-table
              :data="group.children"
              :show-header="false"
              border
              style="width: 100%"
            >
              <el-table-column>
                <template slot-scope="scope">
                  <span>
                    {{ scope.row.name }} ({{ scope.row.inStockQuantity }})
                  </span>
                </template>
              </el-table-column>
              <cost-column></cost-column>
              <el-table-column class-name="cost-column" :width="70">
                <template slot-scope="scope">
                  <el-button
                    :disabled="cart.items.some(el => el.id == scope.row.id)"
                    :icon="
                      cart.items.some(el => el.id == scope.row.id)
                        ? `el-icon-shopping-cart-full`
                        : `el-icon-shopping-cart-2`
                    "
                    @click="addToCart(scope.row)"
                    circle
                  ></el-button>
                </template>
              </el-table-column>
            </el-table> -->
          </el-collapse-item>
        </el-collapse>
      </el-col>
      <el-col :span="12">
        <div>Корзина покупок</div>
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
                <template slot="append">шт.</template>
              </el-input>
              <el-alert
                :closable="false"
                description="Количество ограничено"
                show-icon
                type="warning"
                v-show="scope.row.quantity > scope.row.inStockQuantity - 1"
              ></el-alert>
            </template>
          </el-table-column>
          <el-table-column :width="150" label="Цена">
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
                icon="el-icon-delete"
                circle
              ></el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="total-cost">
          Общая сумма: <b>{{ totalCost | price }}</b>
        </div>
      </el-col>
    </el-row>
    <br />
    <br />
    <br />
    <!-- <div>{{ goods }}</div> -->
    <br />
    <br />
    <!-- <div>{{ goodsParsed }}</div> -->
  </div>
</template>

<script>
// import CostColumn from "@/components/CostColumn.vue";
import GoodsGroup from "@/components/GoodsGroup.vue";
import Vue from "vue";
import names from "@/data/names.json";
// import { Value } from "@/data/data.json";

export default {
  beforeDestroy() {
    clearInterval(this.getJsonInterval);
  },
  components: {
    // CostColumn,
    GoodsGroup
  },
  computed: {
    totalCost: function() {
      return this.cart.items.reduce(
        (acc, currItem) => acc + currItem.quantity * currItem.cost,
        0
      );
    },
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
          cost: this.convertToRub(el.C),
          id: el.T,
          idGroup: el.G,
          inStockQuantity: el.P,
          name: this.names[el.G].B[el.T].N,
          priceStatus: 0
        });
      });

      return result;
    }
  },
  async created() {
    await this.getJsonData();
    Object.keys(this.goodsParsed).forEach((el, index) => {
      Vue.set(this.activeGroups, index, +el);
    });
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
        items: [],
        totalCost: this.totalCost
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
    addToCart(good) {
      this.cart.items.push({
        cost: good.cost,
        groupName: this.names[good.idGroup].G,
        id: good.id,
        inStockQuantity: good.inStockQuantity,
        name: good.name,
        quantity: 1
      });
    },
    // cellClassName({ row, column, rowIndex, columnIndex }) {
    // cellClassName({ row, columnIndex }) {
    //   // console.log(row, column, rowIndex, columnIndex);
    //   if (columnIndex == 1 && row.priceStatus == 1) {
    //     return "cost-column cost-column_price_up";
    //   }
    //   if (columnIndex == 1 && row.priceStatus == -1) {
    //     return "cost-column cost-column_price_down";
    //   }
    //   if (columnIndex == 1) {
    //     return "cost-column";
    //   }
    //   return "";
    // },
    convertToRub(val = 0) {
      return (val * this.rates.USD).toFixed(2);
    },
    deleteFromCart(good) {
      this.cart.items = this.cart.items.filter(el => el.id != good.id);
    },
    async getJsonData() {
      let data = await this.$axios.get("/data.json");
      let goods = data.data.Value.Goods;
      if (this.settingsForm.randomMode) {
        console.log("---getJsonData---", new Date());
        goods = goods.map(el => {
          // let good = this.goods.find(good => good.T == el.T);
          // el.priceStatus =
          //   (!good && "0") ||
          //   Math.sign(this.convertToRub(el.C) - this.convertToRub(good.C));
          el.C = 0.01 + (2 * el.C - 0.01) * Math.random();
          return el;
        });
      }
      this.goods = goods;
    }
    // goodsChanges(value, oldValue) {
    //   console.log(value);
    //   console.log(oldValue);
    //   // oldValue = oldValue.map(el => {
    //   //   let good = value.find(good => good.T == el.T);
    //   //   el.priceStatus =
    //   //     (!good && "0") ||
    //   //     Math.sign(this.convertToRub(el.C) - this.convertToRub(good.C));
    //   //   return el;
    //   // });
    //   // return oldValue;
    // }
  },
  name: "PageHome"
  // watch: {
  //   goodsParsed: {
  //     deep: true,
  //     handler: "goodsChanges"
  //   }
  // }
};
</script>

<style lang="sass">
.cost-column
  background: $color-info
  font-weight: 700

.cost-column_price_up
  background: $color-error

.cost-column_price_down
  background: $color-success

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
