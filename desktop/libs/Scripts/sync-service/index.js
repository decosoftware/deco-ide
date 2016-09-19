var server = require('http').createServer()
  , url = require('url')
  , express = require('express')
  , app = express()
  , cors = require('cors')
  , WebSocketServer = require('ws').Server
  , port = 4080;

var io = require('socket.io')(4082)
let onImage, onLayout, onActiveScene
let connected = false

io.on('connection', (socket) => {
  connected = true
  onImage = (image, sceneName) => {
    socket.emit('image', { sceneName, image })
  }
  onLayout = (layout, sceneName) => {
    socket.emit('layout', {sceneName, layout })
  }
  onActiveScene = (sceneName) => {
    socket.emit('activeScene', {sceneName})
  }
})

app.use(cors())

var imageForScene = {}
var layoutForScene = {}
var activeScene = null

app.get('/image/:sceneName', function (req, res) {
  res.writeHead(200, {'Content-Type': 'image/png' });
  if (!imageForScene[req.params.sceneName]) {
    res.status(404).end()
    return
  }
  res.end(imageForScene[req.params.sceneName], 'binary')
});

app.get('/layout/:sceneName', function (req, res) {
  if (!layoutForScene[req.params.sceneName]) {
    res.status(404).end()
    return
  }
  res.json(layoutForScene[req.params.sceneName])
})

// IMAGE DATA
var wss = new WebSocketServer({ port: 4081 });

//TODO: document binary protocol
function getHeaderInfo(data) {
  const headerLength = data.readUInt32LE(0)
  const reqType = data.slice(4, 4 + headerLength).toString()
  return {
    reqType,
    headerLength,
  }
}

function getSceneName(buf) {
  let nameLength = buf.readUInt32LE(0)
  buf = buf.slice(4)
  let sceneName = buf.slice(0, nameLength).toString()
  buf = buf.slice(nameLength)
  return {
    sceneName,
    payload: buf.slice(0, buf.length)
  }
}

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(data, flags) {
    try {
      const {reqType, headerLength} = getHeaderInfo(data)
      let buf = data.slice(4 + headerLength)
      switch (reqType) {
        case 'image': {
          const {sceneName: imageScene, payload: image} = getSceneName(buf)
          imageForScene[imageScene] = image
          if (activeScene == null) {
            activeScene = imageScene
          }
          if (connected && imageScene == activeScene) {
            onImage(imageForScene[imageScene], imageScene)
          }
          break;
        }
        case 'layout': {
          const {sceneName: layoutScene, payload: jsonData} = getSceneName(buf)
          const stringJSON = jsonData.toString()
          layoutForScene[layoutScene] = JSON.parse(stringJSON)
          if (activeScene == null) {
            activeScene = layoutScene
          }
          if (connected && layoutScene == activeScene) {
            onLayout(layoutForScene[layoutScene], layoutScene)
          }
          break;
        }
        case 'activeScene': {
          const { sceneName: _activeScene } = getSceneName(buf)
          activeScene = _activeScene
          if (connected) {
            onActiveScene(activeScene)
          }
          break;
        }
        default:
          console.log('received unknown req type')
      }
    } catch (e) {
      console.error(e)
    }
  });
});

console.log('ws listening on 4081')

server.on('request', app);
server.listen(port, function () { console.log('Listening on ' + server.address().port) });
