var express = require('express');
var router = express.Router();

const sqlite3 = require('sqlite3').verbose();

let isConnectedToDB = false;

let tempTODOs = [
    "Router ✅ (used react-router)",
    "Redux (with middleware) ⏳ ",
    "CSS Pre-Processor ✅ (used SCSS)",
    "fetch & promise ✅",
    "React-Form ⏲",
    "Modules/Code Splitting/AMD/locale ✅ (used react-loadable)",
    "ErrorBoundries ✅",
    "Router in Plugin ⏲",
    "context API for Plugin vs Standalone ⏲",
    "Base Module with Lang✅, ErrorBoundries ✅",
    "Base Component with Lang⏲, ErrorBoundries⏲",
    "Base popup with Lang⏲, ErrorBoundries⏲",
    "How are we going to load ADM popup's (using redux action or event-pool class?) ??? ⏲",
    "use codemod script for changing/update depcriated lifecycle hooks (for React 16.x canges) ⏲",
    "Portals for Popup ✅, Toaster ⏲",
    "React Transitions ⏲",
    "Scrollbar component ⏲",
    "Generic Alert/Confirmation/Question popup component (Just Like Flex Alert Compoment).✅ ",
    "Load on-demand AMD package (in P3ModuleBase like popup definitions, when demanded) ✅",
];

const TODO_STATUS = {
    OPEN: 0,
    INPROGRESS: 1,
    DONE: 2,
    HOLD: 3,
    CANCELLED: 4
}

let db = new sqlite3.Database('./data/jagan-todos.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (error) => {
    if (error) {
        // TODO ::
        console.error('Error Opening DB', error)
    } else {
        console.info('Connected to DB');

        db.serialize(() => {

            // sql to get the list of table names in the sqlite db.
            // SELECT `name`, `sql` FROM `sqlite_master` WHERE type='table';

            db.run('CREATE TABLE AI(id, label, status, ts)', [], (error) => {
                if (error) {
                    console.error('Failed to create tabel AI', error);
                } else {
                    insertDefaultValues();
                    isConnectedToDB = true;
                }
            });
        });
    }
});

function insertDefaultValues() {
    db.parallelize(() => {
        let todos = tempTODOs.map(todo => ({ label: todo, id: Date.now(), status: TODO_STATUS.OPEN }));
        todos.forEach(todo => {
            db.run(`INSERT INTO AI(id, label, status, ts) VALUES("${todo.id}", "${todo.label}", "${todo.status}", "${Date.now()}")`, (error) => {
                if (error) {
                    console.error(error);
                }
            });
        });
    });
}

db.close();

class ResponceVo {
    constructor(status, data, message = null, code = 0) {
        this.status = status;
        this.data = data;
        this.message = message;
        this.code = code;
    }
}


/* ALL todo listing. */
router.all('/', function (req, res, next) {

    let sql = `SELECT * FROM AI ORDER BY id`;

    let db = new sqlite3.Database('./data/jagan-todos.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (error) => {
        if (error) {
            console.error('Error Opening DB', error);
        } else {
            db.all(sql, [], (error, rows) => {
                if (error) {
                    res.send(new ResponceVo(false, error, 'DB Error'));
                } else {
                    res.send(new ResponceVo(true, rows));
                }
                db.close();
            });
        }
    });
});


router.all('/update', function (req, res, next) {

    let db = new sqlite3.Database('./data/jagan-todos.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (error) => {
        if (error) {
            console.error('Error Opening DB', error);
        } else {

            db.serialize(() => {
                let payload = req.body;
                let sql = `UPDATE AI SET status=?, label=? WHERE id=?`;
                db.run(sql, [payload.status, payload.label, payload.id], (error, rows) => {
                    if (error) {
                        res.send(new ResponceVo(false, error, error.message));
                    } else {
                        res.send(new ResponceVo(true, rows));
                    }
                    db.close();
                });
            });
        }
    });
});

router.all('/add', function (req, res, next) {

    let db = new sqlite3.Database('./data/jagan-todos.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (error) => {
        if (error) {
            console.error('Error Opening DB', error);
        } else {
            let todo = req.body;
            let sql = `INSERT INTO AI(id, label, status, ts) VALUES(?, ?, ?, ?)`;
            
            db.run(sql, [Date.now(), todo.label, todo.status, Date.now()], (error) => {
                if (error) {
                    res.send(new ResponceVo(false, error, error.message));
                } else {
                    res.send(new ResponceVo(true, null));
                }
            });
        }
    });
});

module.exports = router;
