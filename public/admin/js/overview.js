import { CountUp } from './plugins-init/countUp.js';
const socket = io();

// let countups
let dailySalesCountUp;
let monthlySalesCountUp;
let newFranchiseCountUp;
let allFranchiseCountUp;

// overview
userRequest.get(`${protocol}//${domain}/admin/getOverviewData`).then((response) => {
	const overviewData = response.data;
	console.log(overviewData);
	dailySalesCountUp = new CountUp('daily-sales', overviewData.dailySales.total_sales);
	if (!dailySalesCountUp.error) {
		dailySalesCountUp.start();
	} else {
		console.error(dailySalesCountUp.error);
	}
	monthlySalesCountUp = new CountUp('monthly-sales', overviewData.monthlySales.total_sales);
	if (!monthlySalesCountUp.error) {
		monthlySalesCountUp.start();
	} else {
		console.error(monthlySalesCountUp.error);
	}
	newFranchiseCountUp = new CountUp('monthly-franchise', overviewData.franchiseCount.monthly);
	if (!newFranchiseCountUp.error) {
		newFranchiseCountUp.start();
	} else {
		console.error(newFranchiseCountUp.error);
	}
	allFranchiseCountUp = new CountUp('total-franchise', overviewData.franchiseCount.total);
	if (!allFranchiseCountUp.error) {
		allFranchiseCountUp.start();
	} else {
		console.error(allFranchiseCountUp.error);
	}
});

socket.on('report-sales', (salesInfo) => {
	const franchise_sales = parseInt(salesInfo.amount);
	const currentMonth = new Date().getMonth() + 1;
	console.log(salesInfo.report_date);
	console.log(todayIs);
	if (salesInfo.report_date == todayIs) {
		const updatedAmount_d = calUpdatedAmount('daily-sales', franchise_sales);
		dailySalesCountUp.update(updatedAmount_d);
	}
	console.log(salesInfo.report_date.split('-')[1]);
	console.log(currentMonth);
	if (salesInfo.report_date.split('-')[1] == currentMonth) {
		const updatedAmount_m = calUpdatedAmount('monthly-sales', franchise_sales);
		monthlySalesCountUp.update(updatedAmount_m);
	}
});

socket.on('add-franchise', (franchiseCount) => {
	const updatedCount_m = calUpdatedAmount('monthly-franchise', franchiseCount.num);
	const updatedCount_a = calUpdatedAmount('total-franchise', franchiseCount.num);
	newFranchiseCountUp.update(updatedCount_m);
	allFranchiseCountUp.update(updatedCount_a);
});

function calUpdatedAmount(tag, value) {
	const currentAmount = document.getElementById(tag).innerHTML;
	const currentIntAmount = parseInt(currentAmount.replace(',', ''));
	const updatedAmount = currentIntAmount + value;
	console.log(currentAmount);
	console.log(currentIntAmount);
	return updatedAmount;
}
