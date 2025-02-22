import mongoose, { Schema, Document } from 'mongoose';

export interface IFolio extends Document {
    cn_no: string;
    symbol: string;
    price: Number;
    qnty: Number;
    amt: Number;
    brokerage: Number;
    broker: string;
    pdate: Date;
    namt: Number;
    folio: string;
    type: string;
    rid: string;
    sector: string;
    user: string;
    cprice: Number;
    cval: Number;
    age: Number;
    pl: Number;
}

const folioSchema: Schema = new Schema({
    cn_no: { type: String, required: true },
    symbol: { type: String, required: true },
    price: { type: Number, required: true },
    qnty: { type: Number, required: true },
    amt: { type: Number, required: true },
    brokerage: { type: Number, required: true },
    broker: { type: String, required: true },
    pdate: { type: Date, required: true },
    namt: { type: Number, required: true },
    folio: { type: String, required: true },
    type: { type: String, required: true },
    rid: { type: String, required: true },
    sector: { type: String, required: true },
    user: { type: String, required: true },
    cprice: { type: Number, required: false },
    cval: { type: Number, required: false },
    age: { type: Number, required: false },
    pl: { type: Number, required: false },
    cnNoteId: { type: Schema.Types.ObjectId, ref: 'CNNote' }
}, {timestamps: true});

export const Folio = mongoose.model<IFolio>('Folio', folioSchema);
