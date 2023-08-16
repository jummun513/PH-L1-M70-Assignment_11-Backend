const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send("Server starts to running.");
});

app.get('/carData', (req, res) => {
    res.send("");
});

app.listen(port, () => {
    console.log('Listening to port', port);
});