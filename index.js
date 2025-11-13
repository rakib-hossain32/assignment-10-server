const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// YgITan3t76B1D2uB;

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zneri.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const database = client.db("movie_master_pro");
    const moviesCollection = database.collection("movies");
    const usersCollection = database.collection("users");
    const watchlistCollection = database.collection('watchlist')

    // get user's own movies
    app.get("/movies/my-collection", async (req, res) => {
      try {
        const email = req.query.addedBy;

        if (!email) {
          return res.status(400).send({ message: "Email is required" });
        }

        const query = { addedBy: email };
        const result = await moviesCollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        // console.error(error);
        res.status(500).send({ message: "Server Error" });
      }
    });

    // filter
    app.get("/movies/filter", async (req, res) => {
      try {
        const filterGenres = req.query.genres
          ? req.query.genres
              .split(",")
              .map((g) => g.toLowerCase().trim())
              .filter(Boolean)
          : [];

        const minRating = parseFloat(req.query.minRating) || 0;
        const maxRating = parseFloat(req.query.maxRating) || 10;

        const query = {
          ...(filterGenres.length > 0 && {
            genre: { $in: filterGenres },
          }),
          rating: { $gte: minRating, $lte: maxRating },
        };

        const movies = await moviesCollection.find(query).toArray();
        res.send(movies);
      } catch (error) {
        // console.error(error);
        res.status(500).send({ message: "Server Error" });
      }
    });

    // get all movies
    app.get("/movies", async (req, res) => {
      // console.log(req.query);

      try {
        const result = await moviesCollection.find().toArray();
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Server Error" });
      }
    });

    // get one movie
    app.get("/movies/:id", async (req, res) => {
      // console.log(req.params);
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await moviesCollection.findOne(query);
        res.send(result);
      } catch (error) {
        // console.error(error);
        res.status(500).send({ message: "Server Error" });
      }
    });

    // add movie
    app.post("/movies", async (req, res) => {
      try {
        const result = await moviesCollection.insertOne(req.body);
        res.status(201).send(result);
      } catch (error) {
        // console.error(error);
        res.status(500).send({ message: "Server Error" });
      }
    });

    // update movie
    app.patch("/movies/update/:id", async (req, res) => {
      const id = req.params.id;
      const updateMovie = req.body;
      // console.log(id, updateMovie);
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: updateMovie,
      };
      const result = await moviesCollection.updateOne(query, update);
      res.send(result);
    });

    // delete movie
    app.delete("/movies/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await moviesCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Server Error" });
      }
    });

    // watch list related

    // get all watch list
    app.get("/watchlist", async (req, res) => {
      try {
        const result = await watchlistCollection.find().toArray();
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Server Error" });
      }
    });

    // create watch list
    app.post("/watchlist-create", async (req, res) => {
      try {
        const result = await watchlistCollection.insertOne(req.body);
        res.status(201).send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Server Error" });
      }
    });

    // user related

    // get all users
    app.get("/users", async (req, res) => {
      try {
        const result = await usersCollection.find().toArray();
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Server Error" });
      }
    });


    // user post
    app.post("/users-create", async (req, res) => {
      try {
        const newUser = req.body;
        // console.log(newUser)
        const email = newUser.email;
        const query = { email: email };
        const exitingUser = await usersCollection.findOne(query)
        // console.log(Boolean(exitingUser));
        if (exitingUser) {
          res.send({ message: "user already exit" });
        } else {
          const result = await usersCollection.insertOne(newUser);
          res.status(201).send(result);
        }
      } catch (error) {
        // console.error(error);
        res.status(500).send({ message: "Server Error" });
      }
    });



    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(port, () => {
  console.log(`Smart server is running on port: ${port}`);
});
