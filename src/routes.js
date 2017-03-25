import GMapsView        from './components/GMaps.vue'
import TrainerView      from './components/Trainer.vue'
import VisualizerView   from './components/Visualizer.vue'
import CourseView       from './components/Course.vue'

export default [
    { path: '/gmaps', component: GMapsView },
    { path: '/trainer', component: TrainerView },
    { path: '/visualizer', component: VisualizerView },
    { path: '/course/:id', component: CourseView }
]
