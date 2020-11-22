module.exports = {
  configureWebpack: {
    devServer: {
      watchOptions: {
        ignored: [/node_modules/]
      }
    }
  },
  css: {
    loaderOptions: {
      sass: {
        sassOptions: {
          includePaths: ["./node_modules"]
        },
        prependData: `@import "@/css/_variables.sass"`
      }
    }
  }
};
