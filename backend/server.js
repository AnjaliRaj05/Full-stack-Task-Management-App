const express = require('express');
const cors = require('cors')
const app = express();
require('dotenv').config();
const connectDB = require('./config/db')
const PORT = process.env.PORT || 5001;
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
connectDB();

app.use(express.json());

app.use(cors({
    origin: "*"
}))

app.get('/',(req,res) => {
    res.status(200).json({message:"API is running..."})
})
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tasks', taskRoutes);

app.listen(PORT,()=>{
    console.log(`Listening on port: ${PORT}`)
})