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
    </q-tabs>

    <div class="layout-view">
      <div class="layout-padding">
        <div id="class-distribution-pie-chart"></div>
      </div>
    </div>

    <router-view class="layout-view"></router-view>

    <!-- Footer -->
    <div slot="footer" class="toolbar"></div>
  </q-layout>
</template>

<script>
  /* global Plotly */
  /* eslint no-undef: "error" */

  'use strict'

  import { Loading } from 'quasar'
  import apiRoutes from './../apiRoutes'
  import axios from 'axios'

  export default {
    data () {
      return {
        veryPositive: 0,
        positive: 0,
        neutral: 0,
        negative: 0,
        veryNegative: 0
      }
    },
    mounted () {
      this.getClassDistribution()
    },
    methods: {
      getClassDistribution () {
        Loading.show({
          delay: 100,
          message: 'Retrieving class distribution...',
          spinner: 'dots',
          spinnerSize: 150
        })

        const config = {
          method: 'get',
          baseURL: apiRoutes.rethinkdbBaseURL,
          url: '/class-distribution'
        }

        axios(config)
          .then(response => {
            this.veryPositive = response.data.very_positive
            this.positive = response.data.positive
            this.neutral = response.data.neutral
            this.negative = response.data.negative
            this.veryNegative = response.data.very_negative

            this.plotPieChart()
            Loading.hide()
          })
          .catch(error => {
            throw new Error(error)
          })
      },
      plotPieChart () {
        let data = []
        let layout = {
          title: 'Class Distribution',
          height: 500,
          width: 500
        }

        let trace = {
          values: [this.veryPositive, this.positive, this.neutral, this.negative, this.veryNegative],
          labels: ['Very Positive', 'Positive', 'Neutral', 'Negative', 'Very Negative'],
          type: 'pie'
        }

        data.push(trace)
        Plotly.newPlot('class-distribution-pie-chart', data, layout)
      }
    }
  }
</script>

<style>
</style>
