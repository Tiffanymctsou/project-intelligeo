const socket = io();
const protocol = window.location.protocol;
const domain = window.location.host;

// date
const todayIs = new Date().toISOString().split('T')[0];
const statusDiv = document.querySelector('#franchise-status');
const dateP = domCreate('p');
dateP.id = 'today-date';
dateP.textContent = todayIs;
statusDiv.appendChild(dateP);

axios.get(`${protocol}//${domain}/admin/getReportStatus`).then((response) => {
	const statusData = response.data;
	if (statusData.length == 0) {
		const tableDiv = document.getElementById('dashboard-status-table');
		const noReportDiv = domCreate('div');
		noReportDiv.id = 'no-report-yet';
		noReportDiv.textContent = '今天還沒有營業狀況回報哦！';
		tableDiv.appendChild(noReportDiv);
	} else {
		statusData.forEach((data) => {
			const { id, franchise_id, fullname, open_location, close_time } = data;
			let open_status = toOpenStatus(data.open_status);
			let { open_time } = data;
			let report_status = toReportStatus(data.report_status);
			let report_time = data.report_time ? data.report_time : '-';
			if (open_status == 'relax') {
				open_time = '-';
				report_status = 'noreport';
				createStatus(id, franchise_id, fullname, open_location, open_status, open_time, close_time, report_status, report_time);
			} else {
				createStatus(id, franchise_id, fullname, open_location, open_status, open_time, close_time, report_status, report_time);
			}
		});
	}
});

socket.on('report-status', (newStatus) => {
	if (document.getElementById('no-report-yet') != null) {
		document.getElementById('no-report-yet').remove();
	}
	const { log_id, franchise_id, fullname, open_location, close_time } = newStatus;
	let open_status = toOpenStatus(newStatus.open_status);
	let { open_time } = newStatus;
	console.log(newStatus.report_status);
	let report_status = toReportStatus(newStatus.report_status);
	let report_time = newStatus.report_time ? newStatus.report_time : '-';
	if (open_status == 'relax') {
		open_time = '-';
		report_status = 'noreport';
		createStatus(log_id, franchise_id, fullname, open_location, open_status, open_time, close_time, report_status, report_time);
	} else {
		createStatus(log_id, franchise_id, fullname, open_location, open_status, open_time, close_time, report_status, report_time);
	}
	console.log(newStatus);
});

socket.on('report-close', (closeLog) => {
	if (document.getElementById('no-report-yet') != null) {
		document.getElementById('no-report-yet').remove();
	}
	const openStatusBadge = document.querySelector(`#log-${closeLog.log_id} .open-status-badge`);
	openStatusBadge.classList.replace('badge-open', 'badge-closed');
	openStatusBadge.innerHTML = getBadgeText('closed');
	const openTimeSpan = document.getElementById(`open-time-${closeLog.log_id}`);
	openTimeSpan.textContent += ` - ${closeLog.time}`;
});

socket.on('report-sales', (salesInfo) => {
	console.log(salesInfo);
	if (salesInfo.report_date == todayIs) {
		const reportStatusBadge = document.querySelector(`#log-${salesInfo.log_id} .report-status-badge`);
		reportStatusBadge.classList.replace('badge-unreported', 'badge-reported');
		reportStatusBadge.innerHTML = getBadgeText('reported');
		const reportTimeSpan = document.getElementById(`report-time-${salesInfo.log_id}`);
		reportTimeSpan.innerHTML = salesInfo.time;
	}
});
