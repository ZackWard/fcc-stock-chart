<template>
    <div id="chart">
        <div class="mdc-card">
            <section class="mdc-card__primary">
                <h1 class="mdc-card__title mdc-card__title--large">freeCodeCamp Stock Chart</h1>
                <h2 class="mdc-card__subtitle">Stocks: {{ stockSymbols }}</h2>
            </section>
            <section class="mdc-card__supporting-text">
                <svg id="chart-svg" viewBox="0 0 900 400" preserveAspectRatio="none meet">
                </svg>
            </section>
        </div>
        <div class="mdc-card">
            <section class="mdc-card__primary">
                <h1 class="mdc-card__title mdc-card__title--large">Add / Filter / Remove Stocks</h1>
                <h2 class="mdc-card__subtitle">(updates across clients in realtime)</h2>
            </section>
            <section class="mdc-card__supporting-text">
                <div id="stock-tools">
                    
                    <div id="add-stock">
                        <div class="mdc-textfield">
                            <input type="text" id="add-symbol-input" class="mdc-textfield__input" v-model="stockSymbolInput">
                            <label class="mdc-textfield__label" id="add-symbol-label" for="add-symbol-input">Add stock symbol</label>
                        </div>
                        <button type="button" class="mdc-button mdc-button--raised mdc-button--primary" @click="addStock(stockSymbolInput)">Add Stock</button>
                        <br>
                        <div id="filter-control">
                            <h5>Filter Chart:</h5>
                            <button type="button" class="mdc-button mdc-button--raised" @click.prevent="filterStocks(1)">1 Month</button>
                            <button type="button" class="mdc-button mdc-button--raised" @click.prevent="filterStocks(3)">3 Months</button>
                            <button type="button" class="mdc-button mdc-button--raised" @click.prevent="filterStocks(6)">6 Months</button>
                            <button type="button" class="mdc-button mdc-button--raised" @click.prevent="filterStocks(12)">1 Year</button>
                            <button type="button" class="mdc-button mdc-button--raised" @click.prevent="filterStocks(0)">All</button>
                        </div>
                    </div>
                    
                    <div id="stock-list">
                        <h2 v-if="stocks.length == 0">You can remove stocks from the chart here, after they've been added</h2>
                        <h5 v-else>Remove stock from chart:</h5>
                        <template v-for="stock in stocks">
                            <button type="button" class="mdc-button mdc-button--raised" @click.prevent="removeStock(stock.symbol)">
                                <div class="valign-center">
                                    <i class="material-icons">delete</i> {{ stock.symbol }}
                                </div>
                            </button>
                        </template>
                    </div>
                </div>
            </section>
        </div>
    </div>
</template>

<script>
    import * as d3 from "d3";
    import * as websockets from "../websockets";
    import { MDCTextfield } from '@material/textfield';

    let margin = {top: 20, right: 50, bottom: 20, left: 50},
        height = 400 - margin.top - margin.bottom,
        width = 900 - margin.left - margin.right;

    export default {
        data: function () {
            return {
                stockSymbolInput: ""
            };
        },
        computed: {
            stocks () {
                return this.$store.state.stocks;
            },
            filteredStocks () {
                return this.$store.state.filteredStocks;
            },
            stockSymbols () {
                return this.$store.state.stocks.map(stock => stock.symbol).join(' ');
            }
        },
        methods: {
            drawChart () {
                var svg = d3.select('#chart-svg');

                // Remove all elements in the SVG
                svg.selectAll('*').remove();

                var chart = svg.append('g').attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');
                
                var allPrices = [];
                var allTimes = [];
                this.filteredStocks.forEach(stock => {
                    stock.quotes.forEach(quote => {
                        allPrices.push(quote.price);
                        allTimes.push(quote.time);
                    });
                });

                // Set up scales and other d3 utilities
                var x = d3.scaleTime().domain(d3.extent(allTimes)).range([0, width]);
                var y = d3.scaleLinear().domain(d3.extent(allPrices)).range([height, 0]);
                var z = d3.scaleOrdinal(d3.schemeCategory10).domain(this.stocks, d => d.symbol);
                var lineGenerator = d3.line().x(d => x(d.time)).y(d => y(d.price));
                var bisectDate = d3.bisector(d => d.time).left;
                var t = d3.transition().duration(750).ease(d3.easeLinear);

                // Add axis and labels to chart
                chart.append('g').attr('class', 'axis axis-x').attr('transform', 'translate(0, ' + height + ')').call(d3.axisBottom(x));
                let yAxis = chart.append('g').attr('class', 'axis axis-y').call(d3.axisLeft(y));
                yAxis.append("text").attr("transform", "rotate(-90)").attr("y", 6).attr("dy", "0.71em").attr("fill", "#000").text("Price, USD");

                var stock = chart.selectAll('.stock').data(this.filteredStocks).enter().append('g').attr('class', 'stock');
                stock.append('path')
                    .attr('class', 'line')
                    .attr('d', d => lineGenerator(d.quotes))
                    .style('stroke', d => z(d.symbol))
                    .style('fill', 'none');

                // Set up our overlay
                let dateList = [];
                let chartEmpty = this.stocks.length == 0 ? true : false;
                this.stocks.forEach(stock => {
                    stock.quotes.forEach(quote => {
                        let year = quote.time.getFullYear();
                        let month = quote.time.getMonth();
                        let day = quote.time.getDate();

                        dateList[year] = dateList[year] == undefined ? [] : dateList[year];
                        dateList[year][month] = dateList[year][month] == undefined ? [] : dateList[year][month];
                        dateList[year][month][day] = dateList[year][month][day] == undefined ? [] : dateList[year][month][day];
                        dateList[year][month][day].push({
                            symbol: stock.symbol,
                            price: quote.price,
                            time: quote.time
                        });
                    });
                });

                let timeLine = chart.append('line')
                    .attr('x1', 150)
                    .attr('y1', 0)
                    .attr('x2', 150)
                    .attr('y2', height);

                let timeLineCircles = [];
                for (let i = 0; i < this.stocks.length; i++) {
                    let timeLineCircle = chart.append('circle').attr('class', 'hidden');
                    timeLineCircles.push(timeLineCircle);
                }

                let chartTooltip = d3.select('#chart-tooltip');

                chart.append('rect').attr('class', 'overlay').attr('width', width).attr('height', height)
                    .on('mouseenter', function () {
                        if (chartEmpty) return;
                        timeLine.attr('class', 'chart-timeline');
                        timeLineCircles.forEach(circle => { circle.attr('class', 'timeline-circle') });
                        chartTooltip.attr('class', 'tooltip-visible');
                    })
                    .on('mouseleave', function () {
                        timeLine.attr('class', 'hidden');
                        timeLineCircles.forEach(circle => {circle.style('stroke', 'none')});
                        chartTooltip.attr('class', 'tooltip-hidden');
                    })
                    .on('mousemove', function (event) {
                        if (chartEmpty) return;

                        let xCoord = d3.mouse(this)[0];
                        let xValue = x.invert(xCoord);

                        timeLine.attr('x1', xCoord).attr('x2', xCoord);

                        let tooltipHeight = window.getComputedStyle(chartTooltip.node()).height;
                        tooltipHeight = Number(tooltipHeight.split('').splice(0, tooltipHeight.length - 2).join(''));
                        let tooltipX = xCoord < width / 2 ? d3.event.pageX + 50 : d3.event.pageX - 250;

                        chartTooltip.style('top', (d3.event.pageY - (tooltipHeight / 2) + "px")).style('left', tooltipX + "px");

                        let prices = dateList[xValue.getFullYear()][xValue.getMonth()][xValue.getDate()];
                        if (prices == undefined) {
                            return;
                        }

                        for (let i = 0; i < prices.length; i++) {
                            timeLineCircles[i]
                                .attr('cx', x(prices[i].time))
                                .attr('cy', y(prices[i].price))
                                .attr('r', 5)
                                .style('stroke-width', '1px')
                                .style('stroke', z(prices[i].symbol))
                                .style('fill', 'none');
                        }
                        

                        let tooltipHtml = '<p>' + prices[0].time.toDateString() + '</p><ul>';
                        for (let i = 0; i < prices.length; i++) {
                            tooltipHtml += '<li style="color: ' + z(prices[i].symbol) + '"><small>' + prices[i].symbol + ': ' + d3.format('$.2f')(prices[i].price) + '</small></li>';
                        }
                        tooltipHtml += "</ul>";
                        chartTooltip.html(tooltipHtml);                    
                    });
            },
            removeStock (symbol) {
                websockets.removeStock(symbol);
            },
            addStock (symbol) {
                this.$store.commit('beginLoading');
                websockets.addStock(symbol);
                this.stockSymbolInput = '';
            },
            filterStocks (months) {
                this.$store.commit('filterStocks', months);
                this.drawChart();
            }
        },
        mounted: function () {
            new MDCTextfield(document.querySelector('.mdc-textfield'));
            this.drawChart();
        },
        updated: function () {
            this.drawChart();
        }
    };
</script>

<style>
</style>