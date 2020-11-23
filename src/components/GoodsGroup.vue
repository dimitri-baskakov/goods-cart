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
    <!-- <cost-column></cost-column> -->
    <el-table-column :class-name="className" :width="140">
      <template slot-scope="scope">
        <span> {{ scope.row.cost | price }} </span>
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
</template>

<script>
// import CostColumn from "@/components/CostColumn.vue";

export default {
  components: {
    // CostColumn
  },
  data() {
    return {
      className: "",
      cost: 0
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
    cellClassName({ row, columnIndex }) {
      // console.log(row, column, rowIndex, columnIndex);
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
    },
    // compare(val) {
    //   this.cost = val;
    //   return val;
    // }
    convertToRub(val = 0) {
      return (val * this.rates.USD).toFixed(2);
    }
  },
  name: "CostColumn",
  props: {
    cart: Object,
    data: Array,
    names: Object,
    rates: Object,
    settingsForm: Object
  },
  watch: {
    data: {
      handler: function(newData, oldData) {
        newData = newData.map(el => {
          let good = oldData.find(good => good.id == el.id);
          el.priceStatus =
            (!good && "0") ||
            Math.sign(
              this.convertToRub(el.cost) - this.convertToRub(good.cost)
            );
          return el;
        });
      },
      deep: true
    }
    // cost: {
    //   handler: function(newCost, oldCost) {
    //     let className = "cost-column";
    //     let priceStatus = Math.sign(newCost - oldCost);
    //     if (priceStatus == 1 && oldCost != 0) {
    //       className = "cost-column cost-column_price_up";
    //     }
    //     if (priceStatus == -1 && oldCost != 0) {
    //       className = "cost-column cost-column_price_down";
    //     }
    //     this.className = className;
    //   }
    //   // deep: true
    // }
  }
};
</script>

<style scoped lang="sass">
// .cost-column
//   background: $color-info
//   font-weight: 700

// .cost-column_price_up
//   background: $color-error

// .cost-column_price_down
//   background: $color-success
</style>
