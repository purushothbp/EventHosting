"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var event_1 = require("../models/event");
var user_1 = require("../models/user");
var Organization_1 = require("../models/Organization");
function seed() {
    return __awaiter(this, void 0, void 0, function () {
        var users, hariharan, purush, jane, organizations, techSociety, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, 7, 9]);
                    return [4 /*yield*/, mongoose_1.default.connect(process.env.MONGO_URI)];
                case 1:
                    _a.sent();
                    console.log("Connected to DB");
                    // clear old docs
                    return [4 /*yield*/, Promise.all([
                            user_1.default.deleteMany({}),
                            Organization_1.default.deleteMany({}),
                            event_1.default.deleteMany({})
                        ])];
                case 2:
                    // clear old docs
                    _a.sent();
                    return [4 /*yield*/, user_1.default.insertMany([
                            {
                                clerkId: "clerk_admin_001",
                                email: "hariharan@gmail.com",
                                name: "Hariharan",
                                role: "admin",
                                department: "CSE",
                                year: 3,
                                interests: ["Tech", "Leadership"],
                            },
                            {
                                clerkId: "clerk_superadmin_001",
                                email: "purush1605@gmail.com",
                                name: "Purushothaman",
                                role: "super-admin",
                                department: "ECE",
                                year: 4,
                                interests: ["Management", "Innovation"],
                            },
                            {
                                clerkId: "clerk_user_001",
                                email: "john.doe@example.com",
                                name: "John Doe",
                                role: "user",
                                department: "Mechanical",
                                year: 2,
                                interests: ["Robotics", "Gaming"],
                            },
                            {
                                clerkId: "clerk_user_002",
                                email: "jane.smith@example.com",
                                name: "Jane Smith",
                                role: "coordinator",
                                department: "IT",
                                year: 1,
                                interests: ["Cultural", "Events"],
                            },
                        ])];
                case 3:
                    users = _a.sent();
                    hariharan = users.find(function (u) { return u.email === "hariharan@gmail.com"; });
                    purush = users.find(function (u) { return u.email === "purush1605@gmail.com"; });
                    jane = users.find(function (u) { return u.email === "jane.smith@example.com"; });
                    return [4 /*yield*/, Organization_1.default.insertMany([
                            {
                                name: "Tech Society",
                                tagline: "Innovating the Future",
                                logoUrl: "https://dummy.s3.amazonaws.com/logos/techsociety.png",
                                watermarkUrl: "https://dummy.s3.amazonaws.com/watermarks/techsociety_wm.png",
                                departmentLogos: [
                                    {
                                        departmentName: "CSE",
                                        logoUrl: "https://dummy.s3.amazonaws.com/logos/cse.png",
                                    },
                                    {
                                        departmentName: "ECE",
                                        logoUrl: "https://dummy.s3.amazonaws.com/logos/ece.png",
                                    },
                                ],
                                admins: [hariharan._id],
                                coordinators: [jane._id],
                            },
                            {
                                name: "Cultural Club",
                                tagline: "Where Culture Comes Alive",
                                logoUrl: "https://dummy.s3.amazonaws.com/logos/culturalclub.png",
                                watermarkUrl: "https://dummy.s3.amazonaws.com/watermarks/culturalclub_wm.png",
                                departmentLogos: [
                                    {
                                        departmentName: "Arts",
                                        logoUrl: "https://dummy.s3.amazonaws.com/logos/arts.png",
                                    },
                                    {
                                        departmentName: "Drama",
                                        logoUrl: "https://dummy.s3.amazonaws.com/logos/drama.png",
                                    },
                                ],
                                admins: [purush._id],
                                coordinators: [],
                            },
                        ])];
                case 4:
                    organizations = _a.sent();
                    techSociety = organizations[0];
                    // 3️⃣ Insert Events (linked to Tech Society + Hariharan)
                    return [4 /*yield*/, event_1.default.insertMany([
                            {
                                title: "AI Workshop",
                                date: new Date("2025-10-10"),
                                location: "Auditorium Hall A",
                                description: "An introductory workshop on Artificial Intelligence basics and applications.",
                                imageUrl: "https://dummy.s3.amazonaws.com/images/aiworkshop.png", // use dummy
                                isFree: true,
                                type: "Workshop",
                                organization: techSociety._id,
                                department: "CSE",
                                organizer: hariharan._id,
                                minTeamSize: 1,
                                maxTeamSize: 5,
                            },
                            {
                                title: "Cybersecurity Seminar",
                                date: new Date("2025-11-05"),
                                location: "Main Seminar Room",
                                description: "A seminar covering the latest trends in cybersecurity.",
                                imageUrl: "https://dummy.s3.amazonaws.com/images/cybersecurity.png",
                                isFree: false,
                                price: 200,
                                type: "Seminar",
                                organization: techSociety._id,
                                department: "IT",
                                organizer: hariharan._id,
                                minTeamSize: 1,
                                maxTeamSize: 1,
                            },
                            {
                                title: "Cultural Fest 2025",
                                date: new Date("2025-12-15"),
                                location: "Open Grounds",
                                description: "Annual college cultural festival with music, dance, and drama.",
                                imageUrl: "https://dummy.s3.amazonaws.com/images/culturalfest.png",
                                isFree: true,
                                type: "Cultural",
                                organization: techSociety._id,
                                department: "All",
                                organizer: hariharan._id,
                                minTeamSize: 1,
                                maxTeamSize: 10,
                            },
                        ])];
                case 5:
                    // 3️⃣ Insert Events (linked to Tech Society + Hariharan)
                    _a.sent();
                    console.log("Seed complete ✅");
                    return [3 /*break*/, 9];
                case 6:
                    err_1 = _a.sent();
                    console.error(err_1);
                    return [3 /*break*/, 9];
                case 7: return [4 /*yield*/, mongoose_1.default.disconnect()];
                case 8:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    });
}
seed();
