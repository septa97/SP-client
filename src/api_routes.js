const courses_url = 'https://api.coursera.org/api/courses.v1'
const partners_url = 'https://api.coursera.org/api/partners.v1'
const instructors_url = 'https://api.coursera.org/api/instructors.v1'

export default {
    get_all_partners_and_location: `${partners_url}?fields=location`
}
