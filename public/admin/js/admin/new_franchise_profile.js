const protocol = window.location.protocol;
const domain = window.location.host;
const storage = window.localStorage;
const socket = io();

function addFranchise() {
    const franchise_id = document.getElementById("franchise_id").value;
    const franchise_fullname = document.getElementById("franchise_fullname")
        .value;
    const franchise_city = document.getElementById("franchise_city").value;
    const franchise_email = document.getElementById("franchise_email").value;
    const franchise_phone = document.getElementById("franchise_phone").value;
    const franchise_address = document.getElementById("franchise_address")
        .value;
    const franchise_location = document.getElementById("franchise_location")
        .value;
    const coordinates = storage.coordinates;

    const franchiseInfo = {
        franchise_id,
        franchise_fullname,
        franchise_city,
        franchise_email,
        franchise_phone,
        franchise_address,
        franchise_location,
        coordinates,
    };

    console.log(franchiseInfo);

    axios
        .post(`${protocol}//${domain}/admin/franchise`, franchiseInfo)
        .then((response) => {
            socket.emit("add-franchise", { num: 1 });
            storage.removeItem("coordinates");
            Swal.fire({
                position: "center",
                icon: "success",
                title: "添加成功",
                text: "請營業夥伴查看郵件設置密碼！",
                showConfirmButton: false,
                timer: 1500,
            });
            setTimeout(function () {
                window.location.replace("/admin/allFranchise.html");
            }, 1500);
        })
        .catch((error) => {
            console.log(error.response);
            Swal.fire({
                icon: "error",
                title: "Ooops！",
                text: "好像哪裡出錯了！請重新再試！",
            });
        });
}
