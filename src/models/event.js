"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var EventSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    isFree: { type: Boolean, default: false },
    price: { type: Number },
    type: { type: String, required: true, enum: ['Workshop', 'Seminar', 'Competition', 'Cultural'] },
    organization: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Organization', required: true },
    department: { type: String },
    organizer: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    minTeamSize: { type: Number, default: 1 },
    maxTeamSize: { type: Number, default: 1 },
}, { timestamps: true });
exports.default = mongoose_1.models.Event || (0, mongoose_1.model)('Event', EventSchema);
