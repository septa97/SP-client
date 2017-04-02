<template>
    <div id="main">
        <div class="input-field col s6">
            <h5>Supervised classifier</h5>
            <form>
                <p>
                    <input id="LR" type="radio" v-model="classifier" value="LR">
                    <label for="LR">Logistic Regression</label>
                <p>
                <p>
                    <input id="SVM" type="radio" v-model="classifier" value="SVM">
                    <label for="SVM">Support Vector Machine</label>
                <p>
                <p>
                    <input id="MLP" type="radio" v-model="classifier" value="MLP">
                    <label for="MLP">Multi-layer Perceptron (Artifial Neural Network)</label>
                <p>
            </form>
        </div>

        <div class="row">
            <div class="input-field col s6">
                <input id="data-size" type="text" v-model.trim.number="dataSize">
                <label for="data-size">Data Size</label>
            </div>
        </div>

        <div class="row">
            <div class="col s6">
                <label for="test-data-size">Test Data Size</label>
                <input id="test-data-size" type="range" min="10" max="90" v-model.trim.number="testDataSize">
                <output for="test-data-size">{{ testDataSize }}%</output>
            </div>
        </div>

        <div class="row">
            <div class="col s6">
                <label for="min-df">Minimum Document Frequency</label>
                <input id="min-df" type="range" min="5" max="20" v-model.trim.number="minDF">
                <output for="min-df">{{ minDF }}</output>
            </div>
        </div>

        <div class="row">
            <div class="input-field col s3">
                <button class="btn waves-effect waves-light" type="submit" @click="train">
                    Train
                </button>
            </div>
            <div class="input-field col s3">
                <button class="btn waves-effect waves-light" type="submit" @click="getExistingInformations">
                    Retrieve Existing Data
                </button>
            </div>
        </div>

        <div class="row">
            <div class="progress" v-if="training || retrievingExistingData">
                <div class="indeterminate"></div>
            </div>
        </div>

        <div id="charts">
            <div id="performance">
            </div>
            <div id="confusion-matrix-LR">
            </div>
            <div id="confusion-matrix-SVM">
            </div>
            <div id="confusion-matrix-MLP">
            </div>
        </div>
    </div>
</template>

<script>
    'use strict'

    import apiRoutes from './../apiRoutes'
    import axios from 'axios'

    export default {
        data() {
            return {
                options: [
                    { text: 'Logistic Regression', value: 'LR' },
                    { text: 'Support Vector Machine', value: 'SVM' },
                    { text: 'Multi-layer Perceptron (Artifial Neural Network)', value: 'MLP' }
                ],
                dataSize: 1000,
                testDataSize: 20,
                classifier: 'LR',
                minDF: 5,
                training: false,
                retrievingExistingData: false,
                classes: ['negative', 'neutral', 'positive'], // should be dynamic later
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
                size: {
                    LR: {},
                    SVM: {},
                    MLP: {}
                }
            }
        },
        mounted() {
        },
        methods: {
            plotBarGraph() {
                let data = []

                let layout = {
                    title: 'Performance Measures of Different Classifiers',
                    barmode: 'group'
                }

                _.forEach(['train', 'test'], type => {
                    const classifiers = ['LR', 'SVM', 'MLP']

                    let trace = {
                        x: this.classifiers,
                        y: [],
                        type: 'bar'
                    }

                    switch (type) {
                        case 'train':   trace.name = 'Training Accuracy'
                                        break
                        case 'test':    trace.name = 'Testing Accuracy'
                                        break
                    }

                    _.forEach(classifiers, c => {
                        trace.y.push(this.accuracy[c][type] * 100)
                    })

                    data.push(trace)
                })

                Plotly.newPlot('performance', data, layout)
            },
            plotHeatmap(cm, type, key) {
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
                    case 'LR':  title = `Logistic Regression Confusion Matrix of ${type} Data`
                                break
                    case 'SVM': title = `Support Vector Machine Confusion Matrix of ${type} Data`
                                break
                    case 'MLP': title = `Multi-layer Perceptron Confusion Matrix of ${type} Data`
                                break
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
                                size: 24,
                                color: 'rgb(50, 171, 96)'
                            },
                            showarrow: false,
                            font: {
                                color: 'white'
                            }
                        }

                        layout.annotations.push(result)
                    }
                }

                // Add to the mainDiv
                let mainDiv = document.getElementById(`confusion-matrix-${key}`)
                let numOfChildren = mainDiv.children.length
                let id = `confusion-matrix-${key}-${numOfChildren}`

                $('<div>', {
                    id
                }).appendTo(mainDiv)

                Plotly.newPlot(id, data, layout)
            },
            createConfusionMatrices() {
                _.forEach(this.confusionMatrix, (value, key) => {
                    this.plotHeatmap(value.train, 'Training', key)
                    this.plotHeatmap(value.test, 'Testing', key)
                })
            },
            saveLocally(data) {
                const classifiers = ['LR', 'SVM', 'MLP']

                _.forEach(classifiers, classifier => {
                    this.confusionMatrix[classifier].train = data[classifier].cm_train
                    this.confusionMatrix[classifier].test = data[classifier].cm_test
                    this.accuracy[classifier].train = data[classifier].train_score
                    this.accuracy[classifier].test = data[classifier].test_score
                    this.size[classifier].train = data[classifier].train_size
                    this.size[classifier].test = data[classifier].test_size
                })

                this.plotBarGraph()
                this.createConfusionMatrices()
            },
            getExistingInformations() {
                this.retrievingExistingData = true

                const config = {
                    method: 'get',
                    baseURL: apiRoutes.classifierBaseURL,
                    url: '/existing-informations'
                }

                axios(config)
                    .then(response => {
                        this.saveLocally(response.data)
                        this.retrievingExistingData = false
                    })
                    .catch(error => {
                        throw new Error(error)
                    })
            },
            train() {
                this.training = true

                const config = {
                    method: 'post',
                    baseURL: apiRoutes.classifierBaseURL,
                    url: '/train',
                    data: {
                        classifier: this.classifier,
                        minDF: this.minDF,
                        dataSize: this.dataSize,
                        testDataSize: this.testDataSize/100
                    },
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }

                axios(config)
                    .then(response => {
                        this.saveLocally(response.data)
                        this.training = false
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
