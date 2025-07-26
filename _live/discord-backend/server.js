import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import mongoData from './mongoData.js';
import Pusher from 'pusher';

//app config
const app = express();
const port = process.env.PORT || 8002

const pusher = new Pusher({
  appId: "2027868",
  key: "365aa7798284791b4e7e",
  secret: "f5b58978958636b4947b",
  cluster: "us2",
  useTLS: true
});


//middleware helps out the backend to understand the request
app.use(express.json())
app.use(cors());

//db config
const monogoURI = 'mongodb+srv://donaldtong24:ylEUbRNsYeLeoY3h@cluster0.yfo1453.mongodb.net/discordDB?retryWrites=true&w=majority&appName=Cluster0'

mongoose.connect(monogoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    //useCreateIndex: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

//pusher config
mongoose.connection.once('open', () => {
    console.log('DB connected');

    const changeStream = mongoose.connection.collection('conversations').watch();

    changeStream.on('change', (change) => {
        console.log('Change');
        if(change.operationType === 'insert') {
            console.log('new channel');
            pusher.trigger('channels', 'newChannel',{
                'change':change
            });
        } else if (change.operationType === 'update') {
            console.log('new message');
            pusher.trigger('conversation','newMessage',{
                'change': change
            });
        }else{
                console.log('Error triggering Pusher:', change);
            }
    });
});

//api routes
app.get('/', (req,res) => res.status(200).send('Hello World!'));
app.post('/new/channel', async (req, res) => {
    try {
        const dbData = req.body;
        const data = await mongoData.create(dbData);
        res.status(201).send(data);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.get('/get/channelList', async (req, res) => {
    try {
        const data = await mongoData.find();
        
        let channels = [];

        data.map((channelData) => {
            const channelInfo = {
                id: channelData._id,
                name:channelData.channelName
            }
            channels.push(channelInfo);
        })

        res.status(200).send(channels);

    } catch (err) {
        res.status(500).send(err)
    }
});

app.post('/new/message', async (req, res) => {
    try {
        const channelId = req.query.id; // <-- get id from query
        const message = req.body.message; // <-- get message from body

        
        const data = await mongoData.findByIdAndUpdate(
            channelId, 
            { $push: { conversation: message }},
            { new: true }
        );
        
        res.status(200).send(data);
    } catch (err) {
        console.log('Error in /new/message:');
        console.log(err);
        res.status(500).send(err);
    }
});

app.get('/get/data', async (req, res) => {
    try {
        const channelId = req.query.id; // <-- get id from query
        const data = await mongoData.findById(channelId);
        
        if (!data) {
            return res.status(404).send('Channel not found');
        }
        
        res.status(200).send(data);
    } catch (err) {
        console.log('Error in /get/data:');
        console.log(err);
        res.status(500).send(err);
    }
});

app.get('/get/conversation', async (req, res) => {
    try {
        const channelId = req.query.id; // <-- get id from query
        const data = await mongoData.find({_id: channelId});
        res.status(200).send(data);
    }
    catch (err) {
        console.log('Error in /get/conversation:');
        console.log(err);
        res.status(500).send(err);
    }
});
app.get('/get/all', async (req, res) => {
    try {
        const data = await mongoData.find(); // gets all channels with messages
        res.status(200).send(data);
    } catch (err) {
        res.status(500).send(err);
    }
});
//listen
app.listen(port,() => console.log(`Listening on localhost:${port}`));

