<template>
  <div>
    <el-row class="settings-group" :gutter="10">
      <el-divider content-position="left">{{ $t("settings") }}</el-divider>
      <el-col :span="24">
        <el-form
          :model="settingsForm"
          @submit.native.prevent
          label-width="200px"
          ref="settingsForm"
        >
          <el-form-item :label="$t('rate.usd')">
            <el-input-number
              :max="80"
              :min="20"
              :placeholder="$t('rate.enter')"
              :precision="2"
              :step="0.01"
              step-strictly
              type="number"
              v-model="rates.USD"
            ></el-input-number>
          </el-form-item>
          <el-form-item :label="$t('cost.randomGeneration')">
            <el-switch v-model="settingsForm.randomMode"></el-switch>
          </el-form-item>
          <el-form-item :label="$t('editMode')">
            <el-switch v-model="settingsForm.editMode"></el-switch>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <el-col :xs="24" :sm="24" :md="12">
        <el-divider content-position="left">{{ $t("goods.label") }}</el-divider>
        <div v-if="errorGettingData">{{ errorGettingData }}</div>
        <el-collapse v-model="activeGroups">
          <el-collapse-item
            :key="group.id"
            :name="group.id"
            :title="group.name"
            class="group-header"
            v-for="group in goodsParsed"
          >
            <goods-group
              :data="group.children"
              :rates="rates"
              :settings-form="settingsForm"
              @addToCart="addToCart"
            ></goods-group>
          </el-collapse-item>
        </el-collapse>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12">
        <el-divider content-position="left">{{
          $t("shoppingCart.label")
        }}</el-divider>
        <el-table
          :data="cart.items"
          :empty-text="$t('shoppingCart.empty')"
          style="width: 100%"
        >
          <el-table-column :label="$t('goods.nameAndDescription')">
            <template slot-scope="scope">
              <span class="product-name">
                <strong>{{ scope.row.groupName }}.</strong> {{ scope.row.name }}
              </span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('quantity.label')">
            <template slot-scope="scope">
              <el-input
                :max="scope.row.inStockQuantity"
                :min="1"
                :placeholder="$t('quantity.enter')"
                :precision="0"
                :step="1"
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
                :description="$t('quantity.isLimited')"
                show-icon
                type="warning"
                v-show="isQuantityLimited(scope.row)"
              ></el-alert>
            </template>
          </el-table-column>
          <el-table-column :label="$t('cost.label')" :width="100">
            <template slot-scope="scope">
              <span>
                <strong>{{ scope.row.cost | price }}.</strong> / {{ $t("pcs") }}
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
          {{ $t("cost.total") }}: <b>{{ totalCost | price }}</b>
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
          costStatus: 0
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
      errorGettingData: "",
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
    // Adding goods in the cart
    addToCart(good) {
      let goodIndex = this.cart.items.findIndex(el => el.id == good.id);
      if (goodIndex !== -1) {
        this.cart.items[goodIndex].quantity += 1;
      } else if (good) {
        this.cart.items.push({
          cost: good.cost,
          groupName: this.names[good.idGroup].G,
          id: good.id,
          inStockQuantity: good.inStockQuantity,
          name: good.name,
          quantity: 1
        });
      }
    },
    deleteFromCart(good) {
      this.cart.items = this.cart.items.filter(el => el.id != good.id);
    },
    // getting data.json
    async getJsonData() {
      let data = await this.$axios.get("/data.json");
      this.errorGettingData =
        !data.data.Success && (data.data.Error || this.$t("error.gettingData"));
      let goods = (data.data.Success && data.data.Value.Goods) || [];
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
