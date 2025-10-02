"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var OrganizationSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    tagline: { type: String },
    logoUrl: { type: String, required: true },
    watermarkUrl: { type: String },
    departmentLogos: [{
            departmentName: String,
            logoUrl: String,
        }],
    admins: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    coordinators: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });
exports.default = mongoose_1.models.Organization || (0, mongoose_1.model)('Organization', OrganizationSchema);
