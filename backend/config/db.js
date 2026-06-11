import mongoose from "mongoose";

const connectDB = async () => {
  if (!process.env.MONGO_URL) {
    console.error("❌ MongoDB Connection Error: MONGO_URL environment variable is not defined!");
    console.error("Please add MONGO_URL to your environment variables on Render with your MongoDB Atlas URI.");
    process.exit(1);
  }
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌ MongoDB Connection Error: ${err.message}`);
    process.exit(1);
  }
};

export default connectDB;
