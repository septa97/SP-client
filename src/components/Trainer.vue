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
        Trainer
      </q-toolbar-title>
    </div>

    <!-- Navigation Tabs -->
    <!-- <q-tabs slot="navigation">
      <q-tab icon="mail" route="/layout" exact replace>Mails</q-tab>
      <q-tab icon="alarm" route="/layout/alarm" exact replace>Alarms</q-tab>
      <q-tab icon="help" route="/layout/help" exact replace>Help</q-tab>
    </q-tabs> -->

    <!-- Drawer -->
    <q-drawer ref="drawer">
      <div class="toolbar">
        <q-toolbar-title>
          Options
        </q-toolbar-title>
      </div>

      <div class="list platform-delimiter">
        <q-dialog-select type="radio" v-model="classifier" :options="classifierOptions" ok-label="Ok" cancel-label="Cancel" title="Choose the Supervised Classifier">
        </q-dialog-select>

        <div class="stacked-label">
          <input type="text" v-model.trim.number="dataSize">
          <label>Data Size</label>
        </div>

        <q-range class="orange" :min="10" :max="90" v-model.trim.number="testDataSize" label></q-range>

        <q-range class="orange" :min="5" :max="20" v-model.trim.number="minDF" label></q-range>

        <q-progress-button class="orange" :percentage="training" @click.native="train" indeterminate dark-filler>
          Train
        </q-progress-button>
        OR
        <q-progress-button class="orange" :percentage="retrievingExistingData" @click.native="getExistingInformations" indeterminate dark-filler>
          Get Current
        </q-progress-button>
      </div>
    </q-drawer>


    <div class="layout-view">
      <div class="list">
        <q-collapsible opened group="chart" icon="explore" label="Performance">
          <div id="performance">
          </div>
        </q-collapsible>

        <q-collapsible group="chart" icon="explore" label="Logistic Regression Confusion Matrix Training Data">
          <div id="confusion-matrix-LR-train">
          </div>
        </q-collapsible>

        <q-collapsible group="chart" icon="explore" label="Logistic Regression Confusion Matrix Testing Data">
          <div id="confusion-matrix-LR-test">
          </div>
        </q-collapsible>

        <q-collapsible group="chart" icon="explore" label="Support Vector Machine Confusion Matrix Training Data">
          <div id="confusion-matrix-SVM-train">
          </div>
        </q-collapsible>

        <q-collapsible group="chart" icon="explore" label="Support Vector Machine Confusion Matrix Testing Data">
          <div id="confusion-matrix-SVM-test">
          </div>
        </q-collapsible>

        <q-collapsible group="chart" icon="explore" label="Multi-layer Perceptron Confusion Matrix Training Data">
          <div id="confusion-matrix-MLP-train">
          </div>
        </q-collapsible>

        <q-collapsible group="chart" icon="explore" label="Multi-layer Perceptron Confusion Matrix Testing Data">
          <div id="confusion-matrix-MLP-test">
          </div>
        </q-collapsible>
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

  import apiRoutes from './../apiRoutes'
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
        classifier: 'LR',
        dataSize: 1000,
        testDataSize: 20,
        minDF: 5,
        training: 0,
        retrievingExistingData: 0,
        classes: ['negative', 'neutral', 'positive', 'very_negative', 'very_positive'],
        classifiers: ['Logistic Regression', 'Support Vector Machine', 'Multi-layer Perceptron'],
        confusionMatrix: {
          LR: {},
          SVM: {},
          MLP: {}
        },
        accuracy: {
          LR: {},
          SVM: {},
          MLP: {}
        },
        fScore: {},
        precision: {},
        recall: {},
        size: {
          LR: {},
          SVM: {},
          MLP: {}
        }
      }
    },
    methods: {
      train () {
        this.training = 1

        const config = {
          method: 'post',
          baseURL: apiRoutes.classifierBaseURL,
          url: '/train',
          data: {
            classifier: this.classifier,
            minDF: this.minDF,
            dataSize: this.dataSize,
            testDataSize: this.testDataSize / 100
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }

        axios(config)
          .then(response => {
            this.saveLocally(response.data)
            this.training = 100
          })
          .catch(error => {
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
            this.saveLocally(response.data)
            this.retrievingExistingData = 100
          })
          .catch(error => {
            this.retrievingExistingData = -1
            throw new Error(error)
          })
      },
      saveLocally (data) {
        const classifiers = ['LR', 'SVM', 'MLP']

        _.forEach(classifiers, classifier => {
          this.confusionMatrix[classifier].train = data[classifier].cm_train
          this.confusionMatrix[classifier].test = data[classifier].cm_test
          this.size[classifier].train = data[classifier].train_size
          this.size[classifier].test = data[classifier].test_size
          this.accuracy[classifier].train = data[classifier].train_score
          this.accuracy[classifier].test = data[classifier].test_score
          this.fScore[classifier] = data[classifier].f1_score
          this.precision[classifier] = data[classifier].precision_score
          this.recall[classifier] = data[classifier].recall_score
        })

        this.plotBarGraph()
        this.createConfusionMatrices()
      },
      plotBarGraph () {
        const classifiers = ['LR', 'SVM', 'MLP']
        let data = []

        let layout = {
          title: 'Performance Measures of Different Classifiers',
          barmode: 'group'
        }

        _.forEach(['train', 'test', 'fScore', 'precision', 'recall'], type => {
          let trace = {
            x: this.classifiers,
            y: [],
            type: 'bar'
          }

          switch (type) {
            case 'train': trace.name = 'Training Accuracy'; break
            case 'test': trace.name = 'Testing Accuracy'; break
            case 'fScore': trace.name = 'F-Score'; break
            case 'precision': trace.name = 'Precision'; break
            case 'recall': trace.name = 'Recall'; break
          }

          if (type === 'train' || type === 'test') {
            _.forEach(classifiers, c => {
              trace.y.push(this.accuracy[c][type] * 100)
            })
          }
          else {
            _.forEach(classifiers, c => {
              trace.y.push(this[type][c] * 100)
            })
          }

          data.push(trace)
        })

        Plotly.newPlot('performance', data, layout)
      },
      createConfusionMatrices () {
        _.forEach(this.confusionMatrix, (value, key) => {
          this.plotHeatmap(value.train, 'Training', key)
          this.plotHeatmap(value.test, 'Testing', key)
        })
      },
      plotHeatmap (cm, type, key) {
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

        // Add to the mainDiv
        let id = type === 'Training' ? `confusion-matrix-${key}-train` : `confusion-matrix-${key}-test`
        let mainDiv = $(`#${id}`)
        mainDiv.empty()
        $('<div>').appendTo(mainDiv)

        Plotly.newPlot(id, data, layout)
      }
    }
  }
</script>

<style>
</style>
