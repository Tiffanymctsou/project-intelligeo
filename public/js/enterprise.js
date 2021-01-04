const protocol = window.location.protocol;
const domain = window.location.host;

function registerEnterprise() {
	event.preventDefault();
	const company = document.getElementById('company').value;
	const fullname = document.getElementById('fullname').value;
	const email = document.getElementById('email').value;
	const enterprise = {
		company: company,
		fullname: fullname,
		email: email
	};
	axios
		.post(`${protocol}//${domain}/enterprise/register`, enterprise)
		.then((response) => {
			console.log(response.data);
		})
		.catch((error) => {
			console.log(error);
		});
}

function login() {
	event.preventDefault();
	const email = document.getElementById('email').value;
	const password = document.getElementById('password').value;
	const enterprise = {
		email: email,
		password: password
	};
	axios
		.post(`${protocol}//${domain}/enterprise/nativeLogin`, enterprise)
		.then((response) => {
			const loginStatus = response.data.data;
			return loginStatus;
		})
		.then((response) => {
			const storage = window.localStorage;
			storage.setItem('Authorization', response.accessToken);
			window.location.href = '/admin';
		})
		.catch((error) => {
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
