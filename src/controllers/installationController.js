const installationService = require('../services/installationService');

exports.updateInstallationCharge = async (req, res, next) => {
  try {
    const charge = await installationService.updateCharge(
      req.body.amount,
      req.user.id
    );
    res.status(200).json({ success: true, data: charge });
  } catch (error) {
    next(error);
  }
};

exports.getCurrentCharge = async (req, res, next) => {
  try {
    const charge = await installationService.getCurrentCharge();
    res.status(200).json({ success: true, data: charge });
  } catch (error) {
    next(error);
  }
};

exports.getChargeHistory = async (req, res, next) => {
  try {
    const history = await installationService.getChargeHistory();
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
};