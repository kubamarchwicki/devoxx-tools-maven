var express = require('express')
var path = require('path')
var bodyParser = require('body-parser')
var app = express()

app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, process.env.NODE_ENV || 'app')));

app.get('/*', function (req, res) {
  console.log('GET req: ' + req.protocol + '://' + req.get('host') + req.originalUrl)
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(
      [
          {"id": 1, "title":"First todo","order":1,"completed":false},
          {"id": 2, "title":"Second todo - which is done","order":2,"completed":true},
          {"id": 3, "title":"Not done todo","order":3,"completed":false}
      ]
  ));
})

app.all('/*', function(req, res) {
    console.log(req.method + ' req: ' + req.protocol + '://' + req.get('host') + req.originalUrl)
    console.log("  request body: " + JSON.stringify(req.body))
    var echo = req.body
    if (req.body.id === undefined) {
      echo.id = Math.floor(Math.random() * 100) + 1
    }
    res.send(echo)
    res.status(201)
    res.end()
});

var server = app.listen(3000, function () {
  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)

})
