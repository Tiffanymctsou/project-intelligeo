const protocol = window.location.protocol;
const domain = window.location.host;
const token = window.localStorage.Authorization;
const userRequst = axios.create({
    headers: {
        'Content-Type': 'application/json',
        'Authorization': token
    }
})

if (token == null) {
    window.location.href = '/franchise/login.html'
} else {
    userRequst.get(`${protocol}//${domain}/franchise/verifyToken`)
        .then((response) => {
            console.log(response)
        })
}