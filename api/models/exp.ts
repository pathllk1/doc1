import mongoose, { Schema, Document } from 'mongoose';

// Define the interface for the exp model
interface IExp extends Document {
  pto: string;
  pdate: Date;
  amt: number; // Use number for decimal values
  mode: string;
  proj: string;
  usern: string; // New field added
}

// Create the schema for the exp model
const expSchema: Schema = new Schema({
  pto: { type: String, required: true },
  pdate: { type: Date, required: true },
  amt: { type: Schema.Types.Decimal128, required: true },
  mode: { type: String, required: true },
  proj: { type: String, required: true },
  usern: { type: String, required: true } // New field added
}, { timestamps: true });

// Create the model
const Exp = mongoose.model<IExp>('Exp', expSchema);

export default Exp;
