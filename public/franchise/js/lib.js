const token = window.localStorage.Authorization;
const userRequest = axios.create({
    headers: {
        "Content-Type": "application/json",
        Authorization: token,
    },
});

if (token == null) {
    window.location.href = "/franchise/login.html";
}

// sweet alerts
function loginAgain() {
    Swal.fire({
        icon: "error",
        title: "哎呀！",
        text: "請重新登入再試！",
    }).then(() => {
        window.location.href = "/franchise/login.html";
    });
}

function successReport() {
    Swal.fire({
        position: "center",
        icon: "success",
        title: "回報成功",
        showConfirmButton: false,
        timer: 1500,
    });
}

function tryAgain() {
    Swal.fire({
        icon: "error",
        title: "糟糕！",
        text: "好像密碼出錯了！請再試一次！",
        showConfirmButton: true,
        confirmButtonText: "確認",
    });
    return;
}
// loading pages
function domCreate(element) {
    return document.createElement(element);
}

function getBadgeText(status) {
    switch (status) {
    case "open": {
        return "營業中";
    }
    case "reported": {
        return "已回報";
    }
    case "closed": {
        return "尚未回報";
    }
    case "late": {
        return "逾期回報";
    }
    case "relax": {
        return "今日休息";
    }
    }
}

function getWrapColor(status) {
    switch (status) {
    case "open": {
        return "rgba(56, 176, 0, 0.2)";
    }
    case "closed": {
        return "rgba(255, 213, 46, 0.2)";
    }
    case "late": {
        return "rgba(200, 0, 0, 0.2)";
    }
    case "reported": {
        return "rgba(51, 51, 51, 0.1)";
    }
    case "unreported": {
        return "rgba(51, 51, 51, 0.1)";
    }
    case "relax": {
        return "rgba(51, 51, 51, 0.1)";
    }
    }
}

function getBtnText(status) {
    switch (status) {
    case "open": {
        return "回報結束";
    }
    case "closed": {
        return "回報營收";
    }
    case "late": {
        return "回報營收";
    }
    }
}

function loadStatus(id, date, status, reportTime, reportLocation) {
    const containerDiv = document.querySelector(".status-container");
    const boxDiv = domCreate("div");
    boxDiv.classList.add("status-box", "m-b-5");
    const wrapDiv = domCreate("div");
    wrapDiv.id = `wrap-${id}`;
    wrapDiv.className = "wrap-login102";
    wrapDiv.style.backgroundColor = getWrapColor(status);
    const titleSpan = domCreate("span");
    titleSpan.id = `title-${id}`;
    titleSpan.classList.add("home-content-box-title", "p-l-5");
    titleSpan.textContent = date;
    const badgeSpan = domCreate("span");
    badgeSpan.classList.add("badge", `badge-${status}`);
    badgeSpan.textContent = getBadgeText(status);
    titleSpan.appendChild(badgeSpan);
    const hr = domCreate("hr");
    const timeDiv = domCreate("div");
    const timeIcon = domCreate("img");
    timeIcon.src = "images/icons/clock.png";
    timeIcon.style.cssText = "width: 17px; float: left;";
    const timeSpan = domCreate("span");
    timeSpan.classList.add("home-content-box-text", "p-l-21", "p-b-10");
    timeSpan.textContent = reportTime;
    timeDiv.appendChild(timeIcon);
    timeDiv.appendChild(timeSpan);
    const locationDiv = domCreate("div");
    const markerIcon = domCreate("img");
    markerIcon.src = "images/icons/map-marker.png";
    markerIcon.style.cssText = "width: 18px; float: left;";
    const locationSpan = domCreate("span");
    locationSpan.classList.add("home-content-box-text", "p-l-20", "p-b-10");
    locationSpan.textContent = reportLocation;
    locationDiv.appendChild(markerIcon);
    locationDiv.appendChild(locationSpan);
    wrapDiv.appendChild(titleSpan);
    wrapDiv.appendChild(hr);
    wrapDiv.appendChild(timeDiv);
    wrapDiv.appendChild(locationDiv);
    boxDiv.appendChild(wrapDiv);
    containerDiv.appendChild(boxDiv);
}

function addBtn(id, status, info) {
    const wrapDiv = document.getElementById(`wrap-${id}`);
    const btnDiv = domCreate("div");
    btnDiv.classList.add("container-login101-form-btn", "m-t-3", "m-b-20");
    const btn = domCreate("btn");
    btn.id = `btn-${id}`;
    btn.classList.add(`home-select-btn-${info}`, `report-${info}`);
    btn.textContent = getBtnText(status);
    btnDiv.appendChild(btn);
    wrapDiv.appendChild(btnDiv);
}

// action functions
function reportClose(e) {
    const log = {
        status: 2,
        id: e.target.id.split("-")[1],
    };
    console.log(log);

    userRequest
        .patch(`${protocol}//${domain}/franchise/openStatus`, log)
        .then((response) => {
            const closeLog = response.data.data;
            socket.emit("report-close", closeLog);
            successReport();
            setTimeout(function () {
                location.reload();
            }, 1500);
        })
        .catch((err) => {
            console.log(err.response);
        });
}

function reportSales(e) {
    const id = e.target.id.split("-")[1];
    // console.log
    Swal.fire({
        title: "今日營業額",
        text: "請直接輸入數字！",
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
                return "請輸入營業額！";
            } else if (isNaN(parseInt(value))) {
                return "請輸入正確金額！";
            }
        },
        preConfirm: (sales) => {
            const salesInfo = {
                log_id: id,
                amount: sales,
            };
            return userRequest
                .post(`${protocol}//${domain}/franchise/reportSales`, salesInfo)
                .then((response) => {
                    const salesInfo = response.data.data;
                    console.log(salesInfo);
                    socket.emit("report-sales", salesInfo);
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
}
