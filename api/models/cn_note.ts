import mongoose, { Schema, Document } from 'mongoose';

export interface ICNNote extends Document {
    cn_no: string;
    cn_date: Date;
    broker: string;
    type: string;
    folio: string;
    oth_chg: Number;
    famt: Number;
    user: string;
    createdAt: Date;
    updatedAt: Date;
    Folio_rec: Schema.Types.ObjectId;
}

const CNNoteSchema: Schema = new Schema({
    cn_no: { type: String, required: true },
    cn_date: { type: Date, required: true },
    broker: { type: String, required: true },
    type: { type: String, required: true },
    folio: { type: String, required: true },
    oth_chg: { type: Number },
    famt: { type: Number, required: true },
    user: { type: String, required: true },
    Folio_rec: [{ type: Schema.Types.ObjectId, ref: 'Folio' }]
}, {
    timestamps: true
});

export const CNNote = mongoose.model<ICNNote>('CNNote', CNNoteSchema);
