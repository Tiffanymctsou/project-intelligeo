let app = {};
const token = window.localStorage.Authorization;
const userRequest = axios.create({
	headers: {
		'Content-Type': 'application/json',
		Authorization: token
	}
});

if (token == null) {
	window.location.href = '/franchise/login.html';
}

app.readjson = async (file) => {
	const result = fetch(file, { method: 'GET' })
		.then((response) => {
			const data = response.json();
			return data;
		})
		.then((response) => {
			return response;
		});
	return result;
};

// loading pages
function domCreate(element) {
	return document.createElement(element);
}

function getBadgeText(status) {
	switch (status) {
		case 'open': {
			return '營業中';
		}
		case 'closed': {
			return '今日結束';
		}
		case 'relax': {
			return '今日休息';
		}
		case 'reported': {
			return '已回報';
		}
		case 'unreported': {
			return '尚未回報';
		}
		case 'noreport': {
			return '-';
		}
	}
}

function toOpenStatus(status) {
	switch (status) {
		case 0: {
			return 'relax';
		}
		case 1: {
			return 'open';
		}
		case 2: {
			return 'closed';
		}
	}
}

function toReportStatus(status) {
	switch (status) {
		case 0: {
			return 'unreported';
		}
		case 1: {
			return 'reported';
		}
	}
}
function createStatus(
	log_id,
	franchise_id,
	fullname,
	location,
	open_status,
	open_time,
	close_time,
	report_status,
	report_time
) {
	const tbody = document.getElementById('status-table');
	const tr = domCreate('tr');
	tr.id = `log-${log_id}`;
	const idTd = domCreate('td');
	idTd.textContent = franchise_id;
	const nameTd = domCreate('td');
	nameTd.id = `name-${log_id}`;
	nameTd.textContent = fullname;
	const locationTd = domCreate('td');
	locationTd.id = `location-${log_id}`;
	locationTd.textContent = location;
	const openStatusTd = domCreate('td');
	const openStatusSpan = domCreate('span');
	openStatusSpan.classList.add('badge', `badge-${open_status}`, 'px-2', 'open-status-badge');
	openStatusSpan.textContent = getBadgeText(open_status);
	openStatusTd.appendChild(openStatusSpan);
	const openTimeTd = domCreate('td');
	const openTimeSpan = domCreate('span');
	openTimeSpan.id = `open-time-${log_id}`;
	openTimeSpan.classList.add('m-0');
	openTimeSpan.textContent = `${open_time}`;
	if (close_time != null) {
		openTimeSpan.textContent += ` - ${close_time}`;
	}
	openTimeTd.appendChild(openTimeSpan);
	const reportStatusTd = domCreate('td');
	const reportStatusSpan = domCreate('span');
	reportStatusSpan.classList.add('badge', `badge-${report_status}`, 'px-2', 'report-status-badge');
	reportStatusSpan.textContent = getBadgeText(report_status);
	reportStatusTd.appendChild(reportStatusSpan);
	const reportTimeTd = domCreate('td');
	const reportTimeSpan = domCreate('span');
	reportTimeSpan.id = `report-time-${log_id}`;
	reportTimeSpan.classList.add('m-0', 'pl-3');
	reportTimeSpan.textContent = report_time;
	reportTimeTd.appendChild(reportTimeSpan);
	appendChildren(tr, [idTd, nameTd, locationTd, openStatusTd, openTimeTd, reportStatusTd, reportTimeTd]);
	tbody.prepend(tr);
}

function appendChildren(parent, children) {
	children.forEach((child) => {
		parent.appendChild(child);
	});
}
