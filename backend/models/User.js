const mongoose = require("mongoose");

const ROLES = ["Admin", "FinanceOfficer", "DepartmentHead", "User"];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 160,
    },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, required: true },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

userSchema.index({ role: 1, departmentId: 1 });

userSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    departmentId: this.departmentId,
    isActive: this.isActive,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model("User", userSchema);
module.exports.ROLES = ROLES;
