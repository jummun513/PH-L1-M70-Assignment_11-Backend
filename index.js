const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

// use middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@cluster0.03hem.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const database = client.db("Auto_Hive");
        const carData = database.collection("car_data");
        const userData = database.collection("Users");

        // get all data
        app.get('/cars', async (req, res) => {
            const query = {};
            const cursor = carData.find(query);
            const cars = await cursor.toArray();
            res.send(cars);
        });

        // find single data of car 
        app.get('/car/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(`${id}`) };
            const car = await carData.findOne(query);
            res.send(car);
        });

        // update data 
        app.post('/update-car/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(`${id}`) };
            const updateDoc = {
                $set: req.body,
            };
            const result = await carData.updateOne(query, updateDoc);
            const find = await carData.findOne(query);
            res.send(find);
            // console.log(
            //     `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`,
            // );
        });


        // insert a data
        app.post('/cars', async (req, res) => {
            const data = req.body;
            const result = await carData.insertOne(data);
            res.send(result);
            console.log(`A document was inserted with the _id: ${result.insertedId}` || `${result.matchedCount} document(s) matched the filter`);
        });


        // delete a data
        app.delete('/car/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await carData.deleteOne(query);
            res.send(result);
            if (result.deletedCount === 1) {
                console.log("Successfully deleted one document.");
            } else {
                console.log("No documents matched the query. Deleted 0 documents.");
            }
        });


        // Insert or update users
        app.post('/users', async (req, res) => {
            const data = req.body;
            const query = { email: data.email };
            const update = { $set: data };
            const options = { upsert: true };
            console.log(data);
            const result = await userData.updateOne(query, update, options);
            res.send(result);
            console.log(`A document was inserted with the _id: ${result.insertedId}`);
        });


        // JWT auth
        app.post('/login', (req, res) => {
            const user = req.body;
            const access = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            })
            res.send(access);
        })


        console.log("You successfully connected to MongoDB!");
    }

    finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send("Server starts to running");
});


app.listen(port, () => {
    console.log('Listening to port', port);
});