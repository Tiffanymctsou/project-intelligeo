const protocol = window.location.protocol;
const domain = window.location.host;

async function getAllFranchise() {
	const franchises = await userRequest.get(`${protocol}//${domain}/admin/getFranchise`).then((response) => {
		const data = response.data.franchises;
		console.log(response.data.franchises);
		return data;
	});

	franchises.forEach((franchise) => {
		const tbody = document.getElementById('allFranchises');
		const tr = document.createElement('tr');
		const idTd = document.createElement('td');
		const nameTd = document.createElement('td');
		const cityTd = document.createElement('td');
		const emailTd = document.createElement('td');
		const phoneTd = document.createElement('td');
		const addressTd = document.createElement('td');
		const dateTd = document.createElement('td');
		const icons = document.createElement('td');
		idTd.innerHTML = franchise.franchise_id;
		tr.appendChild(idTd);
		nameTd.innerHTML = franchise.fullname;
		tr.appendChild(nameTd);
		cityTd.innerHTML = franchise.city;
		tr.appendChild(cityTd);
		emailTd.innerHTML = franchise.email;
		tr.appendChild(emailTd);
		phoneTd.innerHTML = franchise.phone;
		tr.appendChild(phoneTd);
		addressTd.innerHTML = franchise.address;
		tr.appendChild(addressTd);
		dateTd.innerHTML = franchise.join_date;
		tr.appendChild(dateTd);
		icons.innerHTML = `<span><a href="./?id=${franchise.franchise_id}" data-toggle="tooltip" data-placement="top"
        title="" data-original-title="View"><i
            class="fa fa-eye color-muted m-r-5"></i></a> <a
                href="#" data-toggle="tooltip" data-placement="top"
                title="" data-original-title="Delete"><i
                    class="fa fa-trash color-danger"></i></a></span>`;
		tr.appendChild(icons);
		tbody.appendChild(tr);
	});
	console.log(franchises);
}

getAllFranchise();
