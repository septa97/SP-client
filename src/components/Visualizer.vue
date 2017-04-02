<template>
    <div id="main">
        <div id="options">
            <div class="row">
                <div class="input-field col s6">
                    <input id="data-size" type="text" v-model.trim.number="dataSize">
                    <label for="data-size">Data Size</label>
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
                <div class="input-field col s6">
                    <button class="btn waves-effect waves-light" type="submit" @click="getAllInformations">
                        Visualize
                    </button>
                </div>
            </div>

            <div class="row">
                <div class="progress" v-if="retrievingData">
                    <div class="indeterminate"></div>
                </div>
            </div>
        </div>

        <div id="charts">
            <h5 v-show="PCA2D">Principal Component Analysis (2D)</h5>
            <div id="PCA-2D">
            </div>

            <h5 v-show="PCA3D">Principal Component Analysis (3D)</h5>
            <div id="PCA-3D">
            </div>

            <h5 v-show="tSNE2D">t-distributed Stochastic Neighbor Embedding (2D)</h5>
            <div id="tSNE-2D">
            </div>

            <h5 v-show="tSNE3D">t-distributed Stochastic Neighbor Embedding (3D)</h5>
            <div id="tSNE-3D">
            </div>
        </div>
    </div>
</template>

<script>
    'use strict'

    import apiRoutes from './../apiRoutes'
    import axios from 'axios'
    import async from 'async'
    import _ from 'lodash'

    export default {
        data() {
            return {
                dataSize: 1000,
                minDF: 5,
                PCA2D: false,
                PCA3D: false,
                tSNE2D: false,
                tSNE3D: false,
                retrievingData: false
            }
        },
        mounted() {
        },
        methods: {
            getAllInformations() {
                this.retrievingData = true

                const urls = [`/PCA/${this.minDF}/${this.dataSize}/2`, `/PCA/${this.minDF}/${this.dataSize}/3`, `/tSNE/${this.minDF}/${this.dataSize}/2`, `/tSNE/${this.minDF}/${this.dataSize}/3`]

                async.each(urls, (url, callback) => {
                    const config = {
                        method: 'get',
                        baseURL: apiRoutes.dimensionalityReductionBaseURL,
                        url
                    }

                    axios(config)
                        .then(response => {
                            const types = ['positive', 'negative', 'neutral']
                            let data = []

                            _.forEach(types, type => {
                                let trace = {}

                                trace.x = response.data[type].X
                                trace.y = response.data[type].y
                                trace.text = response.data[type].reviews

                                if (url[url.length-1] === '3') {
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
                                case `/PCA/${this.minDF}/${this.dataSize}/2`:   div = 'PCA-2D'
                                                                                this.PCA2D = true
                                                                                break
                                case `/PCA/${this.minDF}/${this.dataSize}/3`:   div = 'PCA-3D'
                                                                                this.PCA3D = true
                                                                                break
                                case `/tSNE/${this.minDF}/${this.dataSize}/2`:  div = 'tSNE-2D'
                                                                                this.tSNE2D = true
                                                                                break
                                case `/tSNE/${this.minDF}/${this.dataSize}/3`:  div = 'tSNE-3D'
                                                                                this.tSNE3D = true
                                                                                break
                            }

                            Plotly.newPlot(div, data)
                            callback()
                        })
                        .catch(error => {
                            callback(error)
                        })
                }, error => {
                    if (error) {
                        throw new Error(error)
                    }

                    this.retrievingData = false
                })
            }
        }
    }
</script>

<style scoped>
</style>
