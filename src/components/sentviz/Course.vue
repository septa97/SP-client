<template>
  <div>
    <div class="layout-padding">
      <h1>{{ courseSlug }}</h1>
    </div>
  </div>
</template>

<script>
  'use strict'

  export default {
    data () {
      return {
        courseSlug: this.$route.params.slug
      }
    }
  }
</script>

<style scoped>
</style>
