const express = require("express");
const cors = require("cors");

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// console.log(process.env.DB_USER);

// database connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.czp86h0.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 }); 

async function run(){
    try {
        const serviceCOllection = client.db("alphaTourDbUser").collection("services");

        app.get('/services', async(req, res)=>{
            const query = {};
            const cursor = serviceCOllection.find(query);
            const services = await cursor.limit(3).toArray();
            res.send(services);
        });
        
        app.get('/allServices', async(req, res)=>{
            const query = {};
            const cursor = serviceCOllection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });

        app.get('/services/:id', async(req, res)=>{
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCOllection.findOne(query);
            res.send(service)
        });

        
        
    } finally {
    // await client.close();
    }
}
run().catch(err => console.log(err));


app.get('/', (req, res) => {
    res.send('Hello from alpha tour server')
});

app.listen(port, () =>{
    console.log(`Alpha tour server is running on port ${port}`);
})