var request = require("request");

var routes = function (app) {
  //Main
  app.get('/', function(req, res){
    res.render('index.html');
  });

  //Login
  app.post('/login', function(req, res){

    req.checkBody('name', 'Nome inválido').notEmpty();
    req.checkBody('email', 'Email inválido').isEmail();
    req.checkBody('tel', 'Telefone inválido').isInt();
    req.checkBody('login', 'Login inválido').notEmpty();
    req.checkBody('pass', 'Senha inválida').notEmpty();

    var errors    = req.validationErrors(),
        mapErrors = req.validationErrors(true);

    if (!errors) {
      request({
        url: "http://195.235.93.67:8080/secure/m2m/v2/user/login?organization=1&permissions=idas",
        headers: {
          'Content-Type' : 'application/x-www-form-urlencoded',
          'Authorization': 'M2MUser ' + req.body.login + '%3A' + req.body.pass
        }
      }, function (error, response, body) {
        if (!error && response.statusCode === 200) {

          request({
            rejectUnauthorized: false,
            url: "https://int.dca.tid.es/m2m/v2/services/brasilTest/assets/KITiot-01",
            method: "PUT",
            body: JSON.stringify({ "UserProps": [
              { "name": "nome", "value": req.body.name },
              { "name": "email", "value": req.body.email },
              { "name": "tel", "value": req.body.tel }
            ] })
          }, function (e, r, b) {

            res.send(body);
          });

        } else if (!error && response.statusCode === 401) {
          res.send(body);

        } else {
          res.send({ error: error });
        }
      });
    } else {
      res.send({
        errors: errors,
        mapErrors: mapErrors
      });
    }
  });
};

module.exports = routes;
