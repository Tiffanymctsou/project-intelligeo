const protocol = window.location.protocol;
const domain = window.location.host;
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");
const uid = urlParams.get("uid");

if (!id || !uid) {
    window.location.replace("/");
} else {
    axios
        .get(`${protocol}//${domain}/enterprise/verifySetting`, {
            params: { id: id, uid: uid },
        })
        .then((response) => {
            // ADD ALERT TO SET PASSWORD
            console.log(response);
        })
        .catch((err) => {
            const error = err.response.data;
            if (error.status == 403) {
                window.location.href = "/enterprise/login.html";
            }
        });
}

function setPassword() {
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm_password").value;
    if (password == null || confirmPassword == null) {
        return;
    } else if (password != confirmPassword) {
        Swal.fire({
            icon: "error",
            title: "糟糕！",
            text: "好像密碼出錯了！請再試一次！",
            showConfirmButton: true,
            confirmButtonText: "確認",
        });
        return;
    } else {
        const data = {
            password: password,
        };
        axios
            .patch(`${protocol}//${domain}/enterprise/account`, data, {
                params: { id: id },
            })
            .then((response) => {
                if (response.status == 200) {
                    Swal.fire({
                        position: "center",
                        icon: "success",
                        title: "設置成功",
                        showConfirmButton: false,
                        timer: 1500,
                    });
                    setTimeout(function () {
                        window.location.href = "/login.html";
                    }, 1500);
                }
            });
    }
}
