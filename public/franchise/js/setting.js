const protocol = window.location.protocol;
const domain = window.location.host;
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');
const uid = urlParams.get('uid');

if (!id || !uid) {
	window.location.replace('/');
} else {
	axios
		.get(`${protocol}//${domain}/franchise/verifySetting`, {
			params: { id: id, uid: uid },
		})
		.then((response) => {
			// ADD ALERT TO SET PASSWORD
			console.log(response);
		})
		.catch((err) => {
			const error = err.response.data;
			if (error.status == 403) {
			}
			window.location.href = '/franchise/login.html';
		});
}

function setPassword() {
	const password = document.getElementById('password').value;
	const confirm_password = document.getElementById('confirm_password').value;
	if (password == null || confirm_password == null) {
		return;
	} else if (password != confirm_password) {
		tryAgain();
		return;
	}

	const data = {
		password: password,
	};
	axios
		.post(`${protocol}//${domain}/franchise/setAccount`, data, {
			params: { id: id },
		})
		.then((response) => {
			if (response.status == 200) {
				Swal.fire({
					position: 'center',
					icon: 'success',
					title: '回報成功',
					showConfirmButton: false,
					timer: 1500,
				});
				setTimeout(function () {
					window.location.href = '/franchise/login.html';
				}, 1500);
			}
		});
}
