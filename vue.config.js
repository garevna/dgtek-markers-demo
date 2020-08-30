module.exports = {
  transpileDependencies: [
    'vuetify'
  ],
  runtimeCompiler: true,
  publicPath: process.env.NODE_ENV === 'production'
    ? '/dgtek-markers-demo/'
    : '/'
}
