var express = require("express")
var path = require("path");
var app = express();


app.use('/models', express.static('models'));

app.get('/script', (req,res)=> {
    res.sendFile(path.join(__dirname,'/script.js'))
})

app.get('/scriptImage', (req, res) => {
    res.sendFile(path.join(__dirname,'/scriptImage.js'))
})
app.get('/facesapi', (req, res) => {
    res.sendFile(path.join(__dirname,'/face-api.min.js'))
})
app.get("/video", (req, res) => {
    res.sendFile(__dirname + '/views/index.html')
})

app.listen(3000, () => {
    console.log("Sever is running on 3000")
})