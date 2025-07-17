// ===================== Imports and Setup =====================
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: "localhost", // ✅ Correct
    user: "mohamed",     // ✅ Correct
    password: "2007", // ✅ Correct
    database: 'project_app'
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL');
});

// ===================== Project Routes =====================

// Show projects list
app.post('/projects/list', (req, res) => {
    const userId = req.body.userId;
    const admin = req.body.admin;
    let sql = `
        SELECT p.*, u.name AS user_name, c.name AS customer_name
        FROM projects p
        LEFT JOIN users u ON p.user_id = u.id
        LEFT JOIN customers c ON p.customer_id = c.id
    `;
    if (admin !== 'admin') {
        sql += ` WHERE p.user_id = ?`;
    }
    const params = admin !== 'admin' ? [userId] : [];
    db.query(sql, [params], (err, results) => {
        if (err) {
            console.error('Error fetching projects:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json(results);
    });
});

// Create a new project
app.post('/projects', (req, res) => {
    const { name, country, creation_date, update_date, scope, highlights, value, progress, ongoing, user_id, customer_id, cluster_id, status_id } = req.body;
    const values = [name, country, creation_date, update_date, scope, cluster_id, highlights, value, progress, ongoing, user_id, customer_id, status_id];
    if (
        !name.trim() ||
        !country.trim() ||
        !creation_date ||
        typeof value !== 'number' ||
        typeof progress !== 'number' ||
        isNaN(progress) ||
        progress < 0 ||
        progress > 100 ||
        (ongoing !== 'opened' && ongoing !== 'closed')
    ) {
        return res.status(400).json({ error: 'Invalid input value: progress must be between 0 and 100, ongoing must be \"opened\" or \"closed\"' });
    }
    const sql = `INSERT INTO projects (name, country, creation_date, update_date, scope, cluster_id, highlights, value, status, progress, ongoing, user_id, customer_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    db.query(sql, values, (err, results) => {
        if (err) {
            console.error('Error inserting project:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Project created successfully', projectId: results.insertId });
    });
});

// ===================== users Routes =====================
// Register a new user
const validateEmail =require('validator')
app.post('/signUp', (req, res) => {
    const { email, password } = req.body;
    const role = "user";
    if (!validateEmail(email)) {
        return res.status(400).json({ error: 'Invalid email address' });
    }
     // 1. Check if email already exists
     const checkSql = 'SELECT * FROM users WHERE email = ?';
     db.query(checkSql, [email], (checkErr, results) => {
         if (checkErr) {
             console.error('Check email error:', checkErr);
             return res.status(500).json({ error: 'Database error' });
         }
         if (results.length > 0) {
            return res.status(400).json({ error: 'Email already exists' });
         }
         // 2. Insert new user
         const sql = 'INSERT into users (email,password,role) values(?,?,?)';
         const values = [email, password, role];
         db.query(sql, values, (err, result) => {
             if (err) {
                 console.error('Register error:', err);
                 return res.status(500).json({ error: 'Database error' });
             }
             res.json({ message: 'User registered successfully', userId: result.insertId });
         });
     });
});


// Update user profile (set for the first time or update later)
app.put('/users/:id/profile', (req, res) => {
    const id = req.params.id;
    const { name, line_manager_id, organization_id, position_id, FE_BE } = req.body;
    if (!name || !line_manager_id || !organization_id || !position_id || (FE_BE && FE_BE !== 'FE' && FE_BE !== 'BE')) {
        return res.status(400).json({ error: 'Invalid input value' })
    }
    let fields = [];
    let values = [];
    if (name) {
        fields.push('name');
        values.push(name);
    }
    if (line_manager_id) {
        fields.push('line_manager_id');
        values.push(line_manager_id);
    }
    if (organization_id) {
        fields.push('organization_id');
        values.push(organization_id);
    }
    if (position_id) {
        fields.push('position_id');
        values.push(position_id);
    }
    if (FE_BE) {
        fields.push('FE_BE');
        values.push(FE_BE);
    }
    if (fields.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
    }
    values.push(id);
    const sql = `update users set ${fields.join('=?, ')}=? where id=?`;
    db.query(sql, values, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'user profile updated' });
    });
});

// see user profile (admin only)
app.get('/users/:id/profile', (req, res) => {
    const id = req.params.id;
    const role = req.body.role;
    if (role !== "admin") {
        return res.status(403).json({ error: 'Forbidden' });
    };
    db.query('select * from users where id=?', [id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});
// ===================== Project Routes 2 =====================
// Delete a project
app.delete('/projects/:id', (req, res) => {
    const projectId = req.params.id;
    const sql = 'DELETE FROM projects WHERE id = ?';
    db.query(sql, [projectId], (err, result) => {
        if (err) {
            console.error('Delete error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json({ message: 'Project deleted successfully' });
    });
});

// Update a project
app.put('/projects/:id', (req, res) => {
    const projectId = req.params.id;
    const { name, country, creation_date, update_date, scope, highlights, value, progress, ongoing, user_id, customer_id, cluster_id, status_id } = req.body;
    if (
        !name.trim() ||
        !country.trim() ||
        !creation_date ||
        typeof values !== 'number' ||
        typeof progress !== 'number' ||
        isNaN(progress) ||
        progress < 0 ||
        progress > 100 ||
        (ongoing !== 'opened' && ongoing !== 'closed')
    ) {
        return res.status(400).json({ error: 'Invalid input value: progress must be between 0 and 100, ongoing must be \"opened\" or \"closed\"' });
    }
    const sql = 'UPDATE projects SET name=?, country=?, creation_date=?, update_date=?,  scope=?, cluster=?, highlights=?, value=?, status=?, progress=?, ongoing=?, user_id=?, customer_id=? WHERE id=? ';
    const values = [name, country, creation_date, update_date, scope, , highlights, value, , progress, ongoing, user_id, customer_id, cluster_id, status_id, projectId];
    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Update error:', err);
            return res.status(500).json({ error: 'Error update project' });
        } else {
            res.json({ message: 'project update' });
        }
    });
});

// Show one project
app.get('/project/:id', (req, res) => {
    const projectId = req.params.id;
    const userId = Number(req.query.userId);
    const role = req.query.role;
    console.log('userId:', userId, 'role:', role, 'projectId:', projectId);
    let sql = `
        SELECT p.*, u.name AS user_name, c.name AS customer_name
        FROM projects p
        LEFT JOIN users u ON p.user_id=u.id
        LEFT JOIN customers c ON p.customer_id=c.id
        WHERE p.id=?`;
    db.query(sql, [projectId], (err, result) => {
        if (err) {
            return console.error('fetch error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }
        const project = result[0];
        if (role !== "admin" && project.user_id !== userId) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        res.json(project);
    });
});

// ===================== Customers Routes =====================

// Get all customers
app.get('/customers', (req, res) => {
    const role = req.body.role;
    if (role !== "admin") {
        return res.status(403).json({ error: 'Forbidden' });
    }
    db.query("SELECT * FROM customers", (err, data) => {
        if (err) return res.status(500).json(err);
        res.json(data);
    });
});

// Add new customer
app.post('/customers', (req, res) => {
    const role = req.body.role;
    if (role !== "admin") {
        return res.status(403).json({ error: 'Forbidden' });
    }
    const { name, country, highlights } = req.body;
    if (!name || !name.trim() || !country || !country.trim() || !highlights || !highlights.trim()) {
        return res.status(400).json({ error: 'Invalid input value' });
    }
    const sql = 'INSERT INTO customers (name, country, highlights) VALUES (?, ?, ?)';
    const value = [name, country, highlights];
    db.query(sql, vaule, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Customer added", id: result.insertId });
    });
});

// Update customer
app.put('/customers/:id', (req, res) => {
    const { name, country, highlights } = req.body;
    const id = req.params.id;
    const role = req.body.role;
    if (role !== "admin") {
        return res.status(403).json({ error: 'Forbidden' });
    }
    if (!name || !name.trim() || !country || !country.trim() || !highlights || !highlights.trim()) {
        return res.status(400).json({ error: 'Invalid input value' });
    }
    const sql = 'UPDATE customers SET name = ?, country = ?, highlights = ? WHERE id = ?';
    const value = [name, country, highlights, id];
    db.query(sql, value, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Customer updated' });
    });
});

// Delete customer
app.delete('/customers/:id', (req, res) => {
    const id = req.params.id;
    const role = req.body.role;
    if (role !== "admin") {
        return res.status(403).json({ error: 'Forbidden' });
    }
    const check = 'SELECT * FROM projects WHERE customer_id = ?';
    db.query(check, [id], (err, projects) => {
        if (err) {
            return res.status(500).json(err);
        }
        if (projects.length > 0) {
            return res.status(400).json({ message: "Cannot delete: projects linked to this customer" });
        }
        const sql = 'DELETE FROM customers WHERE id = ?';
        db.query(sql, [id], (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ message: 'Customer deleted' });
        });
    });
});

// ===================== Clusters Routes =====================

// Get all clusters
app.get('/culsters', (req, res) => {
    const role = req.body.role;
    if (role !== "admin") {
        return res.status(403).json({ error: 'Forbidden' });
    }
    db.query("SELECT * FROM clusters ", (err, date) => {
        if (err) return res.status(500).json(err);
        res.json(date);
    });
});

// Add a cluster
app.post('/culsters', (req, res) => {
    const { name } = req.body;
    const role = req.body.role;
    if (role !== "admin") {
        return res.status(403).json({ error: 'Forbidden' });
    }
    const sql = 'INSERT INTO name values (?) ';
    db.query(sql, [name], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "culster added", id: result.insertId });
    });
});

// Update a cluster
app.put('/culster/:id', (req, res) => {
    const id = req.params.id;
    const name = req.body;
    const role = req.body.role;
    if (role !== "admin") {
        return res.status(403).json({ error: 'Forbidden' });
    }
    const sql = 'updete culsters set name=? where id=?';
    const value = [name];
    sql.query(sql, [value], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'update is good' });
    });
});

// Delete a cluster
app.delete('/culster/:id', (req, res) => {
    const id = req.params.id;
    const role = req.body.role;
    if (role !== "admin") {
        return res.status(403).json({ error: 'Forbidden' });
    }
    const sql = 'delete from culsters wher id=?';
    db.query(sql, id, (err, result) => {
        if (err) {
            res.status(500).json(err);
            res.json({ message: 'delete a culster' });
        }
    });
});

// ===================== Status Routes =====================

// Get all statuses
app.get('/status', (req, res) => {
    const role = req.body.role;
    if (role !== "admin") {
        return res.status(403).json({ error: 'Forbidden' });
    }
    db.query("select * from statuses", (err, data) => {
        if (err) return res.status(500).json(err);
        res.json(data);
    });
});

// Delete a status by ID
app.delete('/status/:id', (req, res) => {
    const id = req.params.id;
    const role = req.body.role;
    if (role !== "admin") {
        return res.status(403).json({ error: 'Forbidden' });
    }
    const sql = 'DELETE FROM statuses WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Status deleted' });
    });
});

// Add new status (admin only)
app.post('/status', (req, res) => {
    const { name, role } = req.body;
    if (role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }
    if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Status name is required' });
    }
    const sql = 'INSERT INTO statuses (name) VALUES (?)';
    const values = [name.trim()];
    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error adding status:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ message: 'Status added successfully', id: result.insertId });
    });
});

// Update a status (admin only)
app.put('/status/:id', (req, res) => {
    const id = req.params.id;
    const { name, role } = req.body;
    if (role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
    }
    if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Status name is required' });
    }
    const sql = 'UPDATE statuses SET name = ? WHERE id = ?';
    const values = [name.trim(), id];
    db.query(sql, values, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Status updated' });
    });
})

// ===================== Positions Routes =====================

// Get all positions
app.get('/positions', (req, res) => {
    const role = req.body.role;
    if (role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
    }
    db.query('SELECT * FROM positions', (err, data) => {
        if (err) return res.status(500).json(err);
        res.json(data);
    });
});

// Add a new position (admin only)
app.post('/positions', (req, res) => {
    const role = req.body.role;
    if (role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
    }
    const { name } = req.body;
    if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Position name is required' });
    }
    const sql = 'INSERT INTO positions (name) VALUES (?)';
    db.query(sql, [name.trim()], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Position added', id: result.insertId });
    });
});

// Update a position (admin only)
app.put('/positions/:id', (req, res) => {
    const role = req.body.role;
    if (role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
    }
    const { name } = req.body;
    const id = req.params.id;
    if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Position name is required' });
    }
    const sql = 'UPDATE positions SET name = ? WHERE id = ?';
    db.query(sql, [name.trim(), id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Position updated' });
    });
});

// Delete a position (admin only)
app.delete('/positions/:id', (req, res) => {
    const role = req.body.role;
    if (role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
    }
    const id = req.params.id;
    const sql = 'DELETE FROM positions WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Position deleted' });
    });
});

// ===================== Line Managers Routes =====================

// Get all line managers
app.get('/line_managers', (req, res) => {
    const role = req.body.role;
    if (role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
    }
    db.query('SELECT * FROM line_manager', (err, data) => {
        if (err) return res.status(500).json(err);
        res.json(data);
    });
});

// Add a new line manager (admin only)
app.post('/line_managers', (req, res) => {
    const role = req.body.role;
    if (role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
    }
    const { name } = req.body;
    if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Line manager name is required' });
    }
    const sql = 'INSERT INTO line_manager (name) VALUES (?)';
    db.query(sql, [name.trim()], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Line manager added', id: result.insertId });
    });
});

// Update a line manager (admin only)
app.put('/line_managers/:id', (req, res) => {
    const role = req.body.role;
    if (role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
    }
    const { name } = req.body;
    const id = req.params.id;
    if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Line manager name is required' });
    }
    const sql = 'UPDATE line_manager SET name = ? WHERE id = ?';
    db.query(sql, [name.trim(), id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Line manager updated' });
    });
});

// Delete a line manager (admin only)
app.delete('/line_managers/:id', (req, res) => {
    const role = req.body.role;
    if (role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
    }
    const id = req.params.id;
    const sql = 'DELETE FROM line_manager WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Line manager deleted' });
    });
});

// ===================== Organization Routes =====================

// Get all organizations
app.get('/organization', (req, res) => {
    const role = req.body.role;
    if (role !== 'admin') {
        return res.status(403).json({ error: 'forbidden' });
    }
    db.query('select * from organizations', (err, data) => {
        if (err) return res.status(500).json(err);
        res.json(data);
    });
});

// Add a new organization (admin only)
app.post('/organization', (req, res) => {
    const role = "admin";
    if (role !== 'admin') {
        return res.status(403).json({ error: 'forbidden' });
    }
    const name = req.body.name;
    if (!name || !name.trim()) {
        return res.status(400).json({ error: 'organization name is required' });
    }
    const sql = 'insert into organizations (name) values(?)';
    db.query(sql, [name.trim()], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'organization added', id: result.insertId });
    });
});
// Update an organization (admin only)
app.put('/organization/:id', (req, res) => {
    const role = req.body.role;
    if (role !== 'admin') {
        return res.status(500).json({ error: 'forbidden' });
    }
    const id = req.params.id;
    const { name } = req.body;
    if (!name || !name.trim()) {
        return res.status(400).json({ error: 'organization name is required' });
    }
    const sql = ' update organizations set name = ? where id = ?';
    db.query(sql, [name.trim(), id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'organization updated' });
    });
});

// Delete an organization (admin only)
app.delete('/organization/:id', (req, res) => {
    const role = req.body.role;
    if (role !== "admin") {
        return res.status(403).json({ error: 'forbidden' });
    }
    const id = req.params.id;
    const sql = 'delete from organizationswhere id=?';
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ message: 'organization not found' });
        res.json({ message: 'organization deleted' });
    });


})
// ===================== type Routes =====================
// Get all types (admin only)
app.get("/type", (req, res) => {
    const role = "admin";
    if (role !== "admin") {
        res.json({ message: 'not admin' })
    };
    db.query('select * from type', (err, data) => {
        if (err)
            return res.status(500).json(err);
        res.json(data)
    });
});
// Add a new type (admin only)
app.post('/type', (req, res) => {
    const role = req.body.role;
    if (role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
    }
    const { name } = req.body;
    if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Type name is required' });
    }
    const sql = 'INSERT INTO type (name) VALUES (?)';
    db.query(sql, [name.trim()], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Type added', id: result.insertId });
    });
});
// Update a type (admin only)
app.put('/type/:id', (req, res) => {
    const role = req.body.role;
    if (role !== "admin") {
        return res.status(403).json({ error: `Forbbiden` }
        )
    };
    const id = req.params.id;
    const { name } = req.body;
    if (!name / !name.trim()) {
        return res.status(400).json({ error: `type name is required` })

    }
    const sql = `UPDATE type Set name = ? WHERE id= ?`;
    db.query(sql, [name.trim(), id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: `type updated` });

    })
})
//delete a type (admin only)
app.delete(`/type/:id`, (req, res) => {
    const role = req.body.role;
    if (role !== `admin`) {
        return res.status(403).json({ error: `forbidden` });
    }
    const id = req.params.id;
    const sql = `DELETE FROM type WHERE id = ?`;
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: `type deleted` });

    })

})
//====================== romotization routes =====================
//get all romotization
app.get('/romotization', (req, res) => {
    const role = req.body.role;
    if (role !== 'admin') {
        return res.status(403).json({ error: `Forbidden` });
    }
    db.query(`SELECT* FROM remotization`, (err, data) => {
        if (err) return res.status(500).json(err);
        res.json(data);
    })
})
//add a new romotization (admin only)
app.post('/romotization', (req, res) => {
    const role = 'admin';
    if (role !== 'admin')
        return res.status(403).json({ error: 'Forbidden' });
    const { name } = req.body;
    if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Romotization name is required' });
    };
    const sql = 'INSERT INTO remotization (name) VALUES (?)';
    db.query(sql, [name.trim()], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Romotization added', id: result.insertId });
    });
});
// Update a romotization (admin only)
app.put('/romotization/:id', (req, res) => {
    const role = req.body.role;
    if (role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
    }
    const id = req.params.id;
    const { name } = req.body;
    if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Romotization name is required' });
    }
    const sql = 'UPDATE remotization SET name = ? WHERE id = ?';
    db.query(sql, [name.trim(), id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Romotization updated' });
    });
})
// Delete a romotization (admin only)
app.delete('/romotization/:id', (req, res) => {
    const role = req.body.role;
    if (role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
    }
    const id = req.params.id;
    const sql = 'DELETE FROM remotization WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Romotization deleted' });
    });
});
// ===================== task_unite Routes =====================
app.get('/task_unite', (req, res) => {
    const role = req.body.role;
    if (role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
    }
    db.query('SELECT * FROM task_unit', (err, data) => {
        if (err) return res.status(500).json(err);
        res.json(data);
    });
});
// Add a new task_unite (admin only)
app.post('/task_unite', (req, res) => {
    const role = req.body.role;
    if (role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
    }
    const { name } = req.body;
    if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Task unite name is required' });
    }
    const sql = 'INSERT INTO task_unit (name) VALUES (?)';
    db.query(sql, [name.trim()], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Task unite added', id: result.insertId });
    });
});
// Update a task_unite (admin only)
app.put('/task_unite/:id', (req, res) => {
    const role = req.body.role;
    if (role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
    }
    const id = req.params.id;
    const { name } = req.body;
    if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Task unite name is required' });
    }
    const sql = 'UPDATE task_unit SET name = ? WHERE id = ?';
    db.query(sql, [name.trim(), id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Task unite updated' });
    });
})
// Delete a task_unite (admin only)     
app.delete('/task_unite/:id', (req, res) => {
    const role = req.body.role;
    if (role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
    }
    const id = req.params.id;
    const sql = 'DELETE FROM task_unit WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Task unite deleted' });
    });
});
// ===================== automated-tool Routes =====================
app.get('/automated', (req, res) => {
    const role = req.body.role;
    if (role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
    }
    db.query('SELECT * FROM automated_tool', (err, data) => {
        if (err) return res.status(500).json(err);
        res.json(data);
    });
});
// Add a new automated (admin only)
app.post('/automated', (req, res) => {
    const role = req.body.role;
    if (role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
    }
    const { name } = req.body;
    if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Automated name is required' });
    }
    const sql = 'INSERT INTO automated_tool (name) VALUES (?)';
    db.query(sql, [name.trim()], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Automated added', id: result.insertId });
    });
});
// Update an automated (admin only)
app.put('/automated/:id', (req, res) => {
    const role = req.body.role;
    if (role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
    }
    const id = req.params.id;
    const { name } = req.body;
    if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Automated name is required' });
    }
    const sql = 'UPDATE automated_tool SET name = ? WHERE id = ?';
    db.query(sql, [name.trim(), id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Automated updated' });
    });
})
// Delete an automated (admin only)
app.delete('/automated/:id', (req, res) => {
    const role = req.body.role;
    if (role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
    }
    const id = req.params.id;
    const sql = 'DELETE FROM automated_tool WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Automated deleted' });
    });
});
// ===================== conq_reason Routes =====================
app.get('/conq_reason   ', (req, res) => {
    const role = req.body.role;
    if (role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
    }
    db.query('SELECT * FROM conq_reason', (err, data) => {
        if (err) return res.status(500).json(err);
        res.json(data);
    });
});
// Add a new conq_reason (admin only)
app.post('/conq_reason', (req, res) => {
    const role = req.body.role;
    if (role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
    }
    const { name } = req.body;
    if (!name || !name.trim()) {
        return res.status(400).json({ error: 'conq_reason name is required' });
    }
    const sql = 'INSERT INTO conq_reason (name) VALUES (?)';
    db.query(sql, [name.trim()], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'conq_reason added', id: result.insertId });
    });
});
// Update a conq_reason (admin only)
app.put('/conq_reason/:id', (req, res) => {
    const role = req.body.role;
    if (role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
    }
    const id = req.params.id;
    const { name } = req.body;
    if (!name || !name.trim()) {
        return res.status(400).json({ error: 'conq_reason name is required' });
    }
    const sql = 'UPDATE conq_reason SET name = ? WHERE id = ?';
    db.query(sql, [name.trim(), id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'conq_reason updated' });
    });
})
// Delete a conq_reason (admin only)
app.delete('/conq_reason/:id', (req, res) => {
    const role = req.body.role;
    if (role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
    }
    const id = req.params.id;
    const sql = 'DELETE FROM conq_reason WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'conq_reason deleted' });
    });
});
// ===================== task rout =====================
app.post('/task', (req, res) => {
    const { name,
        project_id, type_id, description, task_unit_id, quantity, completed, owner, assignee, start_date,
        end_date, status_id, remotization_id, udm_compliance, automated, automated_tool_id, coNQ, coNQ_reason_id,
        automation_saving } = req.body;
    const values = [
        name, project_id, type_id, description, task_unit_id, quantity, completed, owner, assignee,
        start_date, end_date, status_id, remotization_id, udm_compliance, automated, automated_tool_id,
        coNQ, coNQ_reason_id, automation_saving
    ];
    // Validate required fields
    if (
        !name || !project_id || !type_id || !description || !task_unit_id || !quantity ||
        completed === undefined || !owner || !assignee || !start_date || !end_date ||
        !status_id || !remotization_id || (udm_compliance?.toLowerCase() !== 'yes' && udm_compliance?.toLowerCase() !== 'no') ||
        (automated?.toLowerCase() !== 'yes' && automated?.toLowerCase() !== 'no') ||
        (coNQ?.toLowerCase() !== 'yes' && coNQ?.toLowerCase() !== 'no') ||
        automated_tool_id === undefined || (coNQ_reason_id === undefined || isNaN(coNQ_reason_id)) ||
        automation_saving === undefined || isNaN(automation_saving))
        return res.status(400).json({ error: 'All fields are required' });

    const sql = ' INSERT INTO task (name, project_id, type_id, description, task_unit_id, quantity, completed, owner, assignee, start_date, end_date, status_id, remotization_id, udm_compliance, automated, automated_tool_id, coNQ, coNQ_reason_id, automation_saving) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error inserting task:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json({ message: 'Task added successfully', id: result.insertId });
    });
});





// ===================== Server Start =====================

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})