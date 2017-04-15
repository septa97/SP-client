<template>
  <q-layout>
    <div slot="header" class="toolbar">
      <!-- opens drawer below -->
      <router-link to="/">
        <button class="primary circular">
          <i>home</i>
        </button>
      </router-link>
      <button class="hide-on-drawer-visible" @click="$refs.drawer.open()">
        <i>menu</i>
      </button>

      <q-toolbar-title :padding="1">
        SentViz
      </q-toolbar-title>

      <button @click="$refs.domainTypesModal.open()">
        <i class="on-left">settings</i>Filter Courses by Domain Types
      </button>

      <button @click="$refs.coursesModal.open()">
        <i class="on-left">search</i>Search a Course
      </button>
    </div>

    <!-- Drawer -->
    <q-drawer ref="drawer">
      <div class="toolbar">
        <q-toolbar-title>
          Links
        </q-toolbar-title>
      </div>

      <div class="list no-border platform-delimiter">
        <q-drawer-link icon="place" to="/sentviz/gmaps" exact>
          GMaps
        </q-drawer-link>
      </div>
    </q-drawer>

    <router-view class="layout-view"></router-view>

    <!-- Courses Modal -->
    <q-modal ref="coursesModal" :content-css="{minWidth: '80vw', minHeight: '80vh'}">
      <q-layout>
        <div slot="header" class="toolbar">
          <button @click="$refs.coursesModal.close()">
            <i>keyboard_arrow_left</i>
          </button>
          <q-toolbar-title :padding="1">
            Choose a Course
          </q-toolbar-title>
        </div>

        <div class="layout-view">
          <div class="layout-padding">
            <q-data-table :data="courses" :config="config" :columns="columns">
              <template slot="selection" scope="props">
                <button class="primary clear" @click="goToCourse(props)">
                  <i>send</i>
                </button>
              </template>
            </q-data-table>
          </div>
        </div>
      </q-layout>
    </q-modal>

    <!-- Domain Types Modal -->
    <q-modal ref="domainTypesModal" :content-css="{minWidth: '80vw', minHeight: '80vh'}">
      <q-layout>
        <div slot="header" class="toolbar">
          <button @click="$refs.domainTypesModal.close()">
            <i>keyboard_arrow_left</i>
          </button>
          <q-toolbar-title :padding="1">
            Select Domain Types (Domain Id and/or Subdomain Id)
          </q-toolbar-title>
        </div>

        <div class="layout-view">
          <div class="layout-padding">
            <q-dialog-select type="radio" v-model="domainId" :options="domainIds" ok-label="Ok" cancel-label="Cancel" title="Choose the Domain Id">
            </q-dialog-select>
            <q-dialog-select type="radio" v-model="subdomainId" :options="subdomainIds" ok-label="Ok" cancel-label="Cancel" title="Choose the Subdomain Id">
            </q-dialog-select>
            <button class="primary clear" @click="goToDomainTypes">
              <i>send</i>
            </button>
          </div>
        </div>
      </q-layout>
    </q-modal>

    <!-- Footer -->
    <div slot="footer" class="toolbar"></div>
  </q-layout>
</template>

<script>
  'use strict'

  import apiRoutes from './../../apiRoutes'
  import router from './../../router'
  import axios from 'axios'
  import _ from 'lodash'

  export default {
    data () {
      return {
        config: {
          title: 'Courses',
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
        courses: [],
        domainId: '',
        subdomainId: '',
        domainIds: [],
        subdomainIds: []
      }
    },
    mounted () {
      this.getAllCoursesDomainTypes()
      this.getAllCourses()
    },
    methods: {
      goToCourse (props) {
        const slugs = _.map(props.rows, 'data.slug')
        router.push({ path: `/sentviz/course/${slugs[0]}`, exact: true })
      },
      goToDomainTypes () {
        router.push({ path: `/sentviz/domain-types/${this.domainId}/${this.subdomainId}`, exact: true })
      },
      getAllCoursesDomainTypes () {
        const config = {
          method: 'get',
          baseURL: apiRoutes.rethinkdbBaseURL,
          url: '/courses/domain_types'
        }

        axios(config)
          .then(response => {
            this.domainIds = _.map(response.data.domainIds, e => {
              return {
                label: _.map(e.split('-'), v => v[0].toUpperCase() + v.slice(1)).join(' '),
                value: e
              }
            })

            this.subdomainIds = _.map(response.data.subdomainIds, e => {
              return {
                label: _.map(e.split('-'), v => v[0].toUpperCase() + v.slice(1)).join(' '),
                value: e
              }
            })

            this.domainId = this.domainIds[0].value
            this.subdomainId = this.subdomainIds[0].value
          })
          .catch(error => {
            throw new Error(error)
          })
      },
      getAllCourses () {
        const config = {
          method: 'get',
          baseURL: apiRoutes.rethinkdbBaseURL,
          url: '/courses'
        }

        axios(config)
          .then(response => {
            this.courses = response.data.courses
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
