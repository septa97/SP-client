<template>
  <q-layout>
    <div slot="header" class="toolbar">
      <router-link to="/">
        <button class="primary circular">
          <i>home</i>
        </button>
      </router-link>

      <q-toolbar-title :padding="1">
        Trainer
      </q-toolbar-title>

      <button @click="viewWordClouds">
        <i class="on-left">info</i>View Word Clouds
      </button>
      <button @click="$refs.optionsModal.open()">
        <i class="on-left">explore</i>Explain Weights
      </button>
    </div>

    <!-- Navigation Tabs -->
    <q-tabs class="justified" slot="navigation" v-model="currentTab" :refs="$refs">
      <q-tab name="training">Training</q-tab>
      <q-tab name="confusion-matrices">Confusion Matrices</q-tab>
      <q-tab name="features" @selected="getAllVocab">Features</q-tab>
    </q-tabs>

    <!-- Weights Explanation Options Modal -->
    <q-modal class="minimized" ref="optionsModal" :content-css="{minWidth: '40vw', minHeight: '40vh'}">
      <q-layout>
        <div slot="header" class="toolbar">
          <button @click="$refs.optionsModal.close()">
            <i>keyboard_arrow_left</i>
          </button>
          <q-toolbar-title :padding="1">
            Weights Explanation Options
          </q-toolbar-title>
        </div>

        <div class="layout-view">
          <div class="layout-padding">
            <q-dialog-select type="radio" v-model="classifier" :options="classifierOptions" ok-label="Ok" cancel-label="Cancel" title="Choose the Supervised Classifier"></q-dialog-select>
            <q-dialog-select type="radio" v-model="vocabModel" :options="vocabModelOptions" ok-label="Ok" cancel-label="Cancel" title="Choose the Vocabulary Model"></q-dialog-select>

            <div class="row">
              <label>
                <q-checkbox v-model="tfIdf"></q-checkbox>
                tf-idf
              </label>

              <label>
                <q-checkbox v-model="corrected"></q-checkbox>
                Spell corrected
              </label>
            </div>

            <button class="primary" @click="explainWeights">
              Explain Weights
            </button>
          </div>
        </div>
      </q-layout>
    </q-modal>

    <!-- Weights Explanation Modal -->
    <q-modal class="maximized" ref="weightsExplanationModal" :content-css="{minWidth: '80vw', minHeight: '80vh'}">
      <q-layout>
        <div slot="header" class="toolbar">
          <button @click="$refs.weightsExplanationModal.close()">
            <i>keyboard_arrow_left</i>
          </button>
          <q-toolbar-title :padding="1">
            Weights Explanation
          </q-toolbar-title>
        </div>

        <div class="layout-view">
          <div class="layout-padding">
            <div id="weights-explanation"></div>
          </div>
        </div>
      </q-layout>
    </q-modal>

    <!-- Word Cloud Modal -->
    <q-modal ref="wordcloudModal" :content-css="{minWidth: '80vw', minHeight: '80vh'}">
      <q-layout>
        <div slot="header" class="toolbar">
          <button @click="$refs.wordcloudModal.close()">
            <i>keyboard_arrow_left</i>
          </button>
          <q-toolbar-title :padding="1">
            Word Cloud
          </q-toolbar-title>
        </div>

        <div class="layout-view">
          <div class="layout-padding">
            <div>
              <h5>Overall</h5>
              <canvas id="overall" width="600" height="400"></canvas>
            </div>

            <div>
              <h5>Very Positive</h5>
              <canvas id="very-positive" width="600" height="400"></canvas>
            </div>

            <div>
              <h5>Positive</h5>
              <canvas id="positive" width="600" height="400"></canvas>
            </div>

            <div>
              <h5>Neutral</h5>
              <canvas id="neutral" width="600" height="400"></canvas>
            </div>

            <div>
              <h5>Negative</h5>
              <canvas id="negative" width="600" height="400"></canvas>
            </div>

            <div>
              <h5>Very Negative</h5>
              <canvas id="very-negative" width="600" height="400"></canvas>
            </div>
          </div>
        </div>
      </q-layout>
    </q-modal>

    <!-- Refs -->
    <!-- Training -->
    <div class="layout-view" ref="training">
      <div class="layout-padding">
        <div class="list bordered">
          <q-collapsible icon="settings" label="Configure">
            <q-dialog-select type="radio" v-model="classifier" :options="classifierOptions" ok-label="Ok" cancel-label="Cancel" title="Choose the Supervised Classifier">
            </q-dialog-select>

            <q-dialog-select type="radio" v-model="vocabModel" :options="vocabModelOptions" ok-label="Ok" cancel-label="Cancel" title="Choose the Vocabulary Model">
            </q-dialog-select>

            <div class="row">
              <label>
                <q-checkbox v-model="tfIdf"></q-checkbox>
                tf-idf
              </label>

              <label>
                <q-checkbox v-model="corrected"></q-checkbox>
                Spell corrected
              </label>
            </div>

            <label>Data Size</label>
            <q-dialog-select type="radio" v-model.trim.number="dataSize" :options="dataSizeOptions" ok-label="Ok" cancel-label="Cancel" title="Choose the Data Size">
            </q-dialog-select>

            <!-- <hr>
            <label>Minimum Document Frequency</label>
            <q-range :min="5" :max="100" v-model.trim.number="minDF" labelAlways></q-range> -->

            <q-progress-button class="primary" :percentage="training" @click.native="train" indeterminate dark-filler>
              Train
            </q-progress-button>
            OR
            <q-progress-button class="primary" :percentage="retrievingExistingData" @click.native="getExistingInformations" indeterminate dark-filler>
              Get Current
            </q-progress-button>
          </q-collapsible>
        </div>

        <div class="list bordered">
          <q-collapsible group="performance" icon="explore" label="Performance (unigram)" v-show="training === 100 || retrievingExistingData === 100">
            <div id="unigram-bar-chart">
            </div>
            <div id="unigram-line-chart-train-accuracy">
            </div>
            <div id="unigram-line-chart-test-accuracy">
            </div>
            <div id="unigram-line-chart-f-score">
            </div>
            <div id="unigram-line-chart-precision">
            </div>
            <div id="unigram-line-chart-recall">
            </div>
          </q-collapsible>

          <q-collapsible group="performance" icon="explore" label="Performance (bigram)" v-show="training === 100 || retrievingExistingData === 100">
            <div id="bigram-bar-chart">
            </div>
            <div id="bigram-line-chart-train-accuracy">
            </div>
            <div id="bigram-line-chart-test-accuracy">
            </div>
            <div id="bigram-line-chart-f-score">
            </div>
            <div id="bigram-line-chart-precision">
            </div>
            <div id="bigram-line-chart-recall">
            </div>
          </q-collapsible>

          <q-collapsible group="performance" icon="explore" label="Performance (trigram)" v-show="training === 100 || retrievingExistingData === 100">
            <div id="trigram-bar-chart">
            </div>
            <div id="trigram-line-chart-train-accuracy">
            </div>
            <div id="trigram-line-chart-test-accuracy">
            </div>
            <div id="trigram-line-chart-f-score">
            </div>
            <div id="trigram-line-chart-precision">
            </div>
            <div id="trigram-line-chart-recall">
            </div>
          </q-collapsible>

          <q-collapsible group="performance" icon="explore" label="Performance (unigram, tf-idf)" v-show="training === 100 || retrievingExistingData === 100">
            <div id="unigram-tfidf-bar-chart">
            </div>
            <div id="unigram-tfidf-line-chart-train-accuracy">
            </div>
            <div id="unigram-tfidf-line-chart-test-accuracy">
            </div>
            <div id="unigram-tfidf-line-chart-f-score">
            </div>
            <div id="unigram-tfidf-line-chart-precision">
            </div>
            <div id="unigram-tfidf-line-chart-recall">
            </div>
          </q-collapsible>

          <q-collapsible group="performance" icon="explore" label="Performance (bigram, tf-idf)" v-show="training === 100 || retrievingExistingData === 100">
            <div id="bigram-tfidf-bar-chart">
            </div>
            <div id="bigram-tfidf-line-chart-train-accuracy">
            </div>
            <div id="bigram-tfidf-line-chart-test-accuracy">
            </div>
            <div id="bigram-tfidf-line-chart-f-score">
            </div>
            <div id="bigram-tfidf-line-chart-precision">
            </div>
            <div id="bigram-tfidf-line-chart-recall">
            </div>
          </q-collapsible>

          <q-collapsible group="performance" icon="explore" label="Performance (trigram, tf-idf)" v-show="training === 100 || retrievingExistingData === 100">
            <div id="trigram-tfidf-bar-chart">
            </div>
            <div id="trigram-tfidf-line-chart-train-accuracy">
            </div>
            <div id="trigram-tfidf-line-chart-test-accuracy">
            </div>
            <div id="trigram-tfidf-line-chart-f-score">
            </div>
            <div id="trigram-tfidf-line-chart-precision">
            </div>
            <div id="trigram-tfidf-line-chart-recall">
            </div>
          </q-collapsible>

          <q-collapsible group="performance" icon="explore" label="Performance (unigram, corrected)" v-show="training === 100 || retrievingExistingData === 100">
            <div id="unigram-corrected-bar-chart">
            </div>
            <div id="unigram-corrected-line-chart-train-accuracy">
            </div>
            <div id="unigram-corrected-line-chart-test-accuracy">
            </div>
            <div id="unigram-corrected-line-chart-f-score">
            </div>
            <div id="unigram-corrected-line-chart-precision">
            </div>
            <div id="unigram-corrected-line-chart-recall">
            </div>
          </q-collapsible>

          <q-collapsible group="performance" icon="explore" label="Performance (bigram, corrected)" v-show="training === 100 || retrievingExistingData === 100">
            <div id="bigram-corrected-bar-chart">
            </div>
            <div id="bigram-corrected-line-chart-train-accuracy">
            </div>
            <div id="bigram-corrected-line-chart-test-accuracy">
            </div>
            <div id="bigram-corrected-line-chart-f-score">
            </div>
            <div id="bigram-corrected-line-chart-precision">
            </div>
            <div id="bigram-corrected-line-chart-recall">
            </div>
          </q-collapsible>

          <q-collapsible group="performance" icon="explore" label="Performance (trigram, corrected)" v-show="training === 100 || retrievingExistingData === 100">
            <div id="trigram-corrected-bar-chart">
            </div>
            <div id="trigram-corrected-line-chart-train-accuracy">
            </div>
            <div id="trigram-corrected-line-chart-test-accuracy">
            </div>
            <div id="trigram-corrected-line-chart-f-score">
            </div>
            <div id="trigram-corrected-line-chart-precision">
            </div>
            <div id="trigram-corrected-line-chart-recall">
            </div>
          </q-collapsible>

          <q-collapsible group="performance" icon="explore" label="Performance (unigram, tf-idf, corrected)" v-show="training === 100 || retrievingExistingData === 100">
            <div id="unigram-tfidf-corrected-bar-chart">
            </div>
            <div id="unigram-tfidf-corrected-line-chart-train-accuracy">
            </div>
            <div id="unigram-tfidf-corrected-line-chart-test-accuracy">
            </div>
            <div id="unigram-tfidf-corrected-line-chart-f-score">
            </div>
            <div id="unigram-tfidf-corrected-line-chart-precision">
            </div>
            <div id="unigram-tfidf-corrected-line-chart-recall">
            </div>
          </q-collapsible>

          <q-collapsible group="performance" icon="explore" label="Performance (bigram, tf-idf, corrected)" v-show="training === 100 || retrievingExistingData === 100">
            <div id="bigram-tfidf-corrected-bar-chart">
            </div>
            <div id="bigram-tfidf-corrected-line-chart-train-accuracy">
            </div>
            <div id="bigram-tfidf-corrected-line-chart-test-accuracy">
            </div>
            <div id="bigram-tfidf-corrected-line-chart-f-score">
            </div>
            <div id="bigram-tfidf-corrected-line-chart-precision">
            </div>
            <div id="bigram-tfidf-corrected-line-chart-recall">
            </div>
          </q-collapsible>

          <q-collapsible group="performance" icon="explore" label="Performance (trigram, tf-idf, corrected)" v-show="training === 100 || retrievingExistingData === 100">
            <div id="trigram-tfidf-corrected-bar-chart">
            </div>
            <div id="trigram-tfidf-corrected-line-chart-train-accuracy">
            </div>
            <div id="trigram-tfidf-corrected-line-chart-test-accuracy">
            </div>
            <div id="trigram-tfidf-corrected-line-chart-f-score">
            </div>
            <div id="trigram-tfidf-corrected-line-chart-precision">
            </div>
            <div id="trigram-tfidf-corrected-line-chart-recall">
            </div>
          </q-collapsible>
        </div>
      </div>
    </div>

    <!-- Confusion Matrices -->
    <div class="layout-view" ref="confusion-matrices">
      <div class="layout-padding list bordered">
        <q-collapsible group="chart" icon="explore" label="Confusion Matrices (unigram)">
          <div id="unigram-confusion-matrix-LR-train">
          </div>
          <div id="unigram-confusion-matrix-LR-test">
          </div>
          <div id="unigram-confusion-matrix-SVM-train">
          </div>
          <div id="unigram-confusion-matrix-SVM-test">
          </div>
          <div id="unigram-confusion-matrix-MLP-train">
          </div>
          <div id="unigram-confusion-matrix-MLP-test">
          </div>
        </q-collapsible>

        <q-collapsible group="chart" icon="explore" label="Confusion Matrices (bigram)">
          <div id="bigram-confusion-matrix-LR-train">
          </div>
          <div id="bigram-confusion-matrix-LR-test">
          </div>
          <div id="bigram-confusion-matrix-SVM-train">
          </div>
          <div id="bigram-confusion-matrix-SVM-test">
          </div>
          <div id="bigram-confusion-matrix-MLP-train">
          </div>
          <div id="bigram-confusion-matrix-MLP-test">
          </div>
        </q-collapsible>

        <q-collapsible group="chart" icon="explore" label="Confusion Matrices (trigram)">
          <div id="trigram-confusion-matrix-LR-train">
          </div>
          <div id="trigram-confusion-matrix-LR-test">
          </div>
          <div id="trigram-confusion-matrix-SVM-train">
          </div>
          <div id="trigram-confusion-matrix-SVM-test">
          </div>
          <div id="trigram-confusion-matrix-MLP-train">
          </div>
          <div id="trigram-confusion-matrix-MLP-test">
          </div>
        </q-collapsible>

        <q-collapsible group="chart" icon="explore" label="Confusion Matrices (unigram, tf-idf)">
          <div id="unigram-tfidf-confusion-matrix-LR-train">
          </div>
          <div id="unigram-tfidf-confusion-matrix-LR-test">
          </div>
          <div id="unigram-tfidf-confusion-matrix-SVM-train">
          </div>
          <div id="unigram-tfidf-confusion-matrix-SVM-test">
          </div>
          <div id="unigram-tfidf-confusion-matrix-MLP-train">
          </div>
          <div id="unigram-tfidf-confusion-matrix-MLP-test">
          </div>
        </q-collapsible>

        <q-collapsible group="chart" icon="explore" label="Confusion Matrices (bigram, tf-idf)">
          <div id="bigram-tfidf-confusion-matrix-LR-train">
          </div>
          <div id="bigram-tfidf-confusion-matrix-LR-test">
          </div>
          <div id="bigram-tfidf-confusion-matrix-SVM-train">
          </div>
          <div id="bigram-tfidf-confusion-matrix-SVM-test">
          </div>
          <div id="bigram-tfidf-confusion-matrix-MLP-train">
          </div>
          <div id="bigram-tfidf-confusion-matrix-MLP-test">
          </div>
        </q-collapsible>

        <q-collapsible group="chart" icon="explore" label="Confusion Matrices (trigram, tf-idf)">
          <div id="trigram-tfidf-confusion-matrix-LR-train">
          </div>
          <div id="trigram-tfidf-confusion-matrix-LR-test">
          </div>
          <div id="trigram-tfidf-confusion-matrix-SVM-train">
          </div>
          <div id="trigram-tfidf-confusion-matrix-SVM-test">
          </div>
          <div id="trigram-tfidf-confusion-matrix-MLP-train">
          </div>
          <div id="trigram-tfidf-confusion-matrix-MLP-test">
          </div>
        </q-collapsible>

        <q-collapsible group="chart" icon="explore" label="Confusion Matrices (unigram, corrected)">
          <div id="unigram-corrected-confusion-matrix-LR-train">
          </div>
          <div id="unigram-corrected-confusion-matrix-LR-test">
          </div>
          <div id="unigram-corrected-confusion-matrix-SVM-train">
          </div>
          <div id="unigram-corrected-confusion-matrix-SVM-test">
          </div>
          <div id="unigram-corrected-confusion-matrix-MLP-train">
          </div>
          <div id="unigram-corrected-confusion-matrix-MLP-test">
          </div>
        </q-collapsible>

        <q-collapsible group="chart" icon="explore" label="Confusion Matrices (bigram, corrected)">
          <div id="bigram-corrected-confusion-matrix-LR-train">
          </div>
          <div id="bigram-corrected-confusion-matrix-LR-test">
          </div>
          <div id="bigram-corrected-confusion-matrix-SVM-train">
          </div>
          <div id="bigram-corrected-confusion-matrix-SVM-test">
          </div>
          <div id="bigram-corrected-confusion-matrix-MLP-train">
          </div>
          <div id="bigram-corrected-confusion-matrix-MLP-test">
          </div>
        </q-collapsible>

        <q-collapsible group="chart" icon="explore" label="Confusion Matrices (trigram, corrected)">
          <div id="trigram-corrected-confusion-matrix-LR-train">
          </div>
          <div id="trigram-corrected-confusion-matrix-LR-test">
          </div>
          <div id="trigram-corrected-confusion-matrix-SVM-train">
          </div>
          <div id="trigram-corrected-confusion-matrix-SVM-test">
          </div>
          <div id="trigram-corrected-confusion-matrix-MLP-train">
          </div>
          <div id="trigram-corrected-confusion-matrix-MLP-test">
          </div>
        </q-collapsible>

        <q-collapsible group="chart" icon="explore" label="Confusion Matrices (unigram, tf-idf, corrected)">
          <div id="unigram-tfidf-corrected-confusion-matrix-LR-train">
          </div>
          <div id="unigram-tfidf-corrected-confusion-matrix-LR-test">
          </div>
          <div id="unigram-tfidf-corrected-confusion-matrix-SVM-train">
          </div>
          <div id="unigram-tfidf-corrected-confusion-matrix-SVM-test">
          </div>
          <div id="unigram-tfidf-corrected-confusion-matrix-MLP-train">
          </div>
          <div id="unigram-tfidf-corrected-confusion-matrix-MLP-test">
          </div>
        </q-collapsible>

        <q-collapsible group="chart" icon="explore" label="Confusion Matrices (bigram, tf-idf, corrected)">
          <div id="bigram-tfidf-corrected-confusion-matrix-LR-train">
          </div>
          <div id="bigram-tfidf-corrected-confusion-matrix-LR-test">
          </div>
          <div id="bigram-tfidf-corrected-confusion-matrix-SVM-train">
          </div>
          <div id="bigram-tfidf-corrected-confusion-matrix-SVM-test">
          </div>
          <div id="bigram-tfidf-corrected-confusion-matrix-MLP-train">
          </div>
          <div id="bigram-tfidf-corrected-confusion-matrix-MLP-test">
          </div>
        </q-collapsible>

        <q-collapsible group="chart" icon="explore" label="Confusion Matrices (trigram, tf-idf, corrected)">
          <div id="trigram-tfidf-corrected-confusion-matrix-LR-train">
          </div>
          <div id="trigram-tfidf-corrected-confusion-matrix-LR-test">
          </div>
          <div id="trigram-tfidf-corrected-confusion-matrix-SVM-train">
          </div>
          <div id="trigram-tfidf-corrected-confusion-matrix-SVM-test">
          </div>
          <div id="trigram-tfidf-corrected-confusion-matrix-MLP-train">
          </div>
          <div id="trigram-tfidf-corrected-confusion-matrix-MLP-test">
          </div>
        </q-collapsible>
      </div>
    </div>

    <!-- Features -->
    <div class="layout-view" ref="features">
      <div class="layout-padding">
        <q-data-table :data="features" :config="config" :columns="columns"></q-data-table>
      </div>
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
  import axios from 'axios'
  import WordCloud from 'wordcloud'
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
        dataSizeOptions: [
          { label: '1000', value: 1000 },
          { label: '5000', value: 5000 },
          { label: '10000', value: 10000 },
          { label: '20000', value: 20000 },
          { label: '30000', value: 30000 },
          { label: '40000', value: 40000 },
          { label: 'All Data', value: -1 }
        ],
        config: {
          title: 'Features',
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
            label: 'Unigram',
            field: 'unigram',
            filter: true,
            sort: true,
            width: '200px'
          },
          {
            label: 'Bigram',
            field: 'bigram',
            filter: true,
            sort: true,
            width: '200px'
          },
          {
            label: 'Trigram',
            field: 'trigram',
            filter: true,
            sort: true,
            width: '200px'
          }
        ],
        features: [],
        classifier: 'LR',
        tfIdf: false,
        corrected: false,
        currentTab: 'training',
        vocabModel: 'unigram',
        dataSize: 1000,
        minDF: 5,
        training: 0,
        retrievingExistingData: 0,
        classes: ['negative', 'neutral', 'positive', 'very_negative', 'very_positive'],
        classifiers: ['Logistic Regression', 'Support Vector Machine', 'Multi-layer Perceptron'],
        performance: []
      }
    },
    methods: {
      viewWordClouds () {
        Loading.show({
          delay: 100,
          message: 'Retrieving words for word cloud visualization...',
          spinner: 'dots',
          spinnerSize: 150
        })

        const config = {
          method: 'get',
          baseURL: apiRoutes.rethinkdbBaseURL,
          url: '/wordclouds'
        }

        axios(config)
          .then(response => {
            _.forEach(response.data, (v, k) => {
              let list = []

              for (let key of Object.keys(v)) {
                if (v.hasOwnProperty(key)) {
                  list.push([key, v[key]])
                }
              }

              let options = {
                list,
                weightFactor: size => {
                  let logSize = Math.log(size)
                  Math.pow(logSize, 2.3) + (logSize * 10)
                }
              }

              switch (k) {
                case 'overall': WordCloud(document.getElementById('overall'), options); break
                case 'very_positive': WordCloud(document.getElementById('very-positive'), options); break
                case 'positive': WordCloud(document.getElementById('positive'), options); break
                case 'neutral': WordCloud(document.getElementById('neutral'), options); break
                case 'negative': WordCloud(document.getElementById('negative'), options); break
                case 'very_negative': WordCloud(document.getElementById('very-negative'), options); break
              }
            })

            Loading.hide()
            this.$refs.wordcloudModal.open()
          })
          .catch(error => {
            Loading.hide()
            throw new Error(error)
          })
      },
      explainWeights () {
        Loading.show({
          delay: 100,
          message: 'Retrieving explanation for the weights of the model...',
          spinner: 'dots',
          spinnerSize: 150
        })

        const config = {
          method: 'post',
          baseURL: apiRoutes.classifierBaseURL,
          url: '/explain/weights',
          data: {
            classifier: this.classifier,
            vocabModel: this.vocabModel,
            tfIdf: this.tfIdf,
            corrected: this.corrected
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }

        axios(config)
          .then(response => {
            $('#weights-explanation').empty()
            $('#weights-explanation').append(response.data.div)
            Loading.hide()
            this.$refs.weightsExplanationModal.open()
          })
          .catch(error => {
            Loading.hide()
            throw new Error(error)
          })
      },
      getAllVocab () {
        Loading.show({
          delay: 100,
          message: 'Retrieving all the features...',
          spinner: 'dots',
          spinnerSize: 150
        })

        const config = {
          method: 'get',
          baseURL: apiRoutes.rethinkdbBaseURL,
          url: '/features'
        }

        axios(config)
          .then(response => {
            const maxLength = _.max(_.map(response.data, e => {
              return e.data.length
            }))

            for (let i = 0; i < maxLength; i++) {
              this.features.push({
                unigram: response.data[0].data[i],
                bigram: response.data[1].data[i],
                trigram: response.data[2].data[i]
              })
            }

            Loading.hide()
          })
          .catch(error => {
            throw new Error(error)
          })
      },
      train () {
        const classifier = _.filter(this.classifierOptions, { 'value': this.classifier })[0].label

        Loading.show({
          delay: 100,
          message: `Training using ${classifier}...`,
          spinner: 'dots',
          spinnerSize: 150
        })

        this.training = 1

        const config = {
          method: 'post',
          baseURL: apiRoutes.classifierBaseURL,
          url: '/train',
          data: {
            classifier: this.classifier,
            dataSize: this.dataSize,
            vocabModel: this.vocabModel,
            tfIdf: this.tfIdf,
            corrected: this.corrected
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }

        axios(config)
          .then(response => {
            this.performance = response.data
            Loading.hide()
            this.plotBarGraph()
            this.plotLineGraph()
            this.createConfusionMatrices()
            this.training = 100
          })
          .catch(error => {
            Loading.hide()
            this.training = -1
            throw new Error(error)
          })
      },
      getExistingInformations () {
        this.retrievingExistingData = 1

        const config = {
          method: 'get',
          baseURL: apiRoutes.classifierBaseURL,
          url: '/existing-informations'
        }

        axios(config)
          .then(response => {
            this.performance = response.data
            this.plotBarGraph()
            this.plotLineGraph()
            this.createConfusionMatrices()
            this.retrievingExistingData = 100
          })
          .catch(error => {
            this.retrievingExistingData = -1
            throw new Error(error)
          })
      },
      plotLineGraph () {
        const vocabModels = ['unigram', 'bigram', 'trigram']
        const tfIdfs = [true, false]
        const corrected = [true, false]
        const classifiers = ['LR', 'SVM', 'MLP']
        const types = ['train_score', 'test_score', 'f1_score', 'precision_score', 'recall_score']

        for (let v of vocabModels) {
          for (let t of tfIdfs) {
            for (let c of corrected) {
              let curr = _.find(this.performance, { vocab_model: v, tf_idf: t, corrected: c })

              for (let type of types) {
                let div = `${v}${t ? '-tfidf' : ''}${c ? '-corrected' : ''}-line-chart`
                let data = []
                let layout = {
                  xaxis: {
                    title: 'Data Size'
                  },
                  yaxis: {}
                }

                switch (type) {
                  case 'train_score': layout.title = 'Train Accuracy of Different Classifiers on Different Size of Data'
                    layout.yaxis.title = 'Accuracy'
                    div += '-train-accuracy'; break
                  case 'test_score': layout.title = 'Test Accuracy of Different Classifiers on Different Size of Data'
                    layout.yaxis.title = 'Accuracy'
                    div += '-test-accuracy'; break
                  case 'f1_score': layout.title = 'F-Score of Different Classifiers on Different Size of Data'
                    layout.yaxis.title = 'F-Score'
                    div += '-f-score'; break
                  case 'precision_score': layout.title = 'Precision of Different Classifiers on Different Size of Data'
                    layout.yaxis.title = 'Precision'
                    div += '-precision'; break
                  case 'recall_score': layout.title = 'Recall of Different Classifiers on Different Size of Data'
                    layout.yaxis.title = 'Recall'
                    div += '-recall'; break
                }

                _.forEach(classifiers, (clf, k) => {
                  let trace = {
                    x: [],
                    y: [],
                    type: 'scatter',
                    name: this.classifiers[k]
                  }

                  trace.x = _.map(_.sortBy(curr[clf], ['data_size']), 'data_size')
                  trace.y = _.map(_.sortBy(curr[clf], ['data_size']), type)

                  data.push(trace)
                })

                Plotly.newPlot(div, data, layout)
              }
            }
          }
        }
      },
      plotBarGraph () {
        const vocabModels = ['unigram', 'bigram', 'trigram']
        const tfIdfs = [true, false]
        const corrected = [true, false]
        const classifiers = ['LR', 'SVM', 'MLP']
        const types = ['train_score', 'test_score', 'f1_score', 'precision_score', 'recall_score']

        for (let v of vocabModels) {
          for (let t of tfIdfs) {
            for (let c of corrected) {
              let curr = _.find(this.performance, { vocab_model: v, tf_idf: t, corrected: c })
              let data = []
              let layout = {
                title: `Performance Measures of Different Classifiers (${v}${t ? ', tf-idf' : ''} ${c ? ', Corrected Spelling' : ''})`,
                barmode: 'group'
              }

              for (let type of types) {
                let trace = {
                  x: this.classifiers,
                  y: [],
                  type: 'bar'
                }

                switch (type) {
                  case 'train_score': trace.name = 'Training Accuracy'; break
                  case 'test_score': trace.name = 'Testing Accuracy'; break
                  case 'f1_score': trace.name = 'F-Score'; break
                  case 'precision_score': trace.name = 'Precision'; break
                  case 'recall_score': trace.name = 'Recall'; break
                }

                for (let clf of classifiers) {
                  trace.y.push(_.maxBy(curr[clf], 'data_size')[type])
                }

                data.push(trace)
              }

              Plotly.newPlot(`${v}${t ? '-tfidf' : ''}${c ? '-corrected' : ''}-bar-chart`, data, layout)
            }
          }
        }
      },
      createConfusionMatrices () {
        const vocabModels = ['unigram', 'bigram', 'trigram']
        const tfIdfs = [true, false]
        const corrected = [true, false]
        const classifiers = ['LR', 'SVM', 'MLP']

        for (let v of vocabModels) {
          for (let t of tfIdfs) {
            for (let c of corrected) {
              let curr = _.find(this.performance, { vocab_model: v, tf_idf: t, corrected: c })

              for (let clf of classifiers) {
                this.plotHeatmap(_.maxBy(curr[clf], 'data_size').cm_train, 'Training', clf, v, t, c)
                this.plotHeatmap(_.maxBy(curr[clf], 'data_size').cm_test, 'Testing', clf, v, t, c)
              }
            }
          }
        }
      },
      plotHeatmap (cm, type, key, v, t, c) {
        let data = [
          {
            x: this.classes,
            y: this.classes,
            z: cm,
            type: 'heatmap'
          }
        ]

        let title
        switch (key) {
          case 'LR': title = `Logistic Regression Confusion Matrix of ${type} Data`; break
          case 'SVM': title = `Support Vector Machine Confusion Matrix of ${type} Data`; break
          case 'MLP': title = `Multi-layer Perceptron Confusion Matrix of ${type} Data`; break
        }

        let layout = {
          title,
          annotations: [],
          xaxis: {
            ticks: '',
            side: 'top'
          },
          yaxis: {
            ticks: '',
            ticksuffix: ' ',
            width: 700,
            height: 700,
            autosize: false
          }
        }

        // Put annotations to the heatmap
        for (let i = 0; i < this.classes.length; i++) {
          for (let j = 0; j < this.classes.length; j++) {
            let result = {
              xref: 'x1',
              yref: 'y1',
              x: this.classes[j],
              y: this.classes[i],
              text: cm[i][j],
              font: {
                family: 'Arial',
                size: 18,
                color: 'white'
              },
              showarrow: false
            }

            layout.annotations.push(result)
          }
        }

        Plotly.newPlot(`${v}${t ? '-tfidf' : ''}${c ? '-corrected' : ''}-confusion-matrix-${key}-${type === 'Training' ? 'train' : 'test'}`, data, layout)
      }
    }
  }
</script>

<style>
</style>
