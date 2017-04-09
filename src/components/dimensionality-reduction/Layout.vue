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
        Dimensionality Reduction for Visualization
      </q-toolbar-title>
    </div>

    <!-- Navigation Tabs -->
    <q-tabs class="justified" slot="navigation" v-model="currentTab" :refs="$refs">
      <q-tab icon="info" name="PCA-2D">PCA (2D)</q-tab>
      <q-tab icon="info" name="PCA-3D">PCA (3D)</q-tab>
      <q-tab icon="info" name="tSNE-2D">t-SNE (2D)</q-tab>
      <q-tab icon="info" name="tSNE-3D">t-SNE (3D)</q-tab>
    </q-tabs>

    <!-- Drawer -->
    <q-drawer ref="drawer">
      <div class="toolbar">
        <q-toolbar-title>
          Options
        </q-toolbar-title>
      </div>

      <div class="list platform-delimiter">
        <div class="stacked-label">
          <input type="text" v-model.trim.number="dataSize">
          <label>Data Size</label>
        </div>

        <q-range class="orange" :min="5" :max="20" v-model.trim.number="minDF" label></q-range>

        <q-progress-button class="orange" :percentage="retrievingData" @click.native="getAllInformations" indeterminate dark-filler>
          Visualize
        </q-progress-button>
      </div>
    </q-drawer>

    <!-- Refs -->
    <div class="layout-padding" ref="PCA-2D">
      <h5>Principal Components Analysis (2D)</h5>
      <div id="PCA-2D"></div>
    </div>
    <div class="layout-padding" ref="PCA-3D">
      <h5>Principal Components Analysis (3D)</h5>
      <div id="PCA-3D"></div>
    </div>
    <div class="layout-padding" ref="tSNE-2D">
      <h5>t-distributed Stochastic Neighbor Embedding (2D)</h5>
      <div id="tSNE-2D"></div>
    </div>
    <div class="layout-padding" ref="tSNE-3D">
      <h5>t-distributed Stochastic Neighbor Embedding (3D)</h5>
      <div id="tSNE-3D"></div>
    </div>

    <!-- Footer -->
    <div slot="footer" class="toolbar"></div>
  </q-layout>
</template>

<script>
  /* global Plotly */
  /* eslint no-undef: "error" */

  'use strict'

  import { Loading } from 'quasar'
  import apiRoutes from './../../apiRoutes'
  import async from 'async'
  import axios from 'axios'
  import _ from 'lodash'

  export default {
    data () {
      return {
        types: ['negative', 'neutral', 'positive', 'very_negative', 'very_positive'],
        currentTab: '',
        dataSize: 1000,
        minDF: 5,
        retrievingData: 0
      }
    },
    methods: {
      getAllInformations () {
        this.retrievingData = 1

        Loading.show({
          delay: 100,
          message: 'Retrieving all the informations...',
          spinner: 'dots',
          spinnerSize: 150
        })

        const urls = [`/PCA/${this.minDF}/${this.dataSize}/2`, `/PCA/${this.minDF}/${this.dataSize}/3`, `/tSNE/${this.minDF}/${this.dataSize}/2`, `/tSNE/${this.minDF}/${this.dataSize}/3`]

        async.each(urls, (url, callback) => {
          const config = {
            method: 'get',
            baseURL: apiRoutes.dimensionalityReductionBaseURL,
            url
          }

          axios(config)
            .then(response => {
              let data = []

              _.forEach(this.types, type => {
                let trace = {}

                trace.x = response.data[type].X
                trace.y = response.data[type].y
                trace.text = response.data[type].reviews

                if (url[url.length - 1] === '3') {
                  trace.z = response.data[type].z
                  trace.type = 'scatter3d'
                }
                else {
                  trace.type = 'scatter'
                }

                trace.mode = 'markers'
                trace.name = type

                data.push(trace)
              })

              let div
              switch (url) {
                case `/PCA/${this.minDF}/${this.dataSize}/2`: div = 'PCA-2D'; break
                case `/PCA/${this.minDF}/${this.dataSize}/3`: div = 'PCA-3D'; break
                case `/tSNE/${this.minDF}/${this.dataSize}/2`: div = 'tSNE-2D'; break
                case `/tSNE/${this.minDF}/${this.dataSize}/3`: div = 'tSNE-3D'; break
              }

              Plotly.newPlot(div, data)
              callback()
            })
            .catch(error => {
              callback(error)
            })
        }, error => {
          Loading.hide()

          if (error) {
            this.retrievingData = -1
            throw new Error(error)
          }

          this.currentTab = 'PCA-2D'
          this.retrievingData = 100
        })
      }
    }
  }
</script>

<style scoped>
</style>
