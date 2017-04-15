<template>
  <q-layout>
    <div slot="header" class="toolbar">
      <q-toolbar-title :padding="1">
        Coursera Viz
      </q-toolbar-title>
    </div>

    <!-- Navigation Tabs -->
    <q-tabs class="justified" slot="navigation">
      <q-tab route="/sentviz" exact replace>SentViz</q-tab>
      <q-tab route="/trainer" exact replace>Trainer</q-tab>
      <q-tab route="/dimensionality-reduction" exact replace>Dimensionality Reduction</q-tab>
      <q-tab route="/features" exact replace>Features</q-tab>
      <q-tab route="/scraper" exact replace>Scraper</q-tab>
    </q-tabs>

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
