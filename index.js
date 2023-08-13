const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express')
const cors = require('cors')
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000

//middlewere
app.use(express.json())
app.use(cors())

const name = process.env.MONGO_USER
const password = process.env.MONGP_PASS
const uri = `mongodb+srv://${name}:${password}@cluster0.oqkryfl.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const dataCollection = client.db('snapSanle').collection('data')
const cartCollection = client.db('snapSanle').collection('cart')
const userCollection = client.db('snapSanle').collection('user')

async function run() {
    try {
        await client.connect();

        app.get('/category/:category', async (req, res) => {
            const { category } = req.params 
            const  query = {category:category} 
            const data = await dataCollection.find(query).toArray()
            res.send(data)
        })

        app.get('/id/:category/:id', async (req, res) => {
            const params = req.params.id
            const id = { _id: new ObjectId(params) }
            const data = await dataCollection.findOne(id)
            res.send(data)
        })

        app.post('/cart', async (req, res) => {
            const data = req.body
            const cart = await cartCollection.insertOne(data)
            res.send(cart)
        })

        app.get('/cart', async (req, res) => {
            const cartData = await cartCollection.find().toArray()
            res.send(cartData)
        })

        app.delete('/cart/:id', async (req, res) => {
            const id = { _id: new ObjectId(req.params.id) }
            const deleted = await cartCollection.deleteOne(id)
            res.send(deleted)
        })

        app.post('/user', async (req, res) => {
            const userData = req.body
            const user = await userCollection.insertOne(userData)
            res.send(user)
        })

    } finally {

    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('server is running')
})

app.listen(port, () => {
    console.log('server run on 5000 port')
})