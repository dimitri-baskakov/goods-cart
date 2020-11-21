module.exports = {
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
