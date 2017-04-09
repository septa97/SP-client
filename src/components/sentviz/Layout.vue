<template>
  <q-layout>
    <div slot="header" class="toolbar">
      <!-- opens drawer below -->
      <router-link to="/">
        <button class="primary circular">
          <i>home</i>
        </button>
      </router-link>
      <button class="hide-on-drawer-visible" @click="$refs.drawer.open()">
        <i>menu</i>
      </button>

      <q-toolbar-title :padding="1">
        SentViz
      </q-toolbar-title>
    </div>

    <!-- Drawer -->
    <q-drawer ref="drawer">
      <div class="toolbar">
        <q-toolbar-title>
          Links
        </q-toolbar-title>
      </div>

      <div class="list no-border platform-delimiter">
        <q-drawer-link icon="place" to="/sentviz/gmaps" exact>
          GMaps
        </q-drawer-link>
      </div>
    </q-drawer>

    <router-view class="layout-view"></router-view>

    <!-- Footer -->
    <div slot="footer" class="toolbar"></div>
  </q-layout>
</template>

<script>
  'use strict'

  import apiRoutes from './../../apiRoutes'
  import axios from 'axios'

  export default {
    data () {
      return {
        domainIds: [],
        subdomainIds: []
      }
    },
    mounted () {
      this.getAllCoursesDomainTypes()
    },
    methods: {
      getAllCoursesDomainTypes () {
        const config = {
          method: 'get',
          baseURL: apiRoutes.rethinkdbBaseURL,
          url: '/courses/domain_types'
        }

        axios(config)
          .then(response => {
            this.domainIds = response.data.domainIds
            this.subdomainIds = response.data.subdomainIds
          })
          .catch(error => {
            throw new Error(error)
          })
      }
    }
  }
</script>

<style scoped>
</style>
