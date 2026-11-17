
require("dotenv").config();

const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const client = new MongoClient(process.env.MONGODB_URI);

let users;
let leaves;

const JWT_SECRET = process.env.JWT_SECRET;

function createToken(user) {
    return jwt.sign(
        {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role
        },
        JWT_SECRET,
        { expiresIn: "1d" }
    );
}

function authenticate(req, res, next) {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Please log in first." });
    }

    try {
        req.user = jwt.verify(header.split(" ")[1], JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({ message: "Session expired. Please log in again." });
    }
}

function managerOnly(req, res, next) {
    if (req.user.role !== "Manager") {
        return res.status(403).json({ message: "Manager access required." });
    }
    next();
}

function employeeOnly(req, res, next) {
    if (req.user.role !== "Employee") {
        return res.status(403).json({ message: "Employee access required." });
    }
    next();
}

// REGISTER
app.post("/api/register", async (req, res) => {
    try {
        const { name, email, password, role, managerCode } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: "Please fill in all fields." });
        }

        const normalizedEmail = email.trim().toLowerCase();

        if (!["Employee", "Manager"].includes(role)) {
            return res.status(400).json({ message: "Invalid role." });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must contain at least 6 characters." });
        }

        if (role === "Manager" &&
            (!process.env.MANAGER_INVITE_CODE ||
             managerCode !== process.env.MANAGER_INVITE_CODE)) {
            return res.status(403).json({ message: "Invalid manager invitation code." });
        }

        const existing = await users.findOne({ email: normalizedEmail });

        if (existing) {
            return res.status(409).json({ message: "Email already registered." });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = {
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role,
            createdAt: new Date()
        };

        const result = await users.insertOne(newUser);
        newUser._id = result.insertedId;

        console.log("New user registered:", {
            name: newUser.name,
            email: newUser.email,
            role: newUser.role
        });

        res.status(201).json({
            message: "Registration successful.",
            token: createToken(newUser),
            user: {
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: "Registration failed." });
    }
});

// LOGIN
app.post("/api/login", async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({ message: "Enter email, password and role." });
        }

        const user = await users.findOne({
            email: email.trim().toLowerCase()
        });

        if (!user || user.role !== role) {
            return res.status(401).json({ message: "Invalid login details or role." });
        }

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ message: "Invalid login details or role." });
        }

        console.log("User logged in:", user.email, user.role);

        res.json({
            message: "Login successful.",
            token: createToken(user),
            user: {
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Login failed." });
    }
});

// EMPLOYEE: APPLY FOR LEAVE
app.post("/api/leaves", authenticate, employeeOnly, async (req, res) => {
    try {
        const { leaveType, startDate, endDate, reason } = req.body;

        if (!["Casual Leave", "Medical Leave"].includes(leaveType) ||
            !startDate || !endDate || !reason) {
            return res.status(400).json({ message: "Please provide valid leave details." });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
            return res.status(400).json({ message: "Invalid leave dates." });
        }

        const request = {
            employeeName: req.user.name,
            employeeEmail: req.user.email,
            leaveType,
            startDate,
            endDate,
            reason: reason.trim(),
            status: "Pending",
            rejectionReason: "",
            reviewer: "",
            createdAt: new Date()
        };

        const result = await leaves.insertOne(request);

        console.log("New leave request:", {
            id: result.insertedId.toString(),
            employee: request.employeeEmail,
            status: request.status
        });

        res.status(201).json({
            message: "Leave request submitted.",
            leave: { ...request, _id: result.insertedId }
        });
    } catch (error) {
        console.error("Leave submission error:", error);
        res.status(500).json({ message: "Could not submit leave." });
    }
});

// EMPLOYEE: VIEW OWN LEAVES
app.get("/api/leaves/mine", authenticate, employeeOnly, async (req, res) => {
    try {
        const records = await leaves.find({
            employeeEmail: req.user.email
        }).sort({ createdAt: -1 }).toArray();

        res.json(records);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Could not load your leave records." });
    }
});

// MANAGER: VIEW ALL LEAVES
app.get("/api/leaves", authenticate, managerOnly, async (req, res) => {
    try {
        const records = await leaves.find({}).sort({ createdAt: -1 }).toArray();
        res.json(records);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Could not load leave records." });
    }
});

// MANAGER: APPROVE OR REJECT
app.patch("/api/leaves/:id", authenticate, managerOnly, async (req, res) => {
    try {
        const { status, rejectionReason } = req.body;

        if (!["Approved", "Declined"].includes(status)) {
            return res.status(400).json({ message: "Invalid leave status." });
        }

        if (status === "Declined" && !rejectionReason?.trim()) {
            return res.status(400).json({ message: "Please provide a rejection reason." });
        }

        if (!ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid leave ID." });
        }

        const result = await leaves.updateOne(
            { _id: new ObjectId(req.params.id), status: "Pending" },
            {
                $set: {
                    status,
                    rejectionReason: status === "Declined" ? rejectionReason.trim() : "",
                    reviewer: req.user.name,
                    reviewedAt: new Date()
                }
            }
        );

        if (!result.matchedCount) {
            return res.status(404).json({ message: "Pending leave request not found." });
        }

        console.log("Leave updated:", req.params.id, status);

        res.json({ message: `Leave ${status.toLowerCase()} successfully.` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Could not update leave." });
    }
});

// DATABASE CHECK FOR TERMINAL
app.get("/api/leaves/database", authenticate, managerOnly, async (req, res) => {
    try {
        const records = await leaves.find({}).toArray();

        console.log("\n========== LEAVE DATABASE ==========");
        console.table(records.map(record => ({
            employee: record.employeeName,
            email: record.employeeEmail,
            type: record.leaveType,
            start: record.startDate,
            end: record.endDate,
            status: record.status
        })));

        res.json(records);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Database query failed." });
    }
});

async function startServer() {
    try {
        if (!process.env.MONGODB_URI || !JWT_SECRET) {
            throw new Error("MONGODB_URI and JWT_SECRET must be configured.");
        }

        await client.connect();

        const db = client.db("leavemanagement");

        users = db.collection("users");
        leaves = db.collection("leaveRequests");

        await users.createIndex({ email: 1 }, { unique: true });

        console.log("MongoDB connected successfully!");
        console.log("Database: leavemanagement");
        console.log("Collections: users, leaveRequests");

        console.log("\n========== REGISTERED USERS ==========");
        const registeredUsers = await users.find({}).toArray();
        console.table(registeredUsers.map(user => ({
            name: user.name,
            email: user.email,
            role: user.role
        })));

        console.log("\n========== EXISTING LEAVE RECORDS ==========");
        const existingLeaves = await leaves.find({}).toArray();
        console.table(existingLeaves.map(record => ({
            employee: record.employeeName,
            email: record.employeeEmail,
            type: record.leaveType,
            status: record.status
        })));

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Server startup failed:", error);
        process.exit(1);
    }
}

startServer();
