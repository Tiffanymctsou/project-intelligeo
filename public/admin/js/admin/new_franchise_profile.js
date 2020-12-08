const protocol = window.location.protocol;
const domain = window.location.host;
const storage = window.localStorage;

function addFranchise() {
    const franchise_id = document.getElementById('franchise_id').value;
    const franchise_fullname = document.getElementById('franchise_fullname').value;
    const franchise_city = document.getElementById('franchise_city').value;
    const franchise_email = document.getElementById('franchise_email').value;
    const franchise_phone = document.getElementById('franchise_phone').value;
    const franchise_address = document.getElementById('franchise_address').value;
    const franchise_location = document.getElementById('franchise_location').value;
    const coordinates = storage.coordinates;

    const franchiseInfo = {
        franchise_id,
        franchise_fullname,
        franchise_city,
        franchise_email,
        franchise_phone,
        franchise_address,
        franchise_location,
        coordinates
    }

    // console.log(franchiseInfo)

    axios.post(`${protocol}//${domain}/admin/addFranchise`, franchiseInfo)
        .then((response) => {
            console.log(response.data.data.msg);
            storage.removeItem('coordinates');
            window.location.replace('/admin/allFranchise.html');
        })
}