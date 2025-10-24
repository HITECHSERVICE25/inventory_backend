const { default: mongoose } = require('mongoose');
const InstallationCharge = require('../models/InstallationCharge');
const  logger  = require('../utils/logger');

class InstallationService {
  async updateCharge(amount, userId) {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Archive previous current charge
      await InstallationCharge.updateMany(
        { isCurrent: true },
        { $set: { isCurrent: false } },
        { session }
      );

      // Get previous version
      const previous = await InstallationCharge.findOne({ isCurrent: true });

      // Create new charge
      const newCharge = await InstallationCharge.create([{
        amount,
        updatedBy: userId,
        previousVersion: previous?._id
      }], { session });

      await session.commitTransaction();
      logger.info('Installation charge updated', {
        newAmount: amount,
        userId
      });

      return newCharge[0];
    } catch (error) {
      await session.abortTransaction();
      logger.error('Charge update failed', { error: error.message });
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getCurrentCharge() {
    try {
      return await InstallationCharge.findOne({ isCurrent: true })
        .populate('updatedBy', 'name');
    } catch (error) {
      logger.error('Error fetching current charge');
      throw error;
    }
  }

  async getChargeHistory() {
    try {
      return await InstallationCharge.find()
        .sort('-effectiveDate')
        .populate('updatedBy', 'name');
    } catch (error) {
      logger.error('Error fetching charge history');
      throw error;
    }
  }
}

module.exports = new InstallationService();