import mongoose, { Schema, Document } from 'mongoose';

// Define the interface for the Role model
interface IRole extends Document {
  roleName: string;
  users: mongoose.Types.ObjectId[]; // Array of User references
}

// Create the schema for the Role model
const roleSchema: Schema = new Schema({
  roleName: { type: String, required: true },
  users: [{ type: Schema.Types.ObjectId, ref: 'User' }] // Reference to User model
}, { timestamps: true });

// Create the model
const Role = mongoose.model<IRole>('Role', roleSchema);

export default Role;
