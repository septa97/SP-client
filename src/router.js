import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

function load (component) {
  return () => System.import(`components/${component}.vue`)
}

export default new VueRouter({
  /*
   * NOTE! VueRouter "history" mode DOESN'T works for Cordova builds,
   * it is only to be used only for websites.
   *
   * If you decide to go with "history" mode, please also open /config/index.js
   * and set "build.publicPath" to something other than an empty string.
   * Example: '/' instead of current ''
   *
   * If switching back to default "hash" mode, don't forget to set the
   * build publicPath back to '' so Cordova builds work again.
   */

  routes: [
    {
      path: '/',
      component: load('Index')
    }, // Default
    {
      path: '/dimensionality-reduction',
      component: load('dimensionality-reduction/Layout'),
      children: [
        { path: 'PCA-2D', component: load('dimensionality-reduction/PCA2D') },
        { path: 'PCA-3D', component: load('dimensionality-reduction/PCA3D') },
        { path: 'tSNE-2D', component: load('dimensionality-reduction/tSNE2D') },
        { path: 'tSNE-3D', component: load('dimensionality-reduction/tSNE3D') }
      ]
    },
    {
      path: '/sentviz',
      component: load('sentviz/Layout'),
      children: [
        { path: 'gmaps', component: load('sentviz/GMaps') },
        { path: 'course/:slug', component: load('sentviz/Course') },
        { path: 'domain-types/:domainId/:subdomainId', component: load('sentviz/DomainTypes') }
      ]
    },
    {
      path: '/trainer',
      component: load('trainer/Layout'),
      children: [
        { path: 'confusion-matrices', component: load('trainer/ConfusionMatrices') }
      ]
    },
    {
      path: '*',
      component: load('Error404')
    } // Not found
  ]
})
