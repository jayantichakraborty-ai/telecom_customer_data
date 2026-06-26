const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const dbPath = path.join(__dirname, "db.json");
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Helper: read db
function readDb() {
  return JSON.parse(fs.readFileSync(dbPath, "utf-8"));
}

// Helper: write db
function writeDb(db) {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

// ============================================
//  ACCOUNTS ROUTES
// ============================================

app.get("/accounts", (req, res) => {
  const db = readDb();
  let results = db.accounts;

  if (req.query.account_name) {
    results = results.filter((a) =>
      a.account_name.toLowerCase().includes(req.query.account_name.toLowerCase())
    );
  }
  if (req.query.account_type) {
    results = results.filter(
      (a) => a.account_type.toLowerCase() === req.query.account_type.toLowerCase()
    );
  }
  if (req.query.account_id) {
    results = results.filter((a) => a.account_id === req.query.account_id);
  }

  res.json(results);
});

app.get("/accounts/:account_id", (req, res) => {
  const db = readDb();
  const account = db.accounts.find((a) => a.account_id === req.params.account_id);

  if (account) {
    res.json(account);
  } else {
    res.status(404).json({ error: "Account not found" });
  }
});

app.post("/accounts", (req, res) => {
  const db = readDb();
  const newAccount = {
    id: db.accounts.length > 0 ? Math.max(...db.accounts.map((a) => a.id)) + 1 : 1,
    account_id: req.body.account_id || String(1000 + db.accounts.length + 1),
    account_name: req.body.account_name || "New Account",
    account_type: req.body.account_type || "savings",
    balance: req.body.balance || "0",
  };

  db.accounts.push(newAccount);
  writeDb(db);
  res.status(201).json(newAccount);
});

app.put("/accounts/:account_id", (req, res) => {
  const db = readDb();
  const index = db.accounts.findIndex((a) => a.account_id === req.params.account_id);

  if (index === -1) {
    return res.status(404).json({ error: "Account not found" });
  }

  db.accounts[index] = {
    ...db.accounts[index],
    ...req.body,
    id: db.accounts[index].id,
    account_id: db.accounts[index].account_id,
  };

  writeDb(db);
  res.json(db.accounts[index]);
});

app.delete("/accounts/:account_id", (req, res) => {
  const db = readDb();
  const index = db.accounts.findIndex((a) => a.account_id === req.params.account_id);

  if (index === -1) {
    return res.status(404).json({ error: "Account not found" });
  }

  const deleted = db.accounts.splice(index, 1);
  writeDb(db);
  res.json({ message: "Account deleted", account: deleted[0] });
});

// ============================================
//  LOANS ROUTES
// ============================================

app.get("/loans", (req, res) => {
  const db = readDb();
  let results = db.loans;

  if (req.query.loanID) {
    results = results.filter((l) => l.loanID === req.query.loanID);
  }

  if (req.query.customerName) {
    results = results.filter((l) =>
      l.customerName.toLowerCase().includes(req.query.customerName.toLowerCase())
    );
  }

  if (req.query.status) {
    results = results.filter(
      (l) => l.status.toLowerCase() === req.query.status.toLowerCase()
    );
  }

  if (req.query.loanType) {
    results = results.filter(
      (l) => l.loanType.toLowerCase() === req.query.loanType.toLowerCase()
    );
  }

  res.json(results);
});

app.get("/loans/:loanID", (req, res) => {
  const db = readDb();
  const loan = db.loans.find((l) => l.loanID === req.params.loanID);

  if (loan) {
    res.json(loan);
  } else {
    res.status(404).json({ error: "Loan not found" });
  }
});

app.post("/loans", (req, res) => {
  const db = readDb();

  const newLoan = {
    id: req.body.id || String(db.loans.length + 1),
    loanID: req.body.loanID || `L${1000 + db.loans.length + 1}`,
    customerName: req.body.customerName || "New Customer",
    status: req.body.status || "Active",
    PaymentAmount: req.body.PaymentAmount || "0",
    loanType: req.body.loanType || "Personal",
  };

  db.loans.push(newLoan);
  writeDb(db);
  res.status(201).json(newLoan);
});

app.put("/loans/:loanID", (req, res) => {
  const db = readDb();
  const index = db.loans.findIndex((l) => l.loanID === req.params.loanID);

  if (index === -1) {
    return res.status(404).json({ error: "Loan not found" });
  }

  db.loans[index] = {
    ...db.loans[index],
    ...req.body,
    id: db.loans[index].id,
    loanID: db.loans[index].loanID,
  };

  writeDb(db);
  res.json(db.loans[index]);
});

app.delete("/loans/:loanID", (req, res) => {
  const db = readDb();
  const index = db.loans.findIndex((l) => l.loanID === req.params.loanID);

  if (index === -1) {
    return res.status(404).json({ error: "Loan not found" });
  }

  const deleted = db.loans.splice(index, 1);
  writeDb(db);
  res.json({ message: "Loan deleted", loan: deleted[0] });
});

// ============================================
//  ROOT
// ============================================
app.get("/", (req, res) => {
  res.json({
    message: "Kore.ai Mock API Server",
    endpoints: {
      accounts: {
        list_all: "GET /accounts",
        get_by_id: "GET /accounts/1001",
        search_by_name: "GET /accounts?account_name=June",
        search_by_type: "GET /accounts?account_type=savings",
        create: "POST /accounts",
        update: "PUT /accounts/1001",
        delete: "DELETE /accounts/1001"
      },
      loans: {
        list_all: "GET /loans",
        get_by_id: "GET /loans/L1005",
        search_by_customer: "GET /loans?customerName=Ishan",
        search_by_type: "GET /loans?loanType=Car",
        search_by_status: "GET /loans?status=Active",
        create: "POST /loans",
        update: "PUT /loans/L1005",
        delete: "DELETE /loans/L1005"
      }
    }
  });
});


// ============================================
//  Start Server
// ============================================
app.listen(PORT, () => {
  console.log(`Mock API Server is running on port ${PORT}`);

  console.log(`\nACCOUNTS ROUTES`);
  console.log(`  GET    /accounts                       - List all accounts`);
  console.log(`  GET    /accounts/:account_id            - Get account by ID`);
  console.log(`  GET    /accounts?account_name=June      - Filter by name`);
  console.log(`  GET    /accounts?account_type=savings   - Filter by type`);
  console.log(`  POST   /accounts                       - Create account`);
  console.log(`  PUT    /accounts/:account_id            - Update account`);
  console.log(`  DELETE /accounts/:account_id            - Delete account`);

  console.log(`\nLOANS ROUTES`);
  console.log(`  GET    /loans                          - List all loans`);
  console.log(`  GET    /loans/:loanID                   - Get loan by ID`);
  console.log(`  GET    /loans?customerName=Ishan        - Filter by customer`);
  console.log(`  GET    /loans?loanType=Car              - Filter by type`);
  console.log(`  GET    /loans?status=Active             - Filter by status`);
  console.log(`  POST   /loans                          - Create loan`);
  console.log(`  PUT    /loans/:loanID                   - Update loan`);
  console.log(`  DELETE /loans/:loanID                   - Delete loan`);
});

