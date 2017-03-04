<template>
    <div id="stock-app">
        <chart></chart>
        <template v-if="loading">
            <div id="loading-screen">
                <div class="spinner"></div>
            </div>
        </template>
    </div>
</template>

<script>
    import Chart from "./Chart.vue";

    export default {
        components: {
            'chart': Chart
        },
        computed: {
            stocks: function () {
                return this.$store.state.stocks;
            },
            loading: function () {
                return this.$store.state.loading;
            }
        }
    };
</script>

<style>
</style>