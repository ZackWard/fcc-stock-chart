<template>
    <div id="chart">
        <ul>
            <li v-for="stock in stocks">{{ stock.symbol }}</li>
        </ul>
        <svg id="chart-svg">
        </svg>
    </div>
</template>

<script>
    import * as d3 from "d3";

    let margin = {top: 20, right: 50, bottom: 20, left: 50},
        height = 400 - margin.top - margin.bottom,
        width = 900 - margin.left - margin.right;

    export default {
        computed: {
            stocks () {
                return this.$store.state.stocks;
            }
        },
        methods: {
            drawChart () {
                var svg = d3.select('#chart-svg')
                    .attr('width', (width + margin.left + margin.right) + 'px')
                    .attr('height', (height + margin.top + margin.bottom) + 'px');

                // Remove all elements in the SVG
                svg.selectAll('*').remove();

                var chart = svg.append('g').attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');
                
                var allPrices = [];
                var allTimes = [];
                this.stocks.forEach(stock => {
                    stock.quotes.forEach(quote => {
                        allPrices.push(quote.price);
                        allTimes.push(quote.time);
                    });
                });

                var x = d3.scaleTime().domain(d3.extent(allTimes)).range([0, width]);
                var y = d3.scaleLinear().domain(d3.extent(allPrices)).range([height, 0]);
                var z = d3.scaleOrdinal(d3.schemeCategory10).domain(this.stocks, d => d.symbol);
                var lineGenerator = d3.line().x(d => x(d.time)).y(d => y(d.price));
                var t = d3.transition().duration(750).ease(d3.easeLinear);

                chart.append('g').attr('class', 'axis axis-x').attr('transform', 'translate(0, ' + height + ')').call(d3.axisBottom(x));
                let yAxis = chart.append('g').attr('class', 'axis axis-y').call(d3.axisLeft(y));
                yAxis.append("text").attr("transform", "rotate(-90)").attr("y", 6).attr("dy", "0.71em").attr("fill", "#000").text("Price, USD");

                var stock = chart.selectAll('.stock').data(this.stocks).enter().append('g').attr('class', 'stock');
                stock.append('path').attr('class', 'line').attr('d', d => lineGenerator(d.quotes)).style('stroke', d => z(d.symbol)).style('fill', 'none');
            }
        },
        mounted: function () {
            console.log("Chart mounted!");
            this.drawChart();
        },
        updated: function () {
            this.drawChart();
        }
    };
</script>

<style>
</style>