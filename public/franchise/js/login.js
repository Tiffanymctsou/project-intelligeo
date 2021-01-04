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
	axios
		.post(`${protocol}//${domain}/franchise/nativeLogin`, user)
		.then((response) => {
			const loginStatus = response.data.data;
			return loginStatus;
		})
		.then((response) => {
			const storage = window.localStorage;
			storage.setItem('Authorization', response.accessToken);
			window.location.href = '/franchise/home.html';
		})
		.catch((error) => {
			console.log(error.response);
			const errorMsg = error.response.data;
			Swal.fire({
				icon: 'error',
				title: '哎呀！',
				text: errorMsg,
				showConfirmButton: true,
				confirmButtonText: '確認'
			});
		});
}
