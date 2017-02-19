<template>
    <div id="map">
    </div>
</template>

<script>
    let map_options = {
        center: {
            lat: -34.397,
            lng: 150.644
        },
        zoom: 1
    }

    export default {
        data () {
            return {}
        },
        mounted () {
            this.initMap()
        },
        methods: {
            initMap () {
                this.map = new google.maps.Map(document.getElementById('map'), map_options);
            }
        }
    }
</script>

<style scoped>
    #map {
        width: 500px;
        height: 500px;
    }
</style>
