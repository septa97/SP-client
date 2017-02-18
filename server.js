'use strict';

const express = require('express');
const app = express();
const port = 8080;

app.use(express.static(process.cwd()));
app.listen(port);

console.log('Serving static files at', process.cwd(), 'in port', port);
