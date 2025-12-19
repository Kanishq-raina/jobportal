import mongoose from "mongoose";


const connectDB = async () => {
    mongoose.connection.on('connected', () => console.log('Database Connected'))
<<<<<<< Updated upstream
    await mongoose.connect(process.env.MONGODB_URI);
=======
    await mongoose.connect(`${process.env.MONGODB_URI}`)
>>>>>>> Stashed changes
}
export default connectDB
