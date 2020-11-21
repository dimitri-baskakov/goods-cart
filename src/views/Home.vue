<template>
  <div>
    <el-row :gutter="10">
      <el-col :span="12">
        <el-collapse @change="() => {}" v-model="activeGroups">
          <el-collapse-item
            :key="group.id"
            :name="group.id"
            :title="group.name"
            class="group-header"
            v-for="group in goodsParsed"
          >
            <el-table
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
              <el-table-column class-name="cost-column" :width="140">
                <template slot-scope="scope">
                  <span>
                    {{ scope.row.cost | price }}
                  </span>
                </template>
              </el-table-column>
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
            </el-table>
          </el-collapse-item>
        </el-collapse>
      </el-col>
      <el-col :span="12">
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
                placeholder="Введите количество"
                v-model="scope.row.quantity"
              >
                <template slot="append">шт.</template>
              </el-input>
            </template>
          </el-table-column>
          <el-table-column label="Цена">
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
    <!-- <div>{{ goodsParsed }}</div> -->
    <br />
    <br />
    <!-- <div>{{ activeGroups }}</div> -->
  </div>
</template>

<script>
import Vue from "vue";
import names from "@/data/names.json";
import { Value } from "@/data/data.json";

export default {
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
          name: this.names[el.G].B[el.T].N
        });
      });

      return result;
    }
  },
  data() {
    return {
      activeGroups: [],
      cart: {
        items: [],
        totalCost: this.totalCost
      },
      goods: Value.Goods,
      names: names,
      rates: {
        USD: 78
      }
    };
  },
  created() {
    Object.keys(this.goodsParsed).forEach((el, index) => {
      Vue.set(this.activeGroups, index, +el);
    });
  },
  methods: {
    addToCart(good) {
      this.cart.items.push({
        cost: good.cost,
        groupName: this.names[good.idGroup].G,
        id: good.id,
        name: good.name,
        quantity: 1
      });
    },
    convertToRub(val = 0) {
      return val * this.rates.USD;
    },
    deleteFromCart(good) {
      this.cart.items = this.cart.items.filter(el => el.id != good.id);
    }
  },
  name: "PageHome"
};
</script>

<style lang="sass">
.cost-column
  background: $color-info
  font-weight: 700

.group-header .el-collapse-item__header
  background-color: $color-primary
  font-weight: 700
  padding-left: 10px

.total-cost
  margin-top: 40px
</style>
