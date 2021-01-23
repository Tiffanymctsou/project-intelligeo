const protocol = window.location.protocol;
const domain = window.location.host;
const socket = io();
let status;
let unreported;

userRequest
    .get(`${protocol}//${domain}/franchise/openStatus`)
    .then((response) => {
        return response.data.data;
    })
    .then((openStatus) => {
        const { franchise_id } = openStatus;
        const openLogs = openStatus.open_log;
        const openLog = openLogs[0];
        const unreportedLogs = openStatus.unreported_log;
        if (openLogs.length == 0) {
            status = "unreported";
        } else if (openLog.open_status == 0) {
            status = "relax";
        } else if (openLog.open_status == 1) {
            status = "open";
        } else if (openLog.open_status == 2 && openLog.report_status == 0) {
            status = "closed";
        } else if (openLog.open_status == 2 && openLog.report_status == 1) {
            status = "reported";
        } else if (unreportedLogs.length != 0) {
            unreported = true;
        }
        return { franchise_id, openLog, unreportedLogs };
    })
    .then((openStatus) => {
        console.log(status);
        switch (status) {
        case "unreported": {
            const containerDiv = document.querySelector(
                ".status-container"
            );
            const boxDiv = domCreate("div");
            boxDiv.classList.add("status-box", "m-b-5");
            const wrapDiv = domCreate("div");
            wrapDiv.id = "no-report-yet";
            wrapDiv.className = "wrap-login102";
            wrapDiv.style.backgroundColor = getWrapColor(status);
            const textSpan = domCreate("span");
            textSpan.classList.add("home-content-text", "p-t-10", "p-b-10");
            textSpan.textContent = "今天還沒有營業紀錄哦！";
            wrapDiv.appendChild(textSpan);
            boxDiv.appendChild(wrapDiv);
            containerDiv.appendChild(boxDiv);
            break;
        }
        case "relax": {
            const containerDiv = document.querySelector(
                ".status-container"
            );
            const boxDiv = domCreate("div");
            boxDiv.classList.add("status-box", "m-b-5");
            const wrapDiv = domCreate("div");
            wrapDiv.className = "wrap-login102";
            wrapDiv.style.backgroundColor = getWrapColor(status);
            const titleSpan = domCreate("span");
            titleSpan.classList.add("home-content-box-title", "p-l-5");
            titleSpan.textContent = openStatus.openLog.report_date;
            const badgeSpan = domCreate("span");
            badgeSpan.classList.add("badge", `badge-${status}`);
            badgeSpan.textContent = getBadgeText(status);
            titleSpan.appendChild(badgeSpan);
            const hr = domCreate("hr");
            const timeDiv = domCreate("div");
            const timeIcon = domCreate("img");
            timeIcon.src = "images/icons/check.png";
            timeIcon.style.cssText = "width: 17px; float: left;";
            const timeSpan = domCreate("span");
            timeSpan.classList.add(
                "home-content-box-text",
                "p-l-21",
                "p-b-10"
            );
            timeSpan.innerHTML = `於 <b>${openStatus.openLog.open_time}</b> 回報`;
            timeDiv.appendChild(timeIcon);
            timeDiv.appendChild(timeSpan);
            wrapDiv.appendChild(titleSpan);
            wrapDiv.appendChild(hr);
            wrapDiv.appendChild(timeDiv);
            boxDiv.appendChild(wrapDiv);
            containerDiv.appendChild(boxDiv);
            break;
        }
        case "open": {
            const open = openStatus.openLog;
            loadStatus(
                open.id,
                open.report_date,
                status,
                open.open_time,
                open.open_location
            );
            addBtn(open.id, status, "close");
            document
                .querySelector(".report-close")
                .addEventListener("click", reportClose);
            break;
        }
        case "closed": {
            const open = openStatus.openLog;
            loadStatus(
                open.id,
                open.report_date,
                status,
                open.open_time,
                open.open_location
            );
            addBtn(open.id, status, "report");
            break;
        }
        case "reported": {
            const open = openStatus.openLog;
            loadStatus(
                open.id,
                open.report_date,
                status,
                open.open_time,
                open.open_location
            );
            break;
        }
        }
        return openStatus.unreportedLogs;
    })
    .then((unreportedLogs) => {
        console.log(unreportedLogs);
        if (unreportedLogs.length != 0) {
            for (let i = 0; i < unreportedLogs.length; i++) {
                const log = unreportedLogs[i];
                loadStatus(
                    log.id,
                    log.report_date,
                    "late",
                    log.open_time,
                    log.open_location
                );
                addBtn(log.id, "late", "report");
            }
        }
        const reportBtns = document.querySelectorAll(".report-report");
        if (reportBtns) {
            reportBtns.forEach((btn) => {
                btn.addEventListener("click", reportSales);
            });
        }
    })
    .then(() => {
        if (document.getElementById("no-report-yet") == null) {
            document.getElementById("report-open").disabled = true;
            document.getElementById("report-relax").disabled = true;
        }
    })
    .catch((err) => {
        console.log(err);
        const error = err.response;
        console.log(err.response);
        if (error.status == 403 && error.data.msg == "jwt expired") {
            loginAgain();
        } else {
            console.log(error.message);
            errorMsg();
        }
    });

async function reportLocation(clicked_id) {
    const action = clicked_id;
    const openInfo = {};
    switch (action) {
    case "report-open": {
        Swal.fire({
            title: "開攤詳細地址",
            text:
                    "請將「縣市」、「區域」、「街道路名」、「巷弄號」清楚告知哦！",
            input: "text",
            inputAttributes: {
                autocapitalize: "off",
            },
            showCancelButton: true,
            confirmButtonText: "確認",
            cancelButtonText: "取消",
            showLoaderOnConfirm: true,
            inputValidator: (value) => {
                if (!value) {
                    return "請輸入地址！";
                }
            },
            preConfirm: (location) => {
                openInfo.status = 1;
                openInfo.location = location;
                return userRequest
                    .patch(
                        `${protocol}//${domain}/franchise/openStatus`,
                        openInfo
                    )
                    .then((response) => {
                        const reportResult = response.data.data;
                        console.log(reportResult);
                        socket.emit("report-status", reportResult);
                        console.log(response.data.msg);
                    })
                    .catch((err) => {
                        const error = err.response;
                        console.log(err.response);
                        if (
                            error.status == 403 &&
                                error.data.msg == "jwt expired"
                        ) {
                            loginAgain();
                        }
                    });
            },
            allowOutsideClick: () => !Swal.isLoading(),
        }).then((result) => {
            if (result.isConfirmed) {
                successReport();
                setTimeout(function () {
                    location.reload();
                }, 1500);
            }
        });
        break;
    }
    case "report-relax": {
        openInfo.status = 0;
        await userRequest
            .patch(
                `${protocol}//${domain}/franchise/openStatus`,
                openInfo
            )
            .then((response) => {
                const reportResult = response.data.data;
                console.log(reportResult);
                socket.emit("report-status", reportResult);
                successReport();
                setTimeout(function () {
                    location.reload();
                }, 1500);
            })
            .catch((err) => {
                const error = err.response;
                console.log(error);
                if (
                    error.status == 403 &&
                        error.data.msg == "jwt expired"
                ) {
                    loginAgain();
                }
            });
        break;
    }
    }
}
