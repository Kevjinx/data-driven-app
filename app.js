const express = require('express')
const routes = require('./routes')
const app = express();
const port = 8420;
app.set('view engine', 'pug');

app.use(routes)


app.listen(port, console.log(`blazing on port: ${port}`))







