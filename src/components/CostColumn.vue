<template>
  <el-table-column :class-name="className" :width="140">
    <template slot-scope="scope">
      <span> {{ compare(scope.row.cost) | price }} </span>
    </template>
  </el-table-column>
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
    compare(val) {
      this.cost = val;
      return val;
    }
  },
  name: "CostColumn",
  props: {},
  watch: {
    cost: {
      handler: function(newCost, oldCost) {
        let className = "cost-column";
        let priceStatus = Math.sign(newCost - oldCost);
        if (priceStatus == 1 && oldCost != 0) {
          className = "cost-column cost-column_price_up";
        }
        if (priceStatus == -1 && oldCost != 0) {
          className = "cost-column cost-column_price_down";
        }
        this.className = className;
      }
      // deep: true
    }
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
