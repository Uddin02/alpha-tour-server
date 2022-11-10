const express = require("express");
const cors = require("cors");
const jwt = require('jsonwebtoken');
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

function verifyJWT(req, res, next){
    
    const authHeader = req.headers.authorization;
    
    if(!authHeader){
        res.status(401).send({message: 'unauthorized access'})
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
        if(err){
            res.status(401).send({message: 'unauthorized access'})
        }
        req.decoded = decoded;
        next();
    })
}

async function run(){
    try {
        const serviceCOllection = client.db("alphaTourDbUser").collection("services");
        const reviewCollection = client.db("alphaTourDbUser").collection("reviews");
        
        app.post('/jwt', (req, res) =>{
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
            res.send({token}) 
        })

        app.get('/services', async(req, res)=>{
            const query = {};
            const cursor = serviceCOllection.find(query).sort({service_name:1});
            const services = await cursor.limit(3).toArray();
            res.send(services);
        });
        
        app.get('/allServices', async(req, res)=>{
            const query = {};
            const cursor = serviceCOllection.find(query).sort({service_name:1});
            const services = await cursor.toArray();
            res.send(services);
        });

        app.get('/services/:id', async(req, res)=>{
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCOllection.findOne(query);
            res.send(service)
        });

        app.post('/services', async(req, res)=>{
            const review = req.body;
            const result =  await serviceCOllection.insertOne(review);
            res.send(result);
        })
        
        app.get('/reviews', async(req, res)=>{
            const query = {};
            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        });

        app.get('/reviews/:id', async(req, res)=>{
            const id = req.params.id;
            const query = { id: id };
            const cursor =  reviewCollection.find(query);
            const review = await cursor.toArray();
            res.send(review)
        });

        app.post('/reviews', async(req, res)=>{
            const review = req.body;
            const result =  await reviewCollection.insertOne(review);
            res.send(result);
        })

        
        app.get('/review', verifyJWT, async(req, res)=>{
            
            const decoded = req.decoded;
            
            if(decoded.email !== req.query.email){
                res.status(403).send({message: 'unauthorized access'})
            }

            let query = {};
            if(req.query.email){
                query = {
                    email: req.query.email
                }
            }
            const cursor = reviewCollection.find(query);
            const myReview = await cursor.toArray();
            res.send(myReview);
     
        })

        app.delete('/review/:id', async(req,res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await reviewCollection.deleteOne(query);
            res.send(result)
        })

        app.patch('/review/:id', async(req, res)=>{
        const id = req.params.id;
        const updatedReview = req.body.review;
        const query = {_id: ObjectId(id)};
        const updateDoc = {
            $set: {
                review: updatedReview
            },
          };
        const result = await reviewCollection.updateOne(query, updateDoc);
        res.send(result);
    })
        
    
        
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