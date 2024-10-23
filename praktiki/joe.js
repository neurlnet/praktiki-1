const ajax = async (config) => {
        const request = await fetch(config.url, {
            method: config.method,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(config.payload)
        });
        response = await request.json();
        return response.response
}
   
ajax({
    method: 'POST',
    url: 'https://praktikiapi-tu58usbg.b4a.run/sessions_get',
    payload: {"user_id":"obama"}
}).then(res => {
    if(res[0]){
        console.log('hi')
    }
})


// response = ajax({
//         method: 'POST',
//         url: 'https://praktikiapi-tu58usbg.b4a.run/save',
//         payload: {"user_id":"obama","session_id":"dfdafad", "doc": "Obama is the 43RD US president.","source": "about obama"}
// })

