require('dotenv').config()

const express = require('express')
const path = require('path')

const app = express()
const port = process.env.port || 3000

app.use(express.static('public'))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/public/index.html'));
})

app.listen(port, () => {
  console.log(`🥪 sammy open @ ${port}`)
})
