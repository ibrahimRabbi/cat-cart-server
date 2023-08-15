const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express')
const cors = require('cors')
const SSLCommerzPayment = require('sslcommerz-lts')
const store_id = 'catca64d91c607f7fc'
const store_passwd = 'catca64d91c607f7fc@ssl'
const is_live = false //true for live, false for sandbox
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


//payment getway api
        app.post("/payment", async (req, res) => {
            const transection_id = new ObjectId().toString()
          
            const data = {
                total_amount: req.body.amount,
                currency: req.body.currency,
                tran_id: transection_id,  
                success_url: `http://localhost:5000/payment/success/${transection_id}`,
                fail_url: 'http://localhost:3030/fail',
                cancel_url: 'http://localhost:3030/cancel',
                ipn_url: 'http://localhost:3030/ipn',
                shipping_method: 'Courier',
                product_name: 'Computer.',
                product_category: 'Electronic',
                product_profile: 'general',
                cus_name: req.body.name,
                cus_email: req.body.email,
                cus_add1: 'Dhaka',
                cus_add2: 'Dhaka',
                cus_city: 'Dhaka',
                cus_state: 'Dhaka',
                cus_postcode: '1000',
                cus_country: 'Bangladesh',
                cus_phone: req.body.phone,
                cus_fax: '01711111111',
                ship_name: 'Customer Name',
                ship_add1: 'Dhaka',
                ship_add2: 'Dhaka',
                ship_city: 'Dhaka',
                ship_state: 'Dhaka',
                ship_postcode: 1000,
                ship_country: 'Bangladesh',
            };

            const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
            sslcz.init(data)
                .then(apiResponse => {   
                let GatewayPageURL = apiResponse.GatewayPageURL
                res.send({url:GatewayPageURL})            
                });
            
            app.post('/payment/success/:id', async (req, res) => {
                const id = req.params.id;
                res.redirect(`http://localhost:5173/payment/success/${id}`)
            })
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