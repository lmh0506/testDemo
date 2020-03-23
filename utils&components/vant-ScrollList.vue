<template>
  <van-pull-refresh class="scroll-list-wrapper" :class="{'no-data': noData}" v-model="isRefresh" @refresh="onRefresh">
    <div class="no-data-wrapper" v-if="noData">
      <div class="no-data"></div>
      <p>暂无数据</p>
    </div>
    <van-list
      ref="list"
      v-else
      v-model="loading"
      :immediate-check="immediateCheck"
      :finished="finished"
      :error.sync="error"
      error-text="请求失败，点击重新加载"
      finished-text="没有更多了"
      @load="getPageData">
      <slot></slot>
    </van-list>
  </van-pull-refresh>
</template>

<script>
export default {
  name: 'ScrollList',
  props: {
    getData: {
      type: Function,
      default: () => {}
    },
    pageSize: {
      type: Number,
      default: 10
    },
    page: {
      type: Number,
      default: 1
    },
    total: {
      type: Number,
      default: -1
    },
    data: {
      type: Array,
      default () {
        return []
      }
    },
    // 是否在初始化时立即执行滚动位置检查  如果触碰到到底部则相当于自动执行getData方法
    immediateCheck: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      loading: false, // 加装loading
      isRefresh: false, // 刷新loading
      error: false // 请求失败
    }
  },
  computed: {
    finished () { // 是否全部加装完成
      return this.total !== -1 && this.total <= this.data.length
    },
    noData () { // 是否为空数据
      return this.finished && this.data.length === 0
    }
  },
  methods: {
    async getPageData (isRefresh) {
      if (isRefresh) {
        this.isRefresh = true
      } else {
        this.loading = true
      }

      if (isRefresh || !this.finished) {
        try {
          await this.getData(isRefresh)
        } catch (e) {
          console.log(e)
          this.error = true
        }
      }

      if (isRefresh) {
        this.isRefresh = false
      } else {
        this.loading = false
      }
    },
    onRefresh () {
      this.getPageData(true)
    },
    check () {
      this.$refs.list.check()
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '@/common/css/mixin';
  .no-data{
    // background: #fff;
  }
  .no-data-wrapper{
    box-sizing: border-box;
    padding: 75px 0;
    .no-data{
      @include bgImage('../assets/store/no_data', 90px, 90px);
      margin: 0px auto 20px;
    }
    >p{
      font-size: 14px;
      color: #999;
      text-align: center;
    }
  }
</style>
