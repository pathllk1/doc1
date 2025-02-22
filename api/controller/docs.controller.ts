import { Request, Response, NextFunction } from 'express';
import DocModel from '../models/docs';
import * as nodemailer from 'nodemailer';
import UserModel from 'api/models/user';

class DocsController {
  async getDocs(req: Request, res: Response, next: NextFunction) {
    const username = req.headers['userId']; // Extract username from request headers
    await DocModel.find({ username: username }).then(async data => { // Find documents by username
        const today = new Date();
        for (const doc of data) {
            const edate = new Date(doc.edate);
            doc.rage = Math.floor((edate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)); // Calculate difference in days
            await doc.save(); // Update the document in the database
        }
        res.status(200).json(data);
    }).catch(err => {
        next(err); // Handle any errors
    });
  }

  async addDoc(req: Request, res: Response, next: NextFunction) {
    await DocModel.create(req.body).then(data => {
      res.status(200).json(data);
    })
  }

  async updateDoc(req: Request, res: Response, next: NextFunction) {
    // Logic to update a document
    res.status(200).json({ message: 'Document updated successfully' });
  }

  async deleteDoc(req: Request, res: Response, next: NextFunction) {
    const docId = req.params['id']; // Get the document ID from the request parameters

    try {
      const deletedDoc = await DocModel.findByIdAndDelete(docId); // Delete the document by ID
      if (!deletedDoc) {
        res.status(404).json({ message: 'Document not found' });
      }
      res.status(200).json({ message: 'Document deleted successfully' });
    } catch (error) {
      next(error); // Handle error
    }
  }

  async snd(req: Request, res: Response, next: NextFunction) {
    const userId = req.headers['userId']; // Get the userId from the request headers


    try {
      const user = await UserModel.findById(userId); // Find the user by userId
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }


      const today = new Date();
      const today1 = new Date(today.getTime() + (1000 * 60 * 60 * 24 * 30)).toISOString();

      const td = new Date();
      td.setHours(0, 0, 0, 0)

      const lasttmailsent = user.lastmailsent;

      
      if (lasttmailsent > td) {
        res.status(404).json({ message: 'mail already sent today' });
        return;
      }


      // Helper function to format date
      const formatDate = (isoDate: string) => {
        const date = new Date(isoDate);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      };

      await DocModel.find({ edate: { $lte: today1 }, username: userId, status: { $ne: 'CLOSED' } }).then(data => {
        // Check if data length is less than or equal to 0
        if (data.length <= 0) {
          res.status(404).json({ message: "No data to send email." });
          return;
        }

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

        let table = 'Please review the given below documents validity<br><br>';
        table += 'Please review the documents\' validity before they expire.<br><br>';
        table += '<table style="border: 1px solid lightgreen; border-collapse: collapse;">';
        table += '<tr style="background-color: teal; color: white;">';
        table += `<th style="border: 1px solid lightgreen; border-collapse: collapse; background-color: teal; color: white;">REF NO</th>`;
        table += `<th style="border: 1px solid lightgreen; border-collapse: collapse; background-color: teal; color: white;">DESCRIPTION</th>`;
        table += `<th style="border: 1px solid lightgreen; border-collapse: collapse; background-color: teal; color: white;">START DATE</th>`;
        table += `<th style="border: 1px solid lightgreen; border-collapse: collapse; background-color: teal; color: white;">END DATE</th>`;
        table += `<th style="border: 1px solid lightgreen; border-collapse: collapse; background-color: teal; color: white;">TYPE</th>`;
        table += `<th style="border: 1px solid lightgreen; border-collapse: collapse; background-color: teal; color: white;">REMAINING DAYS</th>`;
        table += `<th style="border: 1px solid lightgreen; border-collapse: collapse; background-color: teal; color: white;">STATUS</th>`;
        table += '</tr>';
        data.forEach((row: any) => {
          table += '<tr>';
          table += `<td style="border: 1px solid lightgreen; border-collapse: collapse; white-space: nowrap; padding: 8px;">${row.refno}</td>`;
          table += `<td style="border: 1px solid lightgreen; border-collapse: collapse; padding: 8px;">${row.desc}</td>`;
          table += `<td style="border: 1px solid lightgreen; border-collapse: collapse; white-space: nowrap; padding: 8px;">${formatDate(row.sdate)}</td>`;
          table += `<td style="border: 1px solid lightgreen; color: red; font-weight: bold; border-collapse: collapse; white-space: nowrap; padding: 8px;">${formatDate(row.edate)}</td>`;
          table += `<td style="border: 1px solid lightgreen; border-collapse: collapse; white-space: nowrap; padding: 8px;">${row.type}</td>`;
          table += `<td style="border: 1px solid lightgreen; color: red; font-weight: bold; border-collapse: collapse; white-space: nowrap; padding: 8px;">${row.rage}</td>`;
          table += `<td style="border: 1px solid lightgreen; border-collapse: collapse; white-space: nowrap; padding: 8px;">${row.status}</td>`;
          table += '</tr>';
        });
        table += '</table>';
        table += '<br><br>';
        table += '<br>';
        table += '<span style="color: blue; font-weight: bold; font-size: 24px;  padding: 10px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.2); text-decoration: underline;">Thanks and regards</span>';

        const mailOptions = {
          from: 'paul.anjan3@yahoo.in',
          to: user.email,
          subject: 'DOCUMENT EXPIRY',
          html: table
        };

        try {
          transporter.sendMail(mailOptions, (err, info) => {
            res.status(200).json({ msg: info });
            console.log('Email sent successfully');
            user.lastmailsent = new Date();
            user.save();
          });
        } catch (error) {
          console.error('Error sending email:', error);
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async findByIdAndUpdateOrInsert(req: Request, res: Response, next: NextFunction) {
    const { id, ...updateData } = req.body;
    const username = req.headers['userId']; // Get the username from the request headers
    updateData.username = username;
    const today = new Date();
    updateData.rage = Math.floor((new Date(updateData.edate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    try {
      let doc;
      if (!id) {
        doc = await DocModel.create(updateData);
      } else {
        doc = await DocModel.findByIdAndUpdate({ _id: id }, updateData, { new: true, upsert: true });
      }
      res.status(200).json(doc);
    } catch (error) {
      next(error);
    }
  }
}

export default new DocsController();
