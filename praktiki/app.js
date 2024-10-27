const express = require('express')
const app = express()
const port = 80
const session = require('express-session')
const axios = require('axios');
const cookieParser = require('cookie-parser');
const cors = require('cors')
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

console.log(usernames[0].password)

app.set('view engine', 'ejs');
app.use(session({ secret: 'sdfeuiherhjkgherjkghijertgkf', cookie: { maxAge: 99999999 } }));
app.use(cookieParser());
app.use(cors())

app.get('/', (req, res) => {
    let username = req.session.name;
    let password = req.session.password;

    if (!username) {
        res.render('new.ejs')
    } else {
        ajax({
            method: 'POST',
            url: 'https://praktikiapi-tu58usbg.b4a.run/sessions_get',
            payload: { "user_id": username }
        }).then(response => {
            if (response.response[0]) {
                for (let i = 0; i < usernames.length; i++) {
                    if (usernames[i].password === password) {
                        res.render("index.ejs", { name: username, sessions: response.response })
                    } else {
                        res.render("new.ejs", { err: "incorrect password" })
                    }
                }
            } else {
                res.render("new.ejs", { err: "no such username exists" })
            }
        })
    }
})

app.get('/logout', (req, res) => {
    req.session.name = '';
    req.session.password = '';
    return res.redirect('/')
})

app.post('/submit', async (req, res) => {
    const text = req.query.doc_text;
    const name = req.query.doc_name;
    console.log(text)
    fetch("https://praktikiapi-tu58usbg.b4a.run/save",
        {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify({
                user_id: req.session.name,
                session_id: name,
                doc: text,
                source: name
            })
        })
        .then(function (res) { console.log(res) })
        .catch(function (res) { console.log(res) })

    return res.redirect('/chat')
})

app.get('/new_user', (req, res) => {
    console.log(req.query)
    req.session.name = req.query.name;
    req.session.password = req.query.password;
    return res.redirect('/')
})

app.get('/chat', (req, res) => {
    const session = req.query.session;
    if (session !== "new") {
        ajax({
            method: 'POST',
            url: 'https://praktikiapi-tu58usbg.b4a.run/chat_get',
            payload: { "user_id": req.session.name, "session_id": session }
        }).then(response => {
            console.log(response.response)
            return res.render('chat.ejs', { chats: response.response, username: req.session.name, session: session })
        })
    } else {
        return res.render('new_chat.ejs', { username: req.session.name })
    }
})

app.get('/request', (req, res) => {
    if (req.query.type === 'input') {
        ajax({
            method: 'POST',
            url: 'https://praktikiapi-tu58usbg.b4a.run/response_get',
            payload: { "user_id": req.query.user_id, "session_id": req.query.session_id, "query": req.query.query }
        }).then(response => {
            console.log(response.response)
            return res.send({ text: response.response });
        })
    } else {
        console.log(req.query)
        ajax({
            method: 'POST',
            url: 'https://praktikiapi-tu58usbg.b4a.run/save',
            payload: { "user_id": req.query.user_id, "session_id": req.query.session_id, "doc": req.query.query, "source": `blank_for_now(${Math.random() * 12213443})` }
        }).then(response => {
            console.log(response.response)
            return res.send({ text: "DOCUMENT UPLOADED!" });
        })
    }
})

app.listen(port, () => {
    console.log(`listening on port ${port}`)
})