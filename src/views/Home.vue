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
              <el-table-column class-name="cost-column" width="150px">
                <template slot-scope="scope">
                  <span>
                    {{ scope.row.cost | price }}
                  </span>
                </template>
              </el-table-column>
            </el-table>
          </el-collapse-item>
        </el-collapse>
      </el-col>
    </el-row>
    <br />
    <br />
    <br />
    <div>{{ goodsParsed }}</div>
    <br />
    <br />
    <div>{{ activeGroups }}</div>
  </div>
</template>

<script>
import { Value } from "@/data/data.json";
import names from "@/data/names.json";
import Vue from "vue";

export default {
  computed: {
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
    convertToRub(val = 0) {
      return val * this.rates.USD;
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
</style>
