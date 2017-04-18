<template>
  <div>
    <div id="map" ref="map" class="layout-padding relative-position">
      <!-- Modal -->
      <q-modal ref="coursesModal" :content-css="{minWidth: '80vw', minHeight: '80vh'}">
        <q-layout>
          <div slot="header" class="toolbar">
            <button @click="$refs.coursesModal.close()">
              <i>keyboard_arrow_left</i>
            </button>
            <q-toolbar-title :padding="1">
              {{ currentInstitution }}
            </q-toolbar-title>
          </div>

          <div class="layout-view">
            <div class="layout-padding">
              <q-data-table :data="partnerCourses" :config="config" :columns="columns">
                <template slot="selection" scope="props">
                  <button class="primary clear" @click="goToCourse(props)">
                    Go To Course
                  </button>
                </template>
              </q-data-table>
            </div>
          </div>
        </q-layout>
      </q-modal>
    </div>
  </div>
</template>

<script>
  /* global google, MarkerClusterer */
  /* eslint no-undef: "error" */

  'use strict'

  import { Loading } from 'quasar'
  import apiRoutes from './../../apiRoutes'
  import router from './../../router'
  import axios from 'axios'
  import _ from 'lodash'

  export default {
    data () {
      return {
        config: {
          title: 'Courses Offered',
          refresh: true,
          columnPicker: true,
          bodyStyle: {
            maxHeight: '500px'
          },
          rowHeight: '50px',
          responsive: true,
          pagination: {
            rowsPerPage: 15,
            options: [5, 10, 15, 30, 50, 500]
          },
          selection: 'single',
          messages: {
            noData: '<i>warning</i> No data available to show.',
            noDataAfterFiltering: '<i>warning</i> No results. Please refine your search terms.'
          },
          labels: {
            columns: 'Columns',
            allCols: 'Every Columns',
            rows: 'Rows',
            selected: {
              singular: 'item selected.',
              plural: 'items selected.'
            },
            clear: 'clear',
            search: 'Search',
            all: 'All'
          }
        },
        columns: [
          {
            label: 'Course Name',
            field: 'name',
            filter: true,
            sort: true,
            width: '120px'
          },
          {
            label: 'Course Slug',
            field: 'slug',
            filter: true,
            sort: true,
            width: '120px'
          },
          {
            label: 'Course Type',
            field: 'courseType',
            filter: true,
            sort: true,
            width: '120px'
          }
        ],
        pagination: true,
        rowHeight: 50,
        bodyHeightProp: 'maxHeight',
        bodyHeight: 500,
        partnerCourses: [],
        currentInstitution: ''
      }
    },
    mounted () {
      this.initMap()
      this.getAllPartnersAndLocation()
    },
    methods: {
      goToCourse (props) {
        const slugs = _.map(props.rows, 'data.slug')
        router.push({ path: `/sentviz/course/${slugs[0]}`, exact: true })
      },
      initMap () {
        const mapOptions = {
          center: {
            lat: -34.397,
            lng: 150.644
          },
          zoom: 2,
          minZoom: 1
        }

        this.map = new google.maps.Map(document.getElementById('map'), mapOptions)
      },
      getAllPartnersAndLocation () {
        const config = {
          method: 'get',
          baseURL: apiRoutes.rethinkdbBaseURL,
          url: '/partners/location'
        }

        axios(config)
          .then(response => {
            let markers = _.map(response.data.elements, e => {
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
                  this.currentInstitution = marker.title

                  Loading.show({
                    delay: 100,
                    message: `Retrieving all the courses of ${this.currentInstitution}...`,
                    spinner: 'dots',
                    spinnerSize: 150
                  })

                  this.getAllPartnerCourses(marker.partnerId)
                })

                return marker
              }
            })

            /* eslint-disable no-new */
            new MarkerClusterer(this.map, markers, {
              imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
            })
          })
          .catch(error => {
            throw new Error(error)
          })
      },
      getAllPartnerCourses (partnerId) {
        const config = {
          method: 'get',
          baseURL: apiRoutes.courseraBaseURL,
          url: `/partner/${partnerId}/courses`
        }

        axios(config)
          .then(response => {
            this.partnerCourses = response.data.courses
            Loading.hide()
            this.$refs.coursesModal.open()
          })
          .catch(error => {
            throw new Error(error)
          })
      }
    }
  }
</script>

<style scoped>
  #map {
    width: 100%;
    height: 100%;
  }
</style>
