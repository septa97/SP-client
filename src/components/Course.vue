<template>
    <div id="course">
        <h5>Overall</h5>
        <div id="overall">
        </div>
        <h5>Positive</h5>
        <div id="positive">
        </div>
        <h5>Negative</h5>
        <div id="negative">
        </div>
        <h5>Neutral</h5>
        <div id="neutral">
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
                words: {
                    overall: [],
                    positive: [],
                    negative: [],
                    neutral: []
                },
                wordMapping: {
                    overall: {},
                    positive: {},
                    negative: {},
                    neutral: {}
                },
                overall: true,
                positive: true,
                negative: true,
                neutral: true
            }
        },
        mounted() {
            this.getAllCourseReviewPreprocessedWords()
        },
        methods: {
            drawWordCloud(type) {
                let fill = d3.scale.category20()
                let layout = d3Cloud()
                                .size([600, 400])
                                .words(_.map(this.wordMapping[type], (v, k) => {
                                    return {
                                        text: k,
                                        size: 10 + (10 * v)
                                    }
                                }))
                                .padding(5)
                                .rotate(() => _.random(-60, 60))
                                .font('Impact')
                                .fontSize(d => d.size)
                                .on('end', draw)

                layout.start()

                function draw(words) {
                    let [width, height] = layout.size()

                    d3.select(`#${type}`)
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

                    this[type] = false
                }
            },
            getAllCourseReviewPreprocessedWords() {
                let types = ['overall', 'positive', 'negative', 'neutral']

                _.each(types, type => {
                    const config = {
                        method: 'get',
                        baseURL: apiRoutes.rethinkdbBaseURL,
                        url: `/course/${this.courseId}/reviews/preprocessed-words/${type}`
                    }

                    axios(config)
                        .then(response => {
                            this.words[type] = response.data.words

                            if (!this.words[type].length) {
                                let template =
                                `
                                <p>
                                There are no reviews for this course. :(
                                </p>
                                `

                                $('#${type}').append(template)

                                return
                            }

                            this.wordMapping[type] = _.countBy(this.words[type], _.identity)
                            this.drawWordCloud(type)
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
