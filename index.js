import { createServer } from "http"
import { Server } from "socket.io"
import bodyParser from "body-parser"
import express from "express"
import { create } from 'express-handlebars';
import path from "path"
import {getRandomElement, isAuthorized} from "./helpers.js"
import DbHandler from "./db.js"
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.resolve()
const app = express()

const hbs = create({
  defaultLayout: false,
  layoutsDir: path.join(app.get('views'), 'layouts'),
  partialsDir: path.join(app.get('views'), 'partials'),
  defaultLayout: "default"
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

const publicPath = path.join(__dirname, 'public');
app.use('/', express.static(publicPath));

app.use(bodyParser.json())

const httpServer = createServer(app)
const io = new Server(httpServer)

const dbURL = `mongodb://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_IP}:${process.env.MONGODB_PORT}`
const dbName = "programming_langs"

const db = new DbHandler(dbURL, {
  tls: true,
  tlsAllowInvalidCertificates: true,
  authMechanism: "PLAIN",
})

await db.connect(dbName)

io.on('connection', (socket) => {
  console.log('client connected')
})

app.get('/rounds/:round_name', async(req, res) => {
  try {
    const roundData = await db.findOne("rounds", {name: req.params.round_name})

    res.render('roulette', {name: roundData.name, options: roundData.options})
  }catch (err) {
    res.sendStatus(404)
  }
})

app.post('/api/rounds/:round_name/spinit', isAuthorized, async (req, res) => {
  const roundData = await db.findOne("rounds", {name: req.params.round_name}, {_id: 0})
  const selectedItem = getRandomElement(roundData.options)
  io.emit("spinThatThing", selectedItem)

  res.send("spinning...")
})

app.get('/api/rounds', async (req, res) => {
  const roundItems = await db.findAll("rounds", {_id: 0})

  res.json(roundItems)
})

app.post('/api/rounds', isAuthorized, async(req, res, next) => {
  try {
    const roundName = req.body.name
    const roundData = req.body.data

    if (await db.documentExists("rounds", {name: roundName})) {
      return res.status(400).send({error: "Round name already exists"})
    }
    
    const insertion = await db.insertOne("rounds", {name: roundName, options: roundData})

    res.send(insertion.insertedId)
  } catch(err) {
    console.log(err)
    res.status(500).json({ error: 'Something failed!' })
  }
})

app.get('/api/rounds/:round_name', async (req, res) => {
  const roundData = await db.findOne("rounds", {name: req.params.round_name}, {_id: 0})
  res.json(roundData)
})

app.use((req, res, next) => {
  res.status(404).render('404')
})

httpServer.listen(3000)
