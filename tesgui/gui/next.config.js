const withCSS = require('@zeit/next-css')
module.exports =  withCSS({
  assetPrefix: '/',
  exportPathMap: function () {
    return {
      "/": { page: "/" }
    }
  }
})
