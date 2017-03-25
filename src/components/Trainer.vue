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
            <h6>Test Data Size: {{ testDataSize }}</h6>
            <div class="input-field col s12">
                <p id="test-data-size" class="range-field">
                    <input type="range" min="10" max="90" v-model.trim.number="testDataSize" >
                </p>
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
                testDataSize: '20',
                message: '',
                classifier: 'LR',
                training: false,
                numOfTrainings: 0,
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

                const config = {
                    method: 'post',
                    baseURL: apiRoutes.classifierBaseURL,
                    url: '/train',
                    data: {
                        classifier: this.classifier,
                        dataSize: this.dataSize/100,
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
