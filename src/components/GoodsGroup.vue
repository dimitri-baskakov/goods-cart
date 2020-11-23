<template>
  <el-table
    :cell-class-name="cellClassName"
    :data="data"
    :show-header="false"
    border
    style="width: 100%"
  >
    <el-table-column>
      <template slot-scope="scope">
        <span>
          <el-input
            v-if="settingsForm.editMode"
            v-model="scope.row.name"
          ></el-input>
          <span v-else>{{ scope.row.name }}</span> ({{
            scope.row.inStockQuantity
          }})
        </span>
      </template>
    </el-table-column>
    <el-table-column :class-name="className" :width="110">
      <template slot-scope="scope">
        <span> {{ scope.row.cost | price }} </span>
      </template>
    </el-table-column>
    <el-table-column class-name="cost-column" :width="65">
      <template slot-scope="scope">
        <el-button
          :disabled="alreadyInCart(scope.row.id)"
          :icon="
            alreadyInCart(scope.row.id)
              ? `el-icon-shopping-cart-full`
              : `el-icon-shopping-cart-2`
          "
          @click="addToCart(scope.row)"
          circle
        ></el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
export default {
  data() {
    return {
      className: "",
      cost: 0
    };
  },
  methods: {
    // Adding goods in the cart
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
    alreadyInCart(goodId) {
      return this.cart.items.some(el => el.id == goodId);
    },
    // Coloring cells when price is up or down
    cellClassName({ row, columnIndex }) {
      if (columnIndex == 1 && row.priceStatus == 1) {
        return "cost-column cost-column_price_up";
      }
      if (columnIndex == 1 && row.priceStatus == -1) {
        return "cost-column cost-column_price_down";
      }
      if (columnIndex == 1) {
        return "cost-column";
      }
      return "";
    }
  },
  name: "GoodsGroup",
  props: {
    cart: Object,
    data: Array,
    names: Object,
    rates: Object,
    settingsForm: Object
  },
  watch: {
    // watch data and recalculate priceStatus
    // 1 price is up, -1 price is down, 0 price don't changed
    data: {
      handler: function(newData, oldData) {
        newData = newData.map(el => {
          let good = oldData.find(good => good.id == el.id);
          el.priceStatus =
            (!good && "0") ||
            Math.sign(
              this.$options.filters.convertToRub(el.cost, this.rates.USD) -
                this.$options.filters.convertToRub(good.cost, this.rates.USD)
            );
          return el;
        });
      },
      deep: true
    }
  }
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
</style>
