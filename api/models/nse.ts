import mongoose, { Schema, Document } from 'mongoose';

interface INSE extends Document {
    SYMBOL: string;
    SERIES: string;
    DATE1: Date;
    PREV_CLOSE: number;
    OPEN_PRICE: number;
    HIGH_PRICE: number;
    LOW_PRICE: number;
    LAST_PRICE: number;
    CLOSE_PRICE: number;
    AVG_PRICE: number;
    TTL_TRD_QNTY: number;
    TURNOVER_LACS: number;
    NO_OF_TRADES: number;
    DELIV_QTY: number;
    DELIV_PER: number;
}

const NSESchema: Schema = new Schema({
    SYMBOL: { type: String, unique: true, required: true },
    SERIES: { type: String, required: true },
    DATE1: { type: Date, required: true },
    PREV_CLOSE: { type: Number, required: true },
    OPEN_PRICE: { type: Number, required: true },
    HIGH_PRICE: { type: Number, required: true },
    LOW_PRICE: { type: Number, required: true },
    LAST_PRICE: { type: Number, required: true },
    CLOSE_PRICE: { type: Number, required: true },
    AVG_PRICE: { type: Number, required: true },
    TTL_TRD_QNTY: { type: Number, required: true },
    TURNOVER_LACS: { type: Number, required: true },
    NO_OF_TRADES: { type: Number, required: true },
    DELIV_QTY: { type: Number, required: true },
    DELIV_PER: { type: Number, required: true },
}, { timestamps: true });

const NSEModel = mongoose.model<INSE>('NSE', NSESchema);
export default NSEModel;
