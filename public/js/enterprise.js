const protocol = window.location.protocol;
const domain = window.location.host;

// function register() {

// }

function login() {
	event.preventDefault();
	window.location.replace(`${protocol}//${domain}/admin/index.html`);
}
