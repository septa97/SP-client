<template>
    <div>
        <div class="navbar-fixed">
            <nav class="green" role="navigation">
                <div class="nav-wrapper container">
                    <router-link to="/" class="brand-logo">Logo</router-link>
                    <ul id="nav-mobile" class="right hide-on-med-and-down">
                        <li><router-link to="/gmaps">Map</router-link></li>
                        <li><router-link to="/visualizer">Visualizer</router-link></li>
                    </ul>
                </div>
            </nav>
        </div>
        <div class="section no-pad-bot">
            <div class="container">
                <router-view></router-view>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        data() {
            return {}
        }
    }
</script>
