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
        const users = database.collection("users")
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

    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("Running  Server");
})

app.listen(port, () => {
    console.log("Running  Server on port", port);
})