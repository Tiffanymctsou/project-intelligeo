const protocol = window.location.protocol;
const domain = window.location.host;

function nativeLogin() {
    event.preventDefault();
    const account = document.getElementById('account').value;
    const password = document.getElementById('password').value;
    const user = {
        account: account,
        password: password
    };
    axios.post(`${protocol}//${domain}/franchise/nativeLogin`, user)
        .then((response) => {
            const loginStatus = response.data.data;
            return loginStatus;
        })
        .then((response) => {
            const storage = window.localStorage;
            storage.setItem('Authorization', response.accessToken);
            window.location.href = '/franchise/home.html';
        });
}