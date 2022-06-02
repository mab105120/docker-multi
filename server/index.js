const keys = require('./keys');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const redis = require('redis');

const app = express();
app.use(cors()); // so that the server allows connections from machines other than the one it's running on
app.use(bodyParser.json());

const pgClient = new Pool({
    host: keys.pgHost,
    user: keys.pgUser,
    password: keys.pgPassword,
    database: keys.pgDatabase,
    port: keys.pgPort
});

pgClient.on('connect', (client) => { 
    client.query('CREATE TABLE IF NOT EXISTS values (number INT)')
    .catch(err => console.error(err));
});

const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000,
});
const redisPublisher = redisClient.duplicate();

// Express route handlers
app.get('/', (req, res) => {
    res.send('Hi!');
});

app.get('/values/all', async (req, res) => {
    const values = await pgClient.query('SELECT * FROM VALUES');
    res.send(values.rows);
});

app.get('/values/current', (req, res) => { 
    redisClient.hgetall("values", (err, values) => { 
        res.send(values);
    });
});

app.post('/values', async (req, res) => { 
    index = req.body.index;
    if (index > 40) {
        return res.status(402).send('Index is too high!');
    }
    redisClient.hset('values', index, 'PENDING_VALUE_CALC');
    redisPublisher.publish('insert', index);
    pgClient.query('INSERT INTO VALUES(number) VALUES($1)', [index]);

    res.send({ working: true });
});

app.listen(5000, (err) => { 
    console.log('Listening');
    if (!err) {
        console.error(err);
    }
});
