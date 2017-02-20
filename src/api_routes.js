const rethinkdb_base_URL = 'http://localhost:5000/api/v1/rethinkdb'
const coursera_base_URL = 'http://localhost:5000/api/v1/coursera'

export default {
    coursera: {
        GET: {
            partners_location: coursera_base_URL + '/partners/location'
        }
    }
}
