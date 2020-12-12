let app = {}

app.readjson = async (file) => {
    const result = fetch(file, { method: 'GET' })
        .then((response) => {
            const data = response.json();
            return data
        })
        .then((response) => {
            return response
        })
    return result
}