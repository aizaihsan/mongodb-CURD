const express = require('express');
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
const port = 9000;

const mongodbURL = 'mongodb://localhost:27017/';
const dbName = 'test';
const collectionName = 'users';

// Create a single MongoDB client instance
const client = new MongoClient(mongodbURL);

// Connect to MongoDB when the server starts
async function connectToMongoDB() {
    try {
        await client.connect();
        console.log("Connected successfully to MongoDB");
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        return collection;
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
}

app.use(express.json());

app.get('/', (req, res) => {
    res.send("Welcome to the home page!");
});

// Read all users
app.get('/users', async (req, res) => {
    try {
        const collection = await connectToMongoDB();
        const result = await collection.find({}).toArray();
        res.send(result);
    } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Create a new user
app.post('/users', async (req, res) => {
    try {
        const collection = await connectToMongoDB();
        const newUser = req.body;
        const result = await collection.insertOne(newUser);
        res.status(201).send(result.ops[0]);
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Read a specific user by ID
app.get('/users/:id', async (req, res) => {
    try {
        const collection = await connectToMongoDB();
        const userId = req.params.id;
        const result = await collection.findOne({ _id: new ObjectId(userId) });
        if (!result) {
            res.status(404).send("User not found");
            return;
        }
        res.send(result);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Update a user by ID
app.put('/users/:id', async (req, res) => {
    try {
        const collection = await connectToMongoDB();
        const userId = req.params.id;
        const updatedUserData = req.body;
        const result = await collection.updateOne({ _id: new ObjectId(userId) }, { $set: updatedUserData });
        if (result.modifiedCount === 0) {
            res.status(404).send("User not found");
            return;
        }
        res.status(200).send("User updated successfully");
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Delete a user by ID
app.delete('/users/:id', async (req, res) => {
    try {
        const collection = await connectToMongoDB();
        const userId = req.params.id;
        const result = await collection.deleteOne({ _id: new ObjectId(userId) });
        if (result.deletedCount === 0) {
            res.status(404).send("User not found");
            return;
        }
        res.status(200).send("User deleted successfully");
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.listen(port, () => {
    console.log(`Server running at http://127.0.0.1:${port}/`);
});
