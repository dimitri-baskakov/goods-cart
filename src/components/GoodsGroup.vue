<template>
  <el-table
    :cell-class-name="cellClassName"
    :data="data"
    :show-header="false"
    border
    class="goods-table"
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
    <el-table-column :width="110">
      <template slot-scope="scope">
        <span> {{ scope.row.cost | price }} </span>
      </template>
    </el-table-column>
    <el-table-column class-name="cost-column" :width="65">
      <template slot-scope="scope">
        <el-button
          :icon="`el-icon-shopping-cart-2`"
          @click="addToCart(scope.row)"
          circle
          class="add-to-cart-btn"
        ></el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
export default {
  data() {
    return {};
  },
  methods: {
    addToCart(good) {
      this.$emit("addToCart", good);
    },
    // Coloring cells when cost is up or down
    cellClassName({ row, columnIndex }) {
      if (columnIndex == 1 && row.costStatus == 1) {
        return "cost-column cost-column_cost_up";
      }
      if (columnIndex == 1 && row.costStatus == -1) {
        return "cost-column cost-column_cost_down";
      }
      if (columnIndex == 1) {
        return "cost-column";
      }
      return "";
    }
  },
  name: "GoodsGroup",
  props: {
    data: Array,
    rates: Object,
    settingsForm: Object
  },
  watch: {
    // watch data and recalculate costStatus
    // 1 cost is up, -1 cost is down, 0 cost don't changed
    data: {
      handler: function(newData, oldData) {
        newData = newData.map(el => {
          let good = oldData.find(good => good.id == el.id);
          el.costStatus =
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

.cost-column_cost_up
  background: $color-error

.cost-column_cost_down
  background: $color-success

.goods-table
  width: 100%
</style>
