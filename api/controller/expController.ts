import { Request, Response } from 'express';
import Exp from '../models/exp';

// Controller for handling exp model operations
class ExpController {
  // Example method to get all exp records
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const records = await Exp.find();
      res.status(200).json(records);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving records', error });
    }
  }

  // Add a new exp record
  async add(req: Request, res: Response): Promise<void> {
    try {
      const newExp = new Exp(req.body);
      await newExp.save();
      res.status(201).json(newExp);
    } catch (error) {
      res.status(500).json({ message: 'Error adding record', error });
    }
  }

  // Delete an exp record by ID
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deletedExp = await Exp.findByIdAndDelete(id);
      if (!deletedExp) {
        res.status(404).json({ message: 'Record not found' });
        return;
      }
      res.status(200).json({ message: 'Record deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting record', error });
    }
  }

  // Update an exp record by ID
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updatedExp = await Exp.findByIdAndUpdate(id, req.body, { new: true });
      if (!updatedExp) {
        res.status(404).json({ message: 'Record not found' });
        return;
      }
      res.status(200).json(updatedExp);
    } catch (error) {
      res.status(500).json({ message: 'Error updating record', error });
    }
  }

  // Find one exp record by ID
  async findOne(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const expRecord = await Exp.findById(id);
      if (!expRecord) {
        res.status(404).json({ message: 'Record not found' });
        return;
      }
      res.status(200).json(expRecord);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving record', error });
    }
  }

  // Method to check if data exists, then update or add new
  async checkAndUpdate(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        const { pto, pdate, amt, mode, proj, usern } = req.body;

        // Validate required fields
        if (!pto || !pdate || !amt || !mode || !proj || !usern) {
            res.status(400).json({ message: 'All fields are required.' });
            return; 
        }

        // Upsert operation: update if exists, create if not
        const updatedExp = await Exp.findOneAndUpdate({ _id: id }, req.body, { new: true, upsert: true });
        res.status(200).json(updatedExp);
    } catch (error) {
        res.status(500).json({ message: 'Error processing request', error });
    }
}

  // Upsert method to update if exists or add new
  async upsert(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        const existingExp = await Exp.findById(id);

        if (existingExp) {
            // Update existing record
            const updatedExp = await Exp.findByIdAndUpdate(id, req.body, { new: true });
            res.status(200).json(updatedExp);
        } else {
            // Create new record
            const newExp = new Exp(req.body);
            await newExp.save();
            res.status(201).json(newExp);
        }
    } catch (error) {
        res.status(500).json({ message: 'Error processing request', error });
    }
  }
}

export default new ExpController();
