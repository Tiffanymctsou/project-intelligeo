const protocol = window.location.protocol;
const domain = window.location.host;
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');
const uid = urlParams.get('uid');

if (!id || !uid) {
    window.location.replace('/');
} else {
    axios.get(`${protocol}//${domain}/franchise/verifySetting`, {
        params: { id: id, uid: uid }
    })
        .then((response) => {
            console.log(response)
        })
        .catch((err) => {
            const error = err.response.data
            if (error.status == 403) { }
            window.location.href = '/franchise/login.html';
        })
}

function setPassword() {
    const password = document.getElementById('password').value
    const confirm_password = document.getElementById('confirm_password').value
    if (password == null || confirm_password == null) {
        return
    } else if (password != confirm_password) {
        alert('密碼不相符！')
        return
    }
    const data = {
        password: password
    }
    axios.post(`${protocol}//${domain}/franchise/setAccount`, data, {
        params: { id: id }
    })
        .then((response) => {
            if (response.status == 200) {
                window.location.replace('/franchise/login.html');
            }
        })

}