const express = require('express');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const { ObjectId } = require('mongodb');
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGO_URI;

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Connect to the MongoDB database
const mongoCollection = client.db('akshanshSinghProfile').collection('akshanshBlog');

// Function to initialize profile data (optional, for testing)
function initProfileData() {
  mongoCollection.insertOne({
    title: 'Welcome to My Dev Profile',
    post: 'This is the first post on my Dev profile. Stay tuned for more updates!',
  });
}

// Uncomment the line below to initialize profile data (run once)
// initProfileData();

// Home route - Render the profile page with blog posts
app.get('/', async function (req, res) {
  try {
    let results = await mongoCollection.find({}).toArray();
    res.render('profile', { profileData: results });
  } catch (err) {
    console.error('Error fetching data:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Route to insert a new blog post
app.post('/insert', async (req, res) => {
  try {
    await mongoCollection.insertOne({
      title: req.body.title,
      post: req.body.post,
    });
    res.redirect('/');
  } catch (err) {
    console.error('Error inserting data:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Route to delete a blog post
app.post('/delete', async (req, res) => {
  try {
    await mongoCollection.findOneAndDelete({
      _id: new ObjectId(req.body.deleteId),
    });
    res.redirect('/');
  } catch (err) {
    console.error('Error deleting data:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Route to update a blog post
app.post('/update', async (req, res) => {
  try {
    await mongoCollection.findOneAndUpdate(
      { _id: ObjectId.createFromHexString(req.body.updateId) },
      {
        $set: {
          title: req.body.updateTitle,
          post: req.body.updatePost,
        },
      }
    );
    res.redirect('/');
  } catch (err) {
    console.error('Error updating data:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Start the server
app.listen(port, () => console.log(`Server is running on ... localhost:${port}`));