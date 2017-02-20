<template>
    <div id="map">
    </div>
</template>

<script>
    import api_routes from './../api_routes'
    import axios from 'axios'

    let map_options = {
        center: {
            lat: -34.397,
            lng: 150.644
        },
        zoom: 2
    }

    export default {
        data() {
            return {}
        },
        mounted() {
            this.initMap()
            this.get_all_partners_and_location()
        },
        methods: {
            initMap() {
                this.map = new google.maps.Map(document.getElementById('map'), map_options)
            },
            get_all_partners_and_location() {
                axios.get(api_routes.coursera.GET.partners_location)
                    .then(response => {
                        response.data.elements.forEach(e => {
                            if (e.location.latitude && e.location.longitude) {
                                new google.maps.Marker({
                                    map: this.map,
                                    title: e.name,
                                    position: {
                                        lat: e.location.latitude,
                                        lng: e.location.longitude
                                    },
                                    animation: google.maps.Animation.DROP
                                })
                            }
                        })
                    })
                    .catch(error => {
                        console.log(error)
                    })
            }
        }
    }
</script>

<style scoped>
    #map {
        width: 1000px;
        height: 500px;
    }
</style>
