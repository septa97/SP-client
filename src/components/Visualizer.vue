<template>
    <div id="visualizer">
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
    import _ from 'lodash'

    export default {
        data() {
            return {
                PCA2D: false,
                PCA3D: false,
                tSNE2D: false,
                tSNE3D: false
            }
        },
        mounted() {
            this.getAllInformations()
        },
        methods: {
            getAllInformations() {
                const urls = ['/PCA/2', '/PCA/3', '/tSNE/2', '/tSNE/3']

                _.forEach(urls, url => {
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
                                case '/PCA/2':  div = 'PCA-2D'
                                                this.PCA2D = true
                                                break
                                case '/PCA/3':  div = 'PCA-3D'
                                                this.PCA3D = true
                                                break
                                case '/tSNE/2': div = 'tSNE-2D'
                                                this.tSNE2D = true
                                                break
                                case '/tSNE/3': div = 'tSNE-3D'
                                                this.tSNE3D = true
                                                break
                            }

                            Plotly.newPlot(div, data)
                        })
                        .catch(error => {
                            throw new Error(error)
                        })
                })
            }
        }
    }
</script>

<style scoped>
</style>
