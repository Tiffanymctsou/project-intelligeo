let dates;
let amount;
let myLineChart;
const socket = io();
axios
    .get(`${protocol}//${domain}/admin/chart`)
    .then((response) => {
        const data = response.data;
        dates = data.dates;
        amount = data.amount;
    })
    .then(() => {
        (function ($) {
            'use strict';

            let ctx = document.getElementById('chart_widget_2');
            ctx.height = 280;
            myLineChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: dates,
                    type: 'line',
                    defaultFontFamily: 'Montserrat',
                    datasets: [
                        {
                            data: amount,
                            label: '單日營業額',
                            backgroundColor: '#ffbe0d',
                            borderColor: '#ffbe0d',
                            borderWidth: 2,
                            pointStyle: 'circle',
                            pointRadius: 3,
                            pointBorderColor: '#ffbe0d',
                            pointBackgroundColor: '#ffffff'
                        }
                    ]
                },
                options: {
                    responsive: !0,
                    maintainAspectRatio: false,
                    tooltips: {
                        mode: 'index',
                        titleFontSize: 12,
                        titleFontColor: '#000000',
                        bodyFontColor: '#000000',
                        backgroundColor: '#ffffff',
                        titleFontFamily: 'Montserrat',
                        bodyFontFamily: 'Montserrat',
                        cornerRadius: 3,
                        intersect: false,
                        callbacks: {
                            label: function (tooltipItem, data) {
                                return ` ${data.datasets[0].label}: $${new Intl.NumberFormat('zh-TW', {
                                    minimumFractionDigits: 0
                                }).format(tooltipItem.yLabel)}`;
                            }
                        }
                    },
                    legend: {
                        display: false,
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            fontFamily: 'Montserrat'
                        }
                    },
                    scales: {
                        xAxes: [
                            {
                                display: true,
                                gridLines: {
                                    display: false,
                                    drawBorder: false
                                },
                                scaleLabel: {
                                    display: false,
                                    labelString: 'Month'
                                }
                            }
                        ],
                        yAxes: [
                            {
                                display: true,
                                gridLines: {
                                    display: false,
                                    drawBorder: false
                                },
                                scaleLabel: {
                                    display: false,
                                    labelString: 'Value'
                                },
                                ticks: {
                                    stepSize: 10000,
                                    callback: function (value, index, values) {
                                        return '$ ' + value / 1000 + 'k';
                                    }
                                }
                            }
                        ]
                    },
                    title: {
                        display: false
                    }
                }
            });
        })(jQuery);
    })
    .catch((error) => {
        console.log(error);
    });

socket.on('report-sales', (salesInfo) => {
    const report_date = `${salesInfo.report_date.split('-')[1]}-${salesInfo.report_date.split('-')[2]}`;
    const chartDates = myLineChart.config.data.labels;
    let chartData = myLineChart.config.data.datasets[0].data;
    for (let i = 0; i < chartDates.length; i++) {
        if (chartDates[i] == report_date) {
            chartData[i] = parseInt(salesInfo.amount);
            myLineChart.update();
        }
    }
});
