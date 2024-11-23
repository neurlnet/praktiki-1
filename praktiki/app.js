const express = require('express')
const app = express()
const port = 80
const session = require('express-session')
const axios = require('axios');
const cookieParser = require('cookie-parser');
const cors = require('cors')
const pdf = require('pdf-parse');
const { usernames } = require('./usernames.json')
const ajax = async (config) => {
    const request = await fetch(config.url, {
        method: config.method,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(config.payload)
    });
    let response = await request.json();
    return response
}
const genRanHex = size => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');

var fileupload = require("express-fileupload");
app.use(fileupload());

console.log(usernames[0].password)

app.set('view engine', 'ejs');
app.use(session({ secret: 'sdfeuiherhjkgherjkghijertgkf', cookie: { maxAge: 99999999 } }));
app.use(cookieParser());
app.use(cors())

app.get('/', (req, res) => {
    let username = req.session.name;
    let password = req.session.password;

    if (!username) {
        res.render('login.ejs')
    } else {
        ajax({
            method: 'POST',
            url: 'https://praktikiapi-tu58usbg.b4a.run/sessions_get',
            payload: { "user_id": username }
        }).then(response => {
            for (let i = 0; i < usernames.length; i++) {
                if (usernames[i].password === password) {
                    res.render("index.ejs", { name: username, sessions: JSON.stringify(response.response) })
                } else {
                    res.render("login.ejs", { err: "incorrect password" })
                }
            }
        })
    }
})

app.get('/logout', (req, res) => {
    req.session.name = '';
    req.session.password = '';
    return res.redirect('/')
})

app.get('/new_user', (req, res) => {
    console.log(req.query)
    req.session.name = req.query.name;
    req.session.password = req.query.password;
    return res.redirect('/')
})
//Get History
app.get('/chat', (req, res) => {
    const session = req.query.session;
    if (session !== "new") {
        ajax({
            method: 'POST',
            url: 'https://praktikiapi-tu58usbg.b4a.run/chat_get',
            payload: { "user_id": req.session.name, "session_id": session }
        }).then(response => {

            return res.render('chat.ejs', { chats: JSON.stringify(response.response), username: req.session.name, session: session })
        })
    } else {
        return res.render('new_chat.ejs', { username: req.session.name })
    }
})
//Get Chat Response from Model
app.get('/get_response', (req, res) => {
    ajax({
        method: 'POST',
        url: 'https://praktikiapi-tu58usbg.b4a.run/response_get',
        payload: { "user_id": req.query.user_id, "session_id": req.query.session_id, "query": req.query.query }
    }).then(response => {

        return res.send({ text: response.response });
    })
})
//Save PDF reference
app.post('/pdf_save', (req, res) => {
    //console.log({ "user_id": req.body.user_id, "session_id": req.body.session_id, "doc": "result.text", "source": req.files.pdfFile.name })
    try {
        pdf(req.files.pdfFile).then(result => {
            if (result.text == "" || result.text == " ") {
                res.send({ "err": "EMPTY" })
            }
            ajax({
                method: 'POST',
                url: 'https://praktikiapi-tu58usbg.b4a.run/save',
                payload: { "user_id": req.body.user_id, "session_id": req.body.session_id, "doc": result.text, "source_id": genRanHex(6), "source_name": req.files.pdfFile.name, "session_name":req.body.session_name }
            }).then(response => {
                return res.send({ text: "DOCUMENT UPLOADED!" });
            }).catch(err => {
                return res.send({ "err": err })
            })
        })
    }
    catch {
        res.send({ "err": "EMPTY" })
    }
})
//Save Text Reference
app.post('/text_save', (req, res) => {
    //console.log({ "user_id": req.body.user_id, "session_id": req.body.session_id, "doc": "result.text", "source": req.files.pdfFile.name })
    ajax({
        method: 'POST',
        url: 'https://praktikiapi-tu58usbg.b4a.run/save',
        payload: { "user_id": req.body.user_id, "session_id": req.body.session_id, "doc": req.body.text, "source_id": genRanHex(6), "source_name": "TEXT", "session_name":req.body.session_name }
    }).then(response => {
        return res.send({ text: "DOCUMENT UPLOADED!" });
    }).catch(err => {
        return res.send({ "err": err })
    })
})
//Get name of session/source
app.get('/name', (req, res) => {
    if (req.query.type === 'session') {
        ajax({
            method: 'POST',
            url: 'https://praktikiapi-tu58usbg.b4a.run/get_session_name',
            payload: { "session_id": req.query.session_id }
        }).then(response => {
            return res.send({ text: response.response });
        })
    } else {
        console.log(req.query)
        ajax({
            method: 'POST',
            url: 'https://praktikiapi-tu58usbg.b4a.run/get_source_name',
            payload: { "source_id": req.query.source_id }
        }).then(response => {
            return res.send({ text: response.response });
        })
    }
})
app.get("/pdfUpload.svg", (req, res) => {
    res.sendFile(__dirname + "/pdfUpload.svg")
})
app.get("/send.svg", (req, res) => {
    res.sendFile(__dirname + "/send.svg")
})
app.get("/text.svg", (req, res) => {
    res.sendFile(__dirname + "/text.svg")
})
app.get("/user.svg", (req, res) => {
    res.sendFile(__dirname + "/user.svg")
})
app.listen(port, () => {
    console.log(`listening on port ${port}`)
})
