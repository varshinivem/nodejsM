const http = require('http');
const fs = require('fs');
const url = require('url');
const MongoClient = require('mongodb').MongoClient;


const mongoUri = 'mongodb+srv://varshini:Password123@atlascluster.xd0yebp.mongodb.net/?retryWrites=true&w=majority';
const client = new MongoClient(mongoUri, {
  serverSelectionTimeoutMS: 10000,
});


const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET',
  'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
};

const server = http.createServer(async (req, res) => {
  const requestUrl = url.parse(req.url);
  const pathname = requestUrl.pathname;

  if (pathname === '/') {
    const filePath = './public/index.html';
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Failed to fetch the index.html.');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      }
    });
  } else if (pathname === '/api' && req.method === 'GET') {
    try {
      
      await client.connect();
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Failed to connect to the database');
      return; 
    }

    try {
      const collection = client.db('Booksdatabase').collection('books');
      const stateDetails = await collection.find({}).toArray();
      const stateDetailsJson = JSON.stringify(stateDetails, null, 2);

      fs.writeFile('./public/db.json', stateDetailsJson, 'utf8', (err) => {
        if (err) {
          console.error(err);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Failed to fetch the data');
        } else {
          res.writeHead(200, corsHeaders);
          res.end(stateDetailsJson);
        }
      });
    } catch (error) {
      console.error('Error fetching data from MongoDB:', error);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Failed to fetch data from the database');
    } finally {
      
      await client.close();
    }
  }
});

const PORT = process.env.PORT || 5959;
server.listen(PORT, () => console.log(`Server is running at port: ${PORT}`));
