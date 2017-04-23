<template>
  <div>
    <div class="layout-padding">
      <h5>{{ courseName }}</h5>
      <q-dialog-select type="radio" v-model="classifier" :options="classifierOptions" ok-label="Ok" cancel-label="Cancel" title="Choose the Supervised Classifier"></q-dialog-select>
      <q-dialog-select type="radio" v-model="vocabModel" :options="vocabModelOptions" ok-label="Ok" cancel-label="Cancel" title="Choose the Vocabulary Model"></q-dialog-select>

      <label>
        <q-checkbox v-model="tfIdf"></q-checkbox>
        tf-idf
      </label>

      <q-progress-button class="primary" :percentage="classifying" @click.native="classifyReviews" indeterminate dark-filler>Predict Labels</q-progress-button>

      <q-data-table :data="table" :config="config" :columns="columns">
        <template slot="selection" scope="props">
          <button class="primary clear" @click="explainPrediction(props)">
            Explain Prediction
          </button>
        </template>
      </q-data-table>

      <!-- Modal -->
      <q-modal class="maximized" ref="predictionExplanationModal" :content-css="{minWidth: '80vw', minHeight: '80vh'}">
        <q-layout>
          <div slot="header" class="toolbar">
            <button @click="$refs.predictionExplanationModal.close()">
              <i>keyboard_arrow_left</i>
            </button>
            <q-toolbar-title :padding="1">
              Prediction Explanation
            </q-toolbar-title>
          </div>

          <div class="layout-view">
            <div class="layout-padding">
              <div id="prediction-explanation"></div>
            </div>
          </div>
        </q-layout>
      </q-modal>

      <div id="pie-chart">
      </div>
    </div>
  </div>
</template>

<script>
  /* global Plotly */
  /* eslint no-undef: "error" */

  'use strict'

  import { Loading } from 'quasar'
  import apiRoutes from './../../apiRoutes'
  import axios from 'axios'
  import _ from 'lodash'
  import $ from 'jquery'

  export default {
    data () {
      return {
        classifierOptions: [
          { label: 'Logistic Regression', value: 'LR' },
          { label: 'Support Vector Machine', value: 'SVM' },
          { label: 'Multi-layer Perceptron (Artifial Neural Network)', value: 'MLP' }
        ],
        vocabModelOptions: [
          { label: 'unigram', value: 'unigram' },
          { label: 'bigram', value: 'bigram' },
          { label: 'trigram', value: 'trigram' }
        ],
        config: {
          title: 'Reviews, Ratings, and Predicted Labels',
          refresh: true,
          columnPicker: true,
          bodyStyle: {
            maxHeight: '500px'
          },
          rowHeight: '50px',
          responsive: true,
          pagination: {
            rowsPerPage: 15,
            options: [5, 10, 15, 30, 50, 500]
          },
          selection: 'single',
          messages: {
            noData: '<i>warning</i> No data available to show.',
            noDataAfterFiltering: '<i>warning</i> No results. Please refine your search terms.'
          },
          labels: {
            columns: 'Columns',
            allCols: 'Every Columns',
            rows: 'Rows',
            selected: {
              singular: 'item selected.',
              plural: 'items selected.'
            },
            clear: 'clear',
            search: 'Search',
            all: 'All'
          }
        },
        columns: [
          {
            label: 'Review',
            field: 'review',
            filter: true,
            sort: true,
            width: '400px'
          },
          {
            label: 'Rating',
            field: 'rating',
            filter: true,
            sort: true,
            width: '120px'
          },
          {
            label: 'Actual Label',
            field: 'actualLabel',
            filter: true,
            sort: true,
            width: '120px'
          },
          {
            label: 'Predicted Label',
            field: 'predictedLabel',
            filter: true,
            sort: true,
            width: '120px'
          }
        ],
        pagination: true,
        rowHeight: 50,
        bodyHeightProp: 'maxHeight',
        bodyHeight: 500,
        courseSlug: this.$route.params.slug,
        courseName: '',
        classifier: 'LR',
        vocabModel: 'unigram',
        tfIdf: false,
        classifying: 0,
        table: []
      }
    },
    mounted () {
      this.getAllCourseReviews()
    },
    methods: {
      explainPrediction (props) {
        Loading.show({
          delay: 100,
          message: 'Retrieving explanation for a specific course review...',
          spinner: 'dots',
          spinnerSize: 150
        })

        const config = {
          method: 'post',
          baseURL: apiRoutes.classifierBaseURL,
          url: '/explain/prediction',
          data: {
            classifier: this.classifier,
            vocabModel: this.vocabModel,
            tfIdf: this.tfIdf,
            review: props.rows[0].data.review
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }

        axios(config)
          .then(response => {
            $('#prediction-explanation').empty()
            $('#prediction-explanation').append(response.data.div)
            Loading.hide()
            this.$refs.predictionExplanationModal.open()
          })
          .catch(error => {
            Loading.hide()
            throw new Error(error)
          })
      },
      classifyReviews () {
        this.classifying = 1
        Loading.show({
          delay: 100,
          message: 'Classifying the course reviews...',
          spinner: 'dots',
          spinnerSize: 150
        })

        const config = {
          method: 'post',
          baseURL: apiRoutes.classifierBaseURL,
          url: '/classify/reviews',
          data: {
            classifier: this.classifier,
            vocabModel: this.vocabModel,
            tfIdf: this.tfIdf,
            reviews: _.map(this.table, 'review'),
            ratings: _.map(this.table, e => {
              /**
               *  Mapping in the classifier
               *  0 - Negative
               *  1 - Neutral
               *  2 - Positive
               *  3 - Very Negative
               *  4 - Very Positive
               */
              switch (e.rating) {
                case 2: return 0
                case 3: return 1
                case 4: return 2
                case 1: return 3
                case 5: return 4
              }
            })
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }

        axios(config)
          .then(response => {
            const predictedLabels = _.map(response.data.predicted_label, e => {
              /**
               *  Mapping in the classifier
               *  0 - Negative
               *  1 - Neutral
               *  2 - Positive
               *  3 - Very Negative
               *  4 - Very Positive
               */
              switch (e) {
                case 0: return 'Negative'
                case 1: return 'Neutral'
                case 2: return 'Positive'
                case 3: return 'Very Negative'
                case 4: return 'Very Positive'
              }
            })

            for (let i = 0; i < this.table.length; i++) {
              this.table[i].predictedLabel = predictedLabels[i]
            }

            let data = []
            let layout = {
              title: `Actual and Predicted Labels (${(response.data.accuracy * 100).toFixed(2)}% Accuracy)`,
              annotations: [],
              height: 600,
              width: 600
            }

            _.forEach(['actual', 'predicted'], (v, k) => {
              const labelCounts = _.countBy(this.table, v === 'actual' ? 'actualLabel' : 'predictedLabel')
              const labels = _.keys(labelCounts)
              const values = _.values(labelCounts)

              let trace = {
                values,
                labels,
                domain: {
                  x: !k ? [0, 0.48] : [0.52, 1]
                },
                name: v,
                hoverinfo: 'label+percent+name',
                hole: 0.4,
                type: 'pie'
              }

              layout.annotations.push({
                font: {
                  size: 16
                },
                showarrow: false,
                text: v,
                x: 0.17 + (k * 0.68),
                y: 0.5
              })

              data.push(trace)
            })

            Plotly.newPlot('pie-chart', data, layout)
            this.classifying = 100
            Loading.hide()
          })
          .catch(error => {
            this.classifying = -1
            throw new Error(error)
          })
      },
      getAllCourseReviews () {
        Loading.show({
          delay: 100,
          message: 'Retrieving all the course reviews and ratings...',
          spinner: 'dots',
          spinnerSize: 150
        })

        const config = {
          method: 'get',
          baseURL: apiRoutes.rethinkdbBaseURL,
          url: `/course/${this.courseSlug}/reviews-and-ratings`
        }

        axios(config)
          .then(response => {
            this.table = _.map(response.data.reviews_and_ratings, e => {
              switch (e.rating) {
                case 5: e.actualLabel = 'Very Positive'; break
                case 4: e.actualLabel = 'Positive'; break
                case 3: e.actualLabel = 'Neutral'; break
                case 2: e.actualLabel = 'Negative'; break
                case 1: e.actualLabel = 'Very Negative'; break
              }

              return e
            })
            this.courseName = response.data.course_name
            Loading.hide()
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
