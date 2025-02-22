import mongoose, { Schema, Document } from 'mongoose';

// Define the interface for the User model
interface IUser extends Document {
  username: string;
  email: string;
  password: string; // New field for password
  fullname: string; // New field for full name
  roles: mongoose.Types.ObjectId[]; // Array of Role references
  lastmailsent: Date; 
}

// Create the schema for the User model
const userSchema: Schema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true }, // New field for password
  fullname: { type: String, required: true }, // New field for full name
  roles: [{ type: Schema.Types.ObjectId, ref: 'Role' }], // Reference to Role model
  lastmailsent: { type: Date } 
}, { timestamps: true });

// Create the model
const User = mongoose.model<IUser>('User', userSchema);

export default User;
