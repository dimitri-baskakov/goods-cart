module.exports = {
  css: {
    loaderOptions: {
      sass: {
        sassOptions: {
          includePaths: ["./node_modules"]
        },
        additionalData: `@import "@/css/_variables.sass"`
      }
    }
  }
};
