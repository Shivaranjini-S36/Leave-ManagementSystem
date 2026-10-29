
const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const client = new MongoClient(process.env.MONGODB_URI);

let leaveRequests;

// Display the actual records saved in MongoDB
async function showDatabaseRecords() {
  try {
    const records = await leaveRequests
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    console.log("\n========================================");
    console.log(" EMPLOYEE LEAVE DATABASE - MONGODB ATLAS");
    console.log(" Total records:", records.length);
    console.log("========================================");

    if (records.length === 0) {
      console.log("No leave requests stored yet.");
    } else {
      console.table(records.map(record => ({
        ID: record._id.toString(),
        Employee: record.employeeName,
        Email: record.employeeEmail,
        LeaveType: record.leaveType,
        StartDate: record.startDate,
        EndDate: record.endDate,
        Status: record.status,
        Reviewer: record.reviewer || "Not reviewed",
        Reason: record.reason
      })));
    }

    console.log("========================================\n");
  } catch (error) {
    console.error("Could not display database records:", error.message);
  }
}

async function startServer() {
  try {
    await client.connect();

    const database = client.db("leavemanagement");
    leaveRequests = database.collection("leaveRequests");

    console.log("MongoDB connected successfully!");

    // Display existing database records when server starts
    await showDatabaseRecords();

    // Submit a leave request
    app.post("/api/leaves", async (req, res) => {
      try {
        const {
          employeeName,
          employeeEmail,
          leaveType,
          startDate,
          endDate,
          reason
        } = req.body;

        if (
          !employeeName ||
          !employeeEmail ||
          !leaveType ||
          !startDate ||
          !endDate ||
          !reason
        ) {
          return res.status(400).json({
            message: "Please fill in every field."
          });
        }

        if (!["Casual Leave", "Medical Leave"].includes(leaveType)) {
          return res.status(400).json({
            message: "Invalid leave type."
          });
        }

        if (
          Number.isNaN(Date.parse(startDate)) ||
          Number.isNaN(Date.parse(endDate)) ||
          endDate < startDate
        ) {
          return res.status(400).json({
            message: "Please enter valid leave dates."
          });
        }

        const request = {
          employeeName,
          employeeEmail,
          leaveType,
          startDate,
          endDate,
          reason,
          status: "Pending",
          reviewer: "",
          createdAt: new Date()
        };

        const result = await leaveRequests.insertOne(request);

        console.log("\nNEW LEAVE REQUEST SAVED TO MONGODB");
        console.log("Inserted record ID:", result.insertedId.toString());

        await showDatabaseRecords();

        res.status(201).json({
          message: "Leave request submitted successfully!",
          id: result.insertedId
        });
      } catch (error) {
        console.error("Submit leave error:", error);
        res.status(500).json({
          message: "Could not submit the leave request."
        });
      }
    });

    // Get all leave requests
    app.get("/api/leaves", async (req, res) => {
      try {
        const requests = await leaveRequests
          .find()
          .sort({ createdAt: -1 })
          .toArray();

        res.json(requests);
      } catch (error) {
        console.error("Fetch leaves error:", error);
        res.status(500).json({
          message: "Could not load leave requests."
        });
      }
    });

    // Approve or decline a pending request
    app.patch("/api/leaves/:id", async (req, res) => {
      try {
        const { status, reviewer } = req.body;

        if (!["Approved", "Declined"].includes(status)) {
          return res.status(400).json({
            message: "Choose Approved or Declined."
          });
        }

        if (!ObjectId.isValid(req.params.id)) {
          return res.status(400).json({
            message: "Invalid leave request ID."
          });
        }

        const result = await leaveRequests.updateOne(
          {
            _id: new ObjectId(req.params.id),
            status: "Pending"
          },
          {
            $set: {
              status,
              reviewer: reviewer || "Manager",
              reviewedAt: new Date()
            }
          }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({
            message: "Request not found or already reviewed."
          });
        }

        console.log("\nLEAVE REQUEST STATUS UPDATED IN MONGODB");
        console.log("New status:", status);

        await showDatabaseRecords();

        res.json({
          message: `Leave request ${status.toLowerCase()} successfully.`
        });
      } catch (error) {
        console.error("Update leave error:", error);
        res.status(500).json({
          message: "Could not update the leave request."
        });
      }
    });

    // Manually display all records by opening /api/leaves/database
    app.get("/api/leaves/database", async (req, res) => {
      try {
        await showDatabaseRecords();

        const records = await leaveRequests
          .find()
          .sort({ createdAt: -1 })
          .toArray();

        res.json({
          message: "Database records printed in the VS Code terminal.",
          totalRecords: records.length,
          records
        });
      } catch (error) {
        console.error("Database display error:", error);
        res.status(500).json({
          message: "Could not display database records."
        });
      }
    });

    app.listen(PORT, () => {
      console.log(
        `Leave Management System running at http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error("Could not connect to MongoDB. Check your .env settings.");
    console.error(error.message);
    process.exit(1);
  }
}

startServer();
