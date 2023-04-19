const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require("cookie-parser");
const router = express.Router();
// Controllers
projectDashboard = require('./controllers/projectDashboardCtrl');
systemCheckCtrl = require('./controllers/systemCheckCtrl');

app.use(cors());

// To parse URL encoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// To parse json data
app.use(cookieParser());
app.use(express.static(__dirname + '/dist/sodaexp'));

// Dashboard Route
app.post('/api/checkDashboardStatus', projectDashboard.projectStatus);

//System Check Route 
app.post('/api/checkSystemRequirements', systemCheckCtrl.systemCheck);

app.all('*', function (req, res) {
    res.sendFile('dist/sodaexp/index.html', { root: __dirname });
});

app.listen(3000, () => console.log('SODA Experience server listening on port 3000!'));
