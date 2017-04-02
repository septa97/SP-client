<template>
    <div id="main">
    </div>
</template>

<script>
    import apiRoutes from './../apiRoutes'
    import axios from 'axios'

    export default {
        data() {
            return {
                loadingCourses: false,
                infoWindow: '',
                partnerCourses: []
            }
        },
        mounted() {
            $(document).ready(function(){
                $('.modal').modal();
            })
            this.initMap()
            this.getAllPartnersAndLocation()
        },
        methods: {
            initMap() {
                let mapOptions = {
                    center: {
                        lat: -34.397,
                        lng: 150.644
                    },
                    zoom: 2,
                    minZoom: 2
                }

                this.map = new google.maps.Map(document.getElementById('main'), mapOptions)
            },
            getAllPartnersAndLocation() {
                const config = {
                    method: 'get',
                    baseURL: apiRoutes.rethinkdbBaseURL,
                    url: '/partners/location'
                }

                axios(config)
                    .then(response => {
                        let markers = response.data.elements.map((e, i) => {
                            if (e.location.latitude && e.location.longitude) {
                                let marker = new google.maps.Marker({
                                    map: this.map,
                                    title: e.name,
                                    position: {
                                        lat: e.location.latitude,
                                        lng: e.location.longitude
                                    },
                                    animation: google.maps.Animation.DROP,
                                    partnerId: e.id
                                })

                                // Add click listener to the markers
                                marker.addListener('click', () => {
                                    this.loadingCourses = true
                                    const template =
                                    `
                                    <div id="info-window" style="width: 400px; height: 250px;">
                                        <h5>${e.name}</h5>
                                        <h6>Courses</h6>
                                    </div>
                                    `

                                    let infoWindow = new google.maps.InfoWindow({
                                        content: template
                                    })

                                    infoWindow.open(this.map, marker)
                                    this.getAllPartnerCourses(marker.partnerId)
                                })

                                return marker
                            }
                        })

                        let markerCluster = new MarkerClusterer(this.map, markers,
                            {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'})
                    })
                    .catch(error => {
                        throw new Error(error)
                    })
            },
            getAllPartnerCourses(partnerId) {
                const config = {
                    method: 'get',
                    baseURL: apiRoutes.courseraBaseURL,
                    url: `/partner/${partnerId}/courses`
                }

                axios(config)
                    .then(response => {
                        this.partnerCourses = response.data.courses

                        let template = '<ul class="collection">'

                        this.partnerCourses.forEach(e => {
                            template += `<a href="#/course/${e.slug}" id="e.slug" class="collection-item">${e.name}</a>`
                        })

                        template += '</ul>'

                        $('#info-window').append(template)
                        this.loadingCourses = false
                    })
                    .catch(error => {
                        throw new Error(error)
                    })
            },
        }
    }
</script>

<style scoped>
    #main {
        width: 1000px;
        height: 500px;
    }
</style>
