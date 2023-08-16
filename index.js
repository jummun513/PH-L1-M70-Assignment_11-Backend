const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;


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
        const database = client.db("AutoHive");
        const carData = database.collection("carData");

        app.get('/cars', async (req, res) => {
            const query = {};
            const cursor = carData.find(query);
            const data = await cursor.toArray();
            res.send(data);
        });

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