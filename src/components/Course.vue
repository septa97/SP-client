<template>
    <div id="main">
        <h5>Overall</h5>
        <div class="row">
            <div class="progress" v-if="overall">
                <div class="indeterminate"></div>
            </div>
        </div>
        <div id="overall">
        </div>
        <h5>Positive</h5>
        <div class="row">
            <div class="progress" v-if="positive">
                <div class="indeterminate"></div>
            </div>
        </div>
        <div id="positive">
        </div>
        <h5>Negative</h5>
        <div class="row">
            <div class="progress" v-if="negative">
                <div class="indeterminate"></div>
            </div>
        </div>
        <div id="negative">
        </div>
        <h5>Neutral</h5>
        <div class="row">
            <div class="progress" v-if="neutral">
                <div class="indeterminate"></div>
            </div>
        </div>
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
                courseSlug: this.$route.params.slug,
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
                                        size: 20 + (10 * Math.log(v))
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
                }
            },
            getAllCourseReviewPreprocessedWords() {
                let types = ['overall', 'positive', 'negative', 'neutral']

                _.forEach(types, type => {
                    const config = {
                        method: 'get',
                        baseURL: apiRoutes.rethinkdbBaseURL,
                        url: `/course/${this.courseSlug}/reviews/preprocessed-words/${type}`
                    }

                    axios(config)
                        .then(response => {
                            this.wordMapping[type] = response.data.word_mapping
                            console.log(response.data.max)
                            this[type] = false

                            if (_.isEmpty(this.wordMapping[type])) {
                                let template =
                                `
                                <p>
                                There are no reviews for with this type of sentiment in this course.
                                </p>
                                `

                                $(`#${type}`).append(template)

                                return
                            }

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
