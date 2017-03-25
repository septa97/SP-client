<template>
    <div id="course">
        <div id="overall">
            <h5>Overall</h5>
        </div>
        <div id="positive">
            <h5>Positive</h5>
        </div>
        <div id="negative">
            <h5>Negative</h5>
        </div>
        <div id="neutral">
            <h5>Neutral</h5>
        </div>
    </div>
</template>

<script>
    'use strict'

    import apiRoutes from './../apiRoutes'
    import axios from 'axios'
    import d3Cloud from 'd3-cloud'
    import _ from 'lodash'

    export default {
        data() {
            return {
                courseId: this.$route.params.id,
                words: [],
                width: 600,
                height: 600
            }
        },
        mounted() {
            this.getAllCourseReviewPreprocessedWordsOverall()
            this.getAllCourseReviewPreprocessedWordsPositive()
            this.getAllCourseReviewPreprocessedWordsNegative()
            this.getAllCourseReviewPreprocessedWordsNeutral()
        },
        methods: {
            getAllCourseReviewPreprocessedWordsOverall() {
                const config = {
                    method: 'get',
                    baseURL: apiRoutes.rethinkdbBaseURL,
                    url: `/course/${this.courseId}/reviews/preprocessed-words/overall`
                }

                axios(config)
                    .then(response => {
                        this.words = response.data.words

                        let wordMapping = _.countBy(this.words, _.identity)
                        let fill = d3.scale.category20()
                        let layout = d3Cloud()
                                        .size([900, 600])
                                        .words(_.map(wordMapping, (v, k) => {
                                            return {
                                                text: k,
                                                size: 10 + (10 * v)
                                            }
                                        }))
                                        .padding(5)
                                        .rotate(() => ~~(Math.random() * 2) * 90)
                                        .font('Impact')
                                        .fontSize(d => d.size)
                                        .on('end', draw)

                        layout.start()

                        function draw(words) {
                            let [width, height] = layout.size()

                            d3.select('#overall')
                                .append('svg')
                                    .attr('width', width)
                                    .attr('height', height)
                                .append('g')
                                    .attr('transform', `translate(${width/2},${height/2})`)
                                .selectAll('text')
                                    .data(words)
                                .enter().append('text')
                                    .style('font-size', d => d.size + 'px')
                                    .style('font-family', 'Impact')
                                    .style('fill', (d, i) => fill(i))
                                    .attr('text-anchor', 'middle')
                                    .attr('transform', d => `translate(${[d.x, d.y]})rotate(${d.rotate})`)
                                    .text(d => d.text)
                        }
                    })
                    .catch(error => {
                        throw new Error(error)
                    })
            },
            getAllCourseReviewPreprocessedWordsPositive() {
                const config = {
                    method: 'get',
                    baseURL: apiRoutes.rethinkdbBaseURL,
                    url: `/course/${this.courseId}/reviews/preprocessed-words/positive`
                }

                axios(config)
                    .then(response => {
                        this.words = response.data.words

                        let wordMapping = _.countBy(this.words, _.identity)
                        let fill = d3.scale.category20()
                        let layout = d3Cloud()
                                        .size([900, 600])
                                        .words(_.map(wordMapping, (v, k) => {
                                            return {
                                                text: k,
                                                size: 10 + (10 * v)
                                            }
                                        }))
                                        .padding(5)
                                        .rotate(() => ~~(Math.random() * 2) * 90)
                                        .font('Impact')
                                        .fontSize(d => d.size)
                                        .on('end', draw)

                        layout.start()

                        function draw(words) {
                            let [width, height] = layout.size()

                            d3.select('#positive')
                                .append('svg')
                                    .attr('width', width)
                                    .attr('height', height)
                                .append('g')
                                    .attr('transform', `translate(${width/2},${height/2})`)
                                .selectAll('text')
                                    .data(words)
                                .enter().append('text')
                                    .style('font-size', d => d.size + 'px')
                                    .style('font-family', 'Impact')
                                    .style('fill', (d, i) => fill(i))
                                    .attr('text-anchor', 'middle')
                                    .attr('transform', d => `translate(${[d.x, d.y]})rotate(${d.rotate})`)
                                    .text(d => d.text)
                        }
                    })
                    .catch(error => {
                        throw new Error(error)
                    })
            },
            getAllCourseReviewPreprocessedWordsNegative() {
                const config = {
                    method: 'get',
                    baseURL: apiRoutes.rethinkdbBaseURL,
                    url: `/course/${this.courseId}/reviews/preprocessed-words/negative`
                }

                axios(config)
                    .then(response => {
                        this.words = response.data.words

                        let wordMapping = _.countBy(this.words, _.identity)
                        let fill = d3.scale.category20()
                        let layout = d3Cloud()
                                        .size([900, 600])
                                        .words(_.map(wordMapping, (v, k) => {
                                            return {
                                                text: k,
                                                size: 10 + (10 * v)
                                            }
                                        }))
                                        .padding(5)
                                        .rotate(() => ~~(Math.random() * 2) * 90)
                                        .font('Impact')
                                        .fontSize(d => d.size)
                                        .on('end', draw)

                        layout.start()

                        function draw(words) {
                            let [width, height] = layout.size()

                            d3.select('#negative')
                                .append('svg')
                                    .attr('width', width)
                                    .attr('height', height)
                                .append('g')
                                    .attr('transform', `translate(${width/2},${height/2})`)
                                .selectAll('text')
                                    .data(words)
                                .enter().append('text')
                                    .style('font-size', d => d.size + 'px')
                                    .style('font-family', 'Impact')
                                    .style('fill', (d, i) => fill(i))
                                    .attr('text-anchor', 'middle')
                                    .attr('transform', d => `translate(${[d.x, d.y]})rotate(${d.rotate})`)
                                    .text(d => d.text)
                        }
                    })
                    .catch(error => {
                        throw new Error(error)
                    })
            },
            getAllCourseReviewPreprocessedWordsNeutral() {
                const config = {
                    method: 'get',
                    baseURL: apiRoutes.rethinkdbBaseURL,
                    url: `/course/${this.courseId}/reviews/preprocessed-words/neutral`
                }

                axios(config)
                    .then(response => {
                        this.words = response.data.words

                        let wordMapping = _.countBy(this.words, _.identity)
                        let fill = d3.scale.category20()
                        let layout = d3Cloud()
                                        .size([900, 600])
                                        .words(_.map(wordMapping, (v, k) => {
                                            return {
                                                text: k,
                                                size: 10 + (10 * v)
                                            }
                                        }))
                                        .padding(5)
                                        .rotate(() => ~~(Math.random() * 2) * 90)
                                        .font('Impact')
                                        .fontSize(d => d.size)
                                        .on('end', draw)

                        layout.start()

                        function draw(words) {
                            let [width, height] = layout.size()

                            d3.select('#neutral')
                                .append('svg')
                                    .attr('width', width)
                                    .attr('height', height)
                                .append('g')
                                    .attr('transform', `translate(${width/2},${height/2})`)
                                .selectAll('text')
                                    .data(words)
                                .enter().append('text')
                                    .style('font-size', d => d.size + 'px')
                                    .style('font-family', 'Impact')
                                    .style('fill', (d, i) => fill(i))
                                    .attr('text-anchor', 'middle')
                                    .attr('transform', d => `translate(${[d.x, d.y]})rotate(${d.rotate})`)
                                    .text(d => d.text)
                        }
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
