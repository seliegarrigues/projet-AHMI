import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async () => {
  try {
    // Vérifiez que l'URI est bien chargé
    if (process.env.NODE_ENV !== "production") {
      const masked = process.env.MONGODB_URI.replace(
        /\/\/([^:]+):([^@]+)@/,
        "//$1:***@"
      );
      console.info("Tentative de connexion MongoDB:", masked);
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.info("  Connecté à MongoDB");
  } catch (err) {
    console.error("  Erreur de connexion à MongoDB :", err);

    process.exit(1);
  }
};

export default connectDB;
