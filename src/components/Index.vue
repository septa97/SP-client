<template>
  <q-layout>
    <div slot="header" class="toolbar">
      <!-- opens drawer below -->
      <button class="hide-on-drawer-visible" @click="$refs.drawer.open()">
        <i>menu</i>
      </button>

      <q-toolbar-title :padding="1">
        Coursera Viz
      </q-toolbar-title>
    </div>

    <!-- Navigation Tabs -->
    <q-tabs class="justified" slot="navigation">
      <q-tab icon="info" route="/sentviz" exact replace>SentViz</q-tab>
      <q-tab icon="info" route="/trainer" exact replace>Trainer</q-tab>
      <q-tab icon="info" route="/dimensionality-reduction" exact replace>Dimensionality Reduction</q-tab>
      <q-tab icon="info" route="/features" exact replace>Features</q-tab>
      <q-tab icon="info" route="/scraper" exact replace>Scraper</q-tab>
    </q-tabs>

    <!-- Drawer -->
    <q-drawer ref="drawer">
      <div class="toolbar">
        <q-toolbar-title>
          Links
        </q-toolbar-title>
      </div>

      <div class="list no-border platform-delimiter">
        <q-drawer-link icon="mail" :to="{ path: '/', exact: true }">
          Link
        </q-drawer-link>
      </div>
    </q-drawer>

    <router-view class="layout-view"></router-view>

    <!-- Footer -->
    <div slot="footer" class="toolbar"></div>
  </q-layout>
</template>

<script>
export default {
  data () {
    return {}
  }
}
</script>

<style>
</style>
