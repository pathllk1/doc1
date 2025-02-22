import { NextFunction, Request, Response } from 'express';
import DocModel from 'api/models/docs';
import NSEModel from 'api/models/nse';
import * as nodemailer from 'nodemailer';



declare global {
    namespace Express {
        interface Request {
            file: any;
        }
    }
}

const st_tst = (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({ msg: "hello" });
};

const add_tst = (req: Request, res: Response, next: NextFunction) => {
    DocModel.create(req.body).then(data => {
        res.status(200).json(data);
    })
};

const get_all = async (req: Request, res: Response, next: NextFunction) => {
    await DocModel.find().then(data => {
        res.status(200).json(data);
    })
};

const snd = async (req: Request, res: Response, next: NextFunction) => {
    const today = new Date()
    const today1 = new Date(today.getTime() + (1000 * 60 * 60 * 24 * 30)).toISOString()

    await DocModel.find({ edate: { $lte: today1 } }).then(data => {
        const transporter = nodemailer.createTransport({
            host: process.env['MAIL_HOST'],
            port: 465,
            service: 'smtp.mail.yahoo.com',
            secure: true,
            auth: {
                user: process.env['MAIL_USER'],
                pass: process.env['MAIL_PASS']
            }
        });

        let table = '<table border="1"><tr>';
        table += `<th>REF NO</th>`;
        table += `<th>DESC</th>`;
        table += '</tr>';
        data.forEach((row: any)=>{
            table += '<tr>';
            table += `<td>${row.refno}</td>`;
            table += `<td>${row.desc}</td>`;
            table += '</tr>';
        })
        table += '</table>';

        const mailOptions = {
            from: 'paul.anjan3@yahoo.in',
            to: 'anjanvkp@gmail.com',
            subject: 'test mail',
            html: table
        };

        try { 
            transporter.sendMail(mailOptions); 
            res.status(200).json(data);
            console.log('Email sent successfully'); 
        } catch (error) { 
            console.error('Error sending email:', error); 
        }
    })
};

const csvtojson = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = req.body;
        // Delete all existing records
        await NSEModel.deleteMany({});
        // Insert new records
        const insertResults = await NSEModel.insertMany(data.map((item: any) => ({ ...item, addNew: true })));

        res.status(200).json({ message: `Inserted ${insertResults.length} records successfully` });
    } catch (error) {
        next(error);
    }
};

export default { st_tst, add_tst, get_all, snd, csvtojson };