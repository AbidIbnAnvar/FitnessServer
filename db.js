// const mongoose = require('mongoose')

// module.exports =()=> {
//     const connectionParams = {
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//     }
// };
// try {
//     mongoose.connect(process.env.DB, connectionParams);
//     console.log("Connected to database successfully");
// } catch(error){
//     console.log(error);
//     console.log("could not connect to database!")

// }

const mongoose= require('mongoose')
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://abidb220004cs:B220004CS@cluster0.faiyfm0.mongodb.net/User?retryWrites=true&w=majority";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  useNewUrlParser: true,
  useUnifiedTopology: true
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");


  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

const newSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
})

async function connect() {
  const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  const db = client.db('User');
  const collection = db.collection('User');
  return collection;
}

module.exports = connect;

const collection = mongoose.model("collection", newSchema)

module.exports = collection