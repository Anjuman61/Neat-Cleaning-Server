const express = require('express')
const cors = require('cors');
require('dotenv').config();
const bodyParser = require('body-parser');
const ObjectID = require('mongodb').ObjectID;
const app = express()
const port = 4000
const MongoClient = require('mongodb').MongoClient;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qrzim.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello World!')
})


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const serviceCollection = client.db("neatAndClean").collection("services");
  const bookingCollection = client.db("neatAndClean").collection("bookings");
  const reviewCollection = client.db("neatAndClean").collection("review");
  const adminCollection = client.db("neatAndClean").collection("admin");

 console.log('error', err)

 app.get('/services',(req, res)=>{  
  serviceCollection.find({})
  .toArray((err, document)=>{
      res.send(document);
  })
})

 app.post('/addServices', (req, res) => {
  const newService = req.body;
  console.log('adding new service: ', newService)
  serviceCollection.insertOne(newService)
  .then(result => {
      console.log('inserted count', result.insertedCount);
      res.send(result.insertedCount > 0)
  })
})

app.get('/booking/:id',(req,res)=>{
  serviceCollection.find({_id:ObjectID(req.params.id)})
  .toArray((err,document)=>{
      res.send(document[0])
  })
})

app.post('/addBooking', (req, res)=>{
  const newBooking = req.body;
  bookingCollection.insertOne(newBooking)
  .then(result =>{
    console.log('inserted bookingCount', result.insertedCount);
      res.send(result.insertedCount>0)
  })
  console.log(newBooking)
})

app.post('/addReview', (req, res) => {
  const review = req.body;
  console.log('adding review: ', review)
  reviewCollection.insertOne(review)
  .then(result => {
      console.log('inserted count', result.insertedCount);
      res.send(result.insertedCount > 0)
  })
})

app.get('/reviews',(req, res)=>{  
  reviewCollection.find({})
  .toArray((err, document)=>{
      res.send(document);
  })
})

app.delete('/service/:id', (req, res) => {
  const id = ObjectID(req.params.id);
  serviceCollection.findOneAndDelete({_id: id})
  .then(data => {
      console.log(data)
      res.send({success: !!data.value})
  })
});

app.post('/bookings', (req, res)=>{

  const email = req.body.email;
  adminCollection.find({email:email})
  .toArray((err, admin)=>{
      if(admin.length ===0){
        bookingCollection.find({email})
        .toArray((err, document)=>{
            res.send(document)
        })
      }
      else{
        bookingCollection.find({})
        .toArray((err, document)=>{
            res.send(document)
        })
      }
    })
})


app.post('/isAdmin',(req, res)=>{  
  const email = req.body.email;
  console.log(email)
  adminCollection.find({email:email})
  .toArray((err, admin)=>{
      res.send(admin.length > 0);
  })
})

app.post('/addAdmin', (req, res) => {
  const newAdmin = req.body;
  console.log('adding new Admin: ', newAdmin)
  adminCollection.insertOne(newAdmin)
  .then(result => {
      console.log('inserted count', result.insertedCount);
      res.send(result.insertedCount > 0)
  })
})

app.get('/admins',(req, res)=>{  
  adminCollection.find({})
  .toArray((err, document)=>{
      res.send(document);
  })
})

app.patch('/update/:id',(req,res)=>{
  console.log(req.body.bookings)
  const id = ObjectID(req.params.id);
  bookingCollection.updateOne({_id: id},
    {
      $set:{status:req.body.bookings}
    })
    .then(result=>{
      console.log(result)
      res.send({success: !!result.value})
    })
 
})




});

app.listen(process.env.PORT || port)