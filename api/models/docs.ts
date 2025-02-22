import mongoose, { Schema, model } from 'mongoose';
// Schema
const schema = new Schema({
  refno: { type: String, required: true },
  desc: { type: String, required: true },
  sdate: Date,
  edate: Date,
  type: String,
  status: String,
  rage:Number,
  val: String,
  username: String
}, {timestamps: true});

const DocModel = mongoose.model('Docs', schema);

export default DocModel;