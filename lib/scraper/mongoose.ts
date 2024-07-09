import mongoose from 'mongoose';

let isConnecyed = false;

export const connectToDB = async () => {
    mongoose.set('strictQuery', true);

    if(!process.env.MONGODB_URI) return console.error('MongoDB URI is not provided');

    if(isConnecyed) return console.log('Using existing connection');

    try {
        await mongoose.connect(process.env.MONGODB_URI)

        isConnecyed = true;
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error(error);
        
    }
}