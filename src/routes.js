import GMapsView         from './components/GMaps.vue'
import PreprocessorView  from './components/Preprocessor.vue'
import TrainerView       from './components/Trainer.vue'
import VisualizerView    from './components/Visualizer.vue'
import CourseView        from './components/Course.vue'
import tSNEView          from './components/tSNE.vue'

export default [
    { path: '/gmaps',           component: GMapsView },
    { path: '/trainer',         component: TrainerView },
    { path: '/preprocessor',    component: PreprocessorView },
    { path: '/visualizer',      component: VisualizerView },
    { path: '/course/:slug',    component: CourseView },
    { path: '/tSNE',            component: tSNEView }
]
