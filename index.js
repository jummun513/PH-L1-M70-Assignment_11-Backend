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


function verifyJwt(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: "Unauthorized access" });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' })
        }
        // console.log('decoded', decoded);
        req.decoded = decoded;
    })
    next();
}


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
            // const query = { email: data.email };
            const query = { _id: new ObjectId(data._id) };;
            const update = {
                $set: {
                    wishedItemId: data.wishedItemId,
                }
            };
            const options = { upsert: true };
            console.log(data);
            const result = await userData.updateOne(query, update, options);
            res.send(result);
            console.log(`A document was inserted with the _id: ${result.insertedId}`);
        });

        // find single userData from users 
        app.get('/user/:emailNo', verifyJwt, async (req, res) => {
            // const decodedEmail = req?.decoded?.email;
            // console.log(decodedEmail);
            // const authrize = req.headers.authorization;
            // console.log(authrize);
            const key = req.params.emailNo;
            // if (key === decodedEmail) {
            const query = { email: key };
            const user = await userData.findOne(query);
            res.send(user);
            // }
            // else {
            // res.status(403).send({ message: "Forbidden Access" });
            // }
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