<template>
    <div id="visualizer">
        <div class="input-field col s12">
            <select>
                <option value="" disabled selected>Choose your Supervised Classifier</option>
                <option value="LR">Logistic Regression</option>
                <option value="SVM">Support Vector Machine</option>
                <option value="MLP">Multi-layer Perceptron (Artifial Neural Network)</option>
            </select>
            <label>Supervised Classifier</label>
        </div>

        <div class="row">
            <div class="input-field col s6">
                <button class="btn waves-effect waves-light" type="submit" @click="getAllLRInformations">
                    Visualize
                </button>
            </div>
        </div>

        <div id="charts">
        </div>
    </div>
</template>

<script>
    'use strict'

    import apiRoutes from './../apiRoutes'
    import axios from 'axios'

    export default {
        data() {
            return {}
        },
        mounted() {
            $(document).ready(function() {
                $('select').material_select()
            })
        },
        methods: {
            createDivTemplate(trainingScore, testScore) {
                const template =
                `<div>
                    <p>Training Score: ${trainingScore}</p>
                    <p>Test Score: ${testScore}</p>
                </div>`

                $('#charts').append(template)
            },
            getAllLRInformations() {
                $('#charts').empty()

                const config = {
                    method: 'get',
                    baseURL: apiRoutes.visualizerBaseURL,
                    url: '/LR-visualization-info'
                }

                axios(config)
                    .then(response => {
                        response.data.informations.forEach(e => {
                            $('#charts').append(e.div)
                            eval(e.script)
                            createDivTemplate(e.trainingScore, e.testScore)
                        })
                    })
                    .catch(error => {
                        throw new Error(error)
                    })
            }
        }
    }

    /*function loadCoursesCharts(data) {
        let courses = crossfilter(data)
        let all = courses.groupAll()

        let primaryLanguagesChart = dc.pieChart('#primaryLanguagesChart')
        let primaryLanguagesDimension = courses.dimension(function(d) { return d.primaryLanguages[0] })
        let primaryLanguagesGroup = primaryLanguagesDimension.group().reduceCount()

        primaryLanguagesChart
            .width(400)
            .height(400)
            .radius(200)
            .dimension(primaryLanguagesDimension)
            .group(primaryLanguagesGroup)
            // .innerRadius(40)
            .transitionDuration(500)
            .label(function(d) {
                if (primaryLanguagesChart.hasFilter() && !primaryLanguagesChart.hasFilter(d.key)) {
                    return `${d.key}(0%)`
                }

                var label = d.key
                if (all.value()) {
                    label += '(' + Math.floor(d.value/all.value() * 100) + '%)'
                }
                return label
            })

        let subtitleLanguagesChart = dc.pieChart('#subtitleLanguagesChart')
        let subtitleLanguagesDimension = courses.dimension(function(d) { return d.subtitleLanguages[0] })
        let subtitleLanguagesGroup = subtitleLanguagesDimension.group().reduceCount()

        subtitleLanguagesChart
            .width(400)
            .height(400)
            .radius(200)
            .dimension(subtitleLanguagesDimension)
            .group(subtitleLanguagesGroup)
            // .innerRadius(40)
            .transitionDuration(500)

        dc.renderAll()
    }*/
</script>

<style scoped>
</style>
