const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const app = express();
const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 5000;


//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.youri.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();

        const database = client.db("real_estate");
        const properties = database.collection("properties")
        const bookedProperties = database.collection("booked_properties")
        const usersCollection = database.collection("users")
        //GET API
        app.get('/properties', async (req, res) => {
            const result = await properties.find({}).toArray();
            res.send(result);
        })
        //GET API
        app.get('/properties/:id', async (req, res) => {
            const query = { _id: ObjectId(req.params.id) };
            const result = await properties.findOne(query);
            res.send(result);
        })
        //GET API for ordered item
        app.get('/bookedproperties', async (req, res) => {

        })

        //POST API
        app.post('/bookedproperties', async (req, res) => {
            const item = req.body
            const result = await bookedProperties.insertOne(item);
            res.send(result);
        })
        //User POST API
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });
        //User PUT API
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("Running  Server of Real Estate");
})

app.listen(port, () => {
    console.log("Running  Server on port", port);
})