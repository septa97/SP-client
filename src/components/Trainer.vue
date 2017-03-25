<template>
    <div id="trainer">
        <!-- Modal Structure -->
        <div id="confirmModal" class="modal">
            <div class="modal-content">
                <h4>{{ message }}</h4>
            </div>
            <div class="modal-footer">
                <button class="btn-flat modal-action modal-close waves-effect waves-green">Ok</button>
            </div>
        </div>

        <div class="input-field col s12">
            <select v-model="classifier">
                <option v-for="option in options" :value="option.value">
                    {{ option.text }}
                </option>
            </select>
            <label>Supervised Classifier</label>
            <span>Classifier: {{ classifier }}</span>
        </div>

        <div class="row">
            <div class="input-field col s6">
                <input id="data-size" type="text" v-model.trim.number="dataSize">
                <label for="data-size">Data Size</label>
            </div>
            <div class="input-field col s6">
                <input id="test-data-size" type="text" v-model.trim.number="testDataSize">
                <label for="test-data-size">Test Data Size [0.1 - 0.9]</label>
            </div>
        </div>

        <div class="row">
            <div class="input-field col s6">
                <button class="btn waves-effect waves-light" type="submit" @click="train">
                    Train
                </button>
            </div>
        </div>

        <div class="progress" v-if="training">
            <div class="indeterminate"></div>
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
                dataSize: '',
                testDataSize: '',
                message: '',
                classifier: 'LR',
                training: false,
                numOfTrainings: 0,
                // trainingScore: undefined,
                // testScore: undefined,
                options: [
                    { text: 'Logistic Regression', value: 'LR' },
                    { text: 'Support Vector Machine', value: 'SVM' },
                    { text: 'Multi-layer Perceptron (Artifial Neural Network)', value: 'MLP' }
                ]
            }
        },
        mounted() {
            $(document).ready(function() {
                $('select').material_select()
                $('.modal').modal()
            })
        },
        methods: {
            train() {
                this.training = true

                let url
                switch (this.classifier) {
                    case 'LR':  url = '/logistic-regression'
                                break
                    case 'SVM': url = '/support-vector-machine'
                                break
                    case 'MLP': url = '/multi-layer-perceptron'
                                break
                }

                const config = {
                    method: 'post',
                    baseURL: apiRoutes.classifierBaseURL,
                    url,
                    data: {
                        dataSize: this.dataSize,
                        testDataSize: this.testDataSize
                    },
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }

                axios(config)
                    .then(response => {
                        this.training = false
                        this.numOfTrainings++
                        this.message = response.data.message
                        $('#confirmModal').modal('open')
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
