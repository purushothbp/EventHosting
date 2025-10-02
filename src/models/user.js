"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var UserSchema = new mongoose_1.Schema({
    clerkId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    avatarUrl: { type: String },
    organization: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Organization' },
    department: { type: String },
    year: { type: Number },
    interests: [{ type: String }],
    role: {
        type: String,
        default: 'user',
        enum: ['user', 'coordinator', 'admin', 'super-admin'],
    },
}, { timestamps: true });
exports.default = mongoose_1.models.User || (0, mongoose_1.model)('User', UserSchema);
