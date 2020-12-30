const socketcon = (socket) => {
	socket.on('report-status', (statusData) => {
		console.log(statusData);
		statusData.open_time = `${statusData.open_time.split(':')[0]}:${statusData.open_time.split(':')[1]}`;
		socket.broadcast.emit('report-status', statusData);
	});
	socket.on('report-close', (closeLog) => {
		closeLog.time = `${closeLog.time.split(':')[0]}:${closeLog.time.split(':')[1]}`;
		socket.broadcast.emit('report-close', closeLog);
		console.log(closeLog);
	});
	socket.on('report-sales', (salesInfo) => {
		salesInfo.time = `${salesInfo.time.split(':')[0]}:${salesInfo.time.split(':')[1]}`;
		socket.broadcast.emit('report-sales', salesInfo);
		console.log(salesInfo);
	});
	socket.on('add-franchise', (franchiseCount) => {
		socket.broadcast.emit('add-franchise', franchiseCount);
		console.log(franchiseCount);
	});
};

module.exports = socketcon;
