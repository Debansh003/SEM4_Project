import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

let server = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

server.use(express.urlencoded({ extended: false }))

// server.use(express.static(path.join(__dirname, 'public')));

server.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
})
server.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'about.html'));
})
server.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'contact.html'));
})
server.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
})
server.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'signup.html'));
})


server.post('/contact-submit', (req, res) => {
    fs.readFile('contact.txt', 'utf-8', (err, data) => {
        if (err) console.log(err)
        else {
            let contact_query = JSON.parse(data)
            contact_query.push(req.body)
            fs.writeFile('contact.txt', JSON.stringify(contact_query), (err) => {
                if (err) console.log(err)
                else {
                    res.sendFile(path.join(__dirname, 'contact.html'));
                }
            })
        }
    })
});
server.post('/login-submit', (req, res) => {
    fs.readFile('login.txt', 'utf-8', (err, data) => {
        if (err) console.log(err)
        else {
            let contact_query = JSON.parse(data)
            contact_query.push(req.body)
            fs.writeFile('login.txt', JSON.stringify(contact_query), (err) => {
                if (err) console.log(err)
                else {
                    res.sendFile(path.join(__dirname, 'login.html'));
                }
            })
        }
    })
});
// server.post('/signup-submit',(req,res)=>{
//     fs.readFile('signup.txt','utf-8',(err,data)=>{
//         if(err) console.log(err)
//             else{
//         let contact_query=JSON.parse(data)
//     contact_query.push(req.body)
// fs.writeFile('signup.txt',JSON.stringify(contact_query),(err)=>{
//     if(err) console.log(err)
//         else{
//     res.sendFile(path.join(__dirname, 'signup.html'));
// }
//             })}
//     })
// });

server.post('/signup-submit', (req, res) => {
    fs.readFile('signup.txt', 'utf-8', (err, data) => {
        let users = [];

        if (!err && data) {
            try {
                users = JSON.parse(data);
            } catch { }
        }

        const exists = users.find(user => user.email === req.body.email);

        if (exists) {
            return res.send(`
                <script>
                    alert("User already exists! Please login.");
                    window.location.href = "/login";
                </script>
            `);
        }

        users.push(req.body);

        fs.writeFile('signup.txt', JSON.stringify(users), (err) => {
            if (err) console.log(err);
            else {
                res.send(`
                    <script>
                        alert("Signup successful!");
                        window.location.href = "/";
                    </script>
                `);
            }
        });
    });
});


server.listen(3000, () => {
    console.log("Server: http://localhost:3000")
})




