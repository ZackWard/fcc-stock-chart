<template>
    <div id="stock-app">
        <p>Vue.js!</p>
        <p>{{ globalMessage }}</p>
        <p>Counter: {{ counter }}</p>
        <chart></chart>
    </div>
</template>

<script>
    import Chart from "./Chart.vue";

    export default {
        components: {
            'chart': Chart
        },
        computed: {
            globalMessage () {
                return this.$store.state.message;
            },
            counter () {
                return this.$store.getters.numberOfStocks;
            }
        }
    };
</script>

<style>
    #stock-app {
        width: 80%;
        margin: 20px auto 0px auto;
    }
</style>