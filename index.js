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
        const usersReview = database.collection("users_review")
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
            const result = await bookedProperties.find({}).toArray();
            res.send(result)
        })

        //GET API for Booked ITems
        app.get('/bookedproperties/:email', async (req, res) => {
            const email = req.params.email;
            const result = await bookedProperties.find({ email: { $regex: email } }).toArray();
            res.send(result);
        })
        //Review GET API
        app.get('/reviews', async (req, res) => {
            const result = await usersReview.find({}).toArray();
            res.send(result)
        })
        //Admin status checking
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.send({ admin: isAdmin })
        })

        //POST API
        app.post('/bookedproperties', async (req, res) => {
            const item = req.body
            const result = await bookedProperties.insertOne(item);
            res.send(result);
        })

        //POST API for review
        app.post('/reviews', async (req, res) => {
            const review = req.body
            const result = await usersReview.insertOne(review)
            res.send(result)
        })
        //User POST API
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.send(result);
        });
        //User PUT API
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        });
        //Admin role
        app.put('/users/:email', async (req, res) => {
            const user = req.params;
            const filter = { email: user.email };
            const found = await usersCollection.findOne(filter)
            if (found?.role) {
                res.send({ isAdmin: true });
                return;
            }
            const updateRole = {
                $set: {
                    role: 'admin'
                }
            }
            const options = { upsert: true };
            const result = await usersCollection.updateOne(filter, updateRole, options);
            res.send(result);
        });
        //Update order status
        app.put('/bookedproperties/:id', async (req, res) => {
            const id = req.params.id
            const reqStatus = req.body.status
            const filter = { _id: ObjectId(id) }
            // const option = { upsert: true }
            const updatedStatus = {
                $set: {
                    status: reqStatus
                }
            }
            const result = await bookedProperties.updateOne(filter, updatedStatus)
            res.send(result);
        })

        //Delete API for booked item
        app.delete('/bookedproperties/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await bookedProperties.deleteOne(query);
            res.json(result);
        })

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