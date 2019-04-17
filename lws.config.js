module.exports = {
  "port": 8000,
   "rewrite": [
    { "from": "/otp/*", "to": "http://ottuplo:8080/otp/$1" },
    { "from": "/suggest*", "to": "http://geococker:8082/suggest$1" },
    { "from": "/reverse*", "to": "http://geococker:8082/reverse$1" },
    { "from": "/traffic-events", "to": "https://reporter.5t.torino.it/ws/publish.php?ch=12" },
    { "from": "/traffic-infos", "to": "https://reporter.5t.torino.it/ws/publish.php?ch=10" },
    { "from": "/traffic-layer*", "to": "http://172.21.9.6:8180/geoserver/gwc/service/wms$1" },
    { "from": "/notiziario.mp3", "to": "https://www.muoversinpiemonte.it/notiziario/notiziario.mp3" },

    { "from": "/:user/repos/:name", "to": "https://api.github.com/repos/:user/:name" }
  ]
}
