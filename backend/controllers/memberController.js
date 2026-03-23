const UserModel = require('../models/userModel');

// @GET /api/v1/members
const getAllMembers = async (req, res, next) => {
  try {
    const members = await UserModel.getAll(req.query.status);
    res.status(200).json({ success: true, data: members });
  } catch (err) {
    next(err);
  }
};

// @GET /api/v1/members/:id
const getMemberById = async (req, res, next) => {
  try {
    const member = await UserModel.findById(req.params.id);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found.',
      });
    }
    res.status(200).json({ success: true, data: member });
  } catch (err) {
    next(err);
  }
};

// @PATCH /api/v1/members/:id/status
const updateMemberStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['active', 'suspended', 'expired'];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be active, suspended or expired.',
      });
    }

    const affected = await UserModel.updateStatus(req.params.id, status);
    if (!affected) {
      return res.status(404).json({
        success: false,
        message: 'Member not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: `Member status updated to ${status}.`,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllMembers, getMemberById, updateMemberStatus };