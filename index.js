const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
    res.send('Hello from alpha tour server')
});

app.listen(port, () =>{
    console.log(`Alpha tour server is running on port ${port}`);
})