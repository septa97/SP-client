<template>
  <div>
    <div class="layout-padding">
      <h5>{{ courseName }}</h5>
      <q-dialog-select type="radio" v-model="classifier" :options="classifierOptions" ok-label="Ok" cancel-label="Cancel" title="Choose the Supervised Classifier"></q-dialog-select>
      <q-progress-button class="primary" :percentage="classifying" @click.native="classifyReviews" indeterminate dark-filler>Predict Labels</q-progress-button>
      <q-data-table :data="table" :config="config" :columns="columns"></q-data-table>
    </div>
  </div>
</template>

<script>
  'use strict'

  import { Loading } from 'quasar'
  import apiRoutes from './../../apiRoutes'
  import axios from 'axios'
  import _ from 'lodash'

  export default {
    data () {
      return {
        classifierOptions: [
          { label: 'Logistic Regression', value: 'LR' },
          { label: 'Support Vector Machine', value: 'SVM' },
          { label: 'Multi-layer Perceptron (Artifial Neural Network)', value: 'MLP' }
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
          selection: 'multiple',
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
        classifying: 0,
        table: []
      }
    },
    mounted () {
      this.getAllCourseReviews()
    },
    methods: {
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
          url: `/classify/reviews`,
          data: {
            classifier: this.classifier,
            reviews: _.map(this.table, 'review'),
            ratings: _.map(this.table, 'rating')
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }

        axios(config)
          .then(response => {
            const predictedLabels = _.map(response.data.predicted_label, e => {
              switch (e) {
                case 5: return 'Very Positive'
                case 4: return 'Positive'
                case 3: return 'Neutral'
                case 2: return 'Negative'
                case 1: return 'Very Negative'
              }
            })

            for (let i = 0; i < this.table.length; i++) {
              this.table[i].predictedLabel = predictedLabels[i]
            }

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
