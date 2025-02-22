import { Request, Response, NextFunction } from 'express';
import NSEModel from 'api/models/nse'; // Adjust the path based on your project structure
import { Folio } from 'api/models/folio'; // Adjust the path based on your project structure
import UserModel from 'api/models/user';
import { CNNote } from 'api/models/cn_note'; // Add this import
import mongoose from 'mongoose';

import { google } from "googleapis";
import { JWT } from "google-auth-library";


class NSEController {
    // Example method to get all NSE records
    async getAll_nse(req: Request, res: Response): Promise<void> {
        try {
            const nseRecords = await NSEModel.find();
            res.status(200).json(nseRecords);
        } catch (error) {
            res.status(500).json({ message: 'Error retrieving NSE records', error });
        }
    }

    async read_g_sheet(req: Request, res: Response): Promise<void> {
        const client = new JWT({
            email: process.env['gs_email'],
            key: process.env['gs_key'],
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });
        const sheets = google.sheets({ version: "v4", auth: client });
        async function main() {
            try {
                // Your spreadsheet ID
                const spreadsheetId = "1TfOwGAQGkySV37mQl-AFBfkQkiyirxsqA4nBgtyXm0I";

                // Read data from the spreadsheet
                const response = await sheets.spreadsheets.values.get({
                    spreadsheetId,
                    range: "A1:B", // Range to read
                });

                const values = response.data.values;

                if (!values) {
                    console.log("No data found.");
                } else {
                    console.log("Data:");
                    values.forEach((row) => {
                        console.log(row.join("\t"));
                    });
                }

                res.status(200).json({ message: values })
            } catch (error) {
                console.error("Error:", error);
            }
        }
        main()
    }

    // Method to insert or update a folio record based on existence
    async upsertFolio(req: Request, res: Response, next: NextFunction) {
        const { id, ...updateData } = req.body;
        const username = req.headers['userId']; // Get the username from the request headers
        updateData.username = username;
        try {
            let doc;
            if (!id) {
                doc = await Folio.create(updateData);
            } else {
                doc = await Folio.findByIdAndUpdate({ _id: id }, updateData, { new: true, upsert: true });
            }
            res.status(200).json(doc);
        } catch (error: any) {
            next(error);
        }
    }

    async gs_record(req: Request, res: Response): Promise<void> {
        const client = new JWT({
            email: process.env['gs_email'],
            key: process.env['gs_key'],
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });
        const sheets = google.sheets({ version: "v4", auth: client });
        try {
            // First get Google Sheets data
            const spreadsheetId = "1TfOwGAQGkySV37mQl-AFBfkQkiyirxsqA4nBgtyXm0I";
            const response = await sheets.spreadsheets.values.get({
                spreadsheetId,
                range: "Sheet2!A1:IZ", // Assuming column A has symbols and B has prices
            });
            const data: any = response.data.values;
        if (!data) {
           res.status(404).json({ message: 'No data found' });
        }
        const dates = data[0]?.slice(2) || []; // Skip Columns A and B, start from Column C

        // Process each stock row (rows 2-51)
        const jsonOutput = [];
        for (let i = 1; i < data.length; i++) {
            const symbol = data[i][0]; // Column A (symbol)
            const closingPrices = data[i].slice(2).map((price: any) => parseFloat(price)); // Skip Columns A and B

            const history = dates.map((date: any, idx: any) => ({
                date,
                close: closingPrices[idx] || null, // Handle missing data
            }));

            jsonOutput.push({ symbol, history });
        }
        res.status(200).json(jsonOutput);
        }
        catch (error) {
            console.error('Error fetching/updating folio records:', error);
            res.status(500).json({ message: 'Error fetching/updating folio records' });
        }
    }


    async getAllFolioRecords(req: Request, res: Response): Promise<void> {
        const client = new JWT({
            email: process.env['gs_email'],
            key: process.env['gs_key'],
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });
        const sheets = google.sheets({ version: "v4", auth: client });

        try {
            // First get Google Sheets data
            const spreadsheetId = "1TfOwGAQGkySV37mQl-AFBfkQkiyirxsqA4nBgtyXm0I";
            const response = await sheets.spreadsheets.values.get({
                spreadsheetId,
                range: "Sheet1!A1:B", // Assuming column A has symbols and B has prices
            });

            // Convert sheets data to Map for faster lookups
            const priceMap = new Map(
                response.data.values?.map(([symbol, price]) => [symbol, price]) || []
            );

            // Get folio records
            const folioRecords = await Folio.find();
            const today = new Date();

            // Update each record with age and current price if available
            const updatedRecords = await Promise.all(folioRecords.map(async (record) => {
                // Calculate age
                const purchaseDate = new Date(record.pdate);
                const diffTime = Math.abs(today.getTime() - purchaseDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                // Look up current price with "NSE:" prefix
                const symbolWithPrefix = `NSE:${record.symbol}`;
                const currentPrice = priceMap.get(symbolWithPrefix);

                // Update record with both age and current price
                return await Folio.findByIdAndUpdate(
                    record._id,
                    {
                        age: diffDays,
                        cprice: currentPrice || record.cprice, // Keep existing price if no match found
                        cval: Number((parseFloat(currentPrice?.toString() || record.cprice.toString()).valueOf() * parseFloat(record.qnty.toString())).toFixed(2)),
                        pl: Number(((parseFloat(currentPrice?.toString() || record.cprice.toString()).valueOf() - parseFloat(record.price.toString()).valueOf()) * parseFloat(record.qnty.toString())).toFixed(2))
                    },
                    { new: true }
                );
            }));

            res.status(200).json(updatedRecords);
        } catch (error) {
            console.error('Error fetching/updating folio records:', error);
            res.status(500).json({ message: 'Error fetching/updating folio records' });
        }
    }

    async addnse_data(req: Request, res: Response): Promise<void> {
        const user = req.headers['userId'];
        const { formData, recordsData } = req.body;

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Add user to formData and create CNNote
            const enrichedFormData = {
                ...formData,
                user: user
            };

            // Add user to each record
            const enrichedRecordsData = recordsData.map((record: any) => ({
                ...record,
                user: user
            }));

            const cnNote = await CNNote.create([enrichedFormData], { session }).then((docs: any) => {
                const doc = docs[0];
                // Add CNNote _id to each record
                enrichedRecordsData.forEach((record: any) => {
                    record.cnNoteId = doc._id;
                });
                return doc;
            });

            // Insert all records into FolioModel
            const savedRecords = await Folio.insertMany(enrichedRecordsData, { session });

            // Extract IDs from saved records and update CNNote
            const savedRecordIds = savedRecords.map(record => record["_id"]);
            await CNNote.findByIdAndUpdate(
                cnNote._id,
                { Folio_rec: savedRecordIds },
                { new: true, session }
            );

            await session.commitTransaction();
            session.endSession();

            res.status(200).json({
                message: 'Data saved successfully',
                cnNote,
                recordsData: savedRecords
            });
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            console.error('Error submitting NSE data:', error);
            res.status(500).json({ message: 'Error submitting NSE data' });
        }
    }

    async getAllCNNotes(req: Request, res: Response): Promise<void> {
        try {
            const cnNotes = await CNNote.find()
                .populate('Folio_rec');
            res.status(200).json(cnNotes);
        } catch (error) {
            console.error('Error fetching CN Notes:', error);
            res.status(500).json({ message: 'Error fetching CN Notes' });
        }
    }

    async updnse_data(req: Request, res: Response): Promise<void> {
        const maxRetries = 3;
        let retryCount = 0;

        interface TransactionResult {
            cnNote: any;
            savedRecords: any[];
        }

        const executeTransaction = async (): Promise<TransactionResult> => {
            const session = await mongoose.startSession();
            try {
                session.startTransaction({
                    readPreference: 'primary',
                    readConcern: { level: 'local' },
                    writeConcern: { w: 'majority' }
                });

                const user = req.headers['userId'];
                const { formData, recordsData } = req.body;

                // Add user to formData
                const enrichedFormData = {
                    ...formData,
                    user: user
                };

                // Add user to each record
                const enrichedRecordsData = recordsData.map((record: any) => ({
                    ...record,
                    user: user
                }));

                // Update the CN Note
                const cnNote = await CNNote.findByIdAndUpdate(
                    enrichedFormData.id,
                    enrichedFormData,
                    { new: true, session }
                );

                if (!cnNote) {
                    throw new Error('CN Note not found');
                }

                // Delete existing Folio records for this CN Note
                await Folio.deleteMany({ cnNoteId: cnNote._id }, { session });

                // Create new Folio records
                const savedRecords = await Folio.insertMany(
                    enrichedRecordsData.map((record: any) => ({
                        ...record,
                        cnNoteId: cnNote._id
                    })),
                    { session }
                );

                // Update CN Note with new Folio record IDs
                const savedRecordIds = savedRecords.map(record => record['_id']);
                await CNNote.findByIdAndUpdate(
                    cnNote._id,
                    { Folio_rec: savedRecordIds },
                    { new: true, session }
                );

                await session.commitTransaction();
                return { cnNote, savedRecords };
            } catch (error: any) {
                await session.abortTransaction();
                if (error.errorLabels?.includes('TransientTransactionError') && retryCount < maxRetries) {
                    retryCount++;
                    console.log(`Retrying transaction attempt ${retryCount}`);
                    return executeTransaction();
                }
                throw error;
            } finally {
                await session.endSession();
            }
        };

        try {
            const result = await executeTransaction();
            res.status(200).json({
                message: 'Data updated successfully',
                cnNote: result.cnNote,
                recordsData: result.savedRecords
            });
        } catch (error: any) {
            console.error('Error updating NSE data:', error);
            res.status(500).json({
                message: 'Error updating NSE data',
                error: error.message
            });
        }
    }
}

export default new NSEController();

// Additional methods can be added here
