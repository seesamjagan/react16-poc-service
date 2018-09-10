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

const DB_RUN_MODE = {
    DEFAULT: false,
    PARALLIZE: 'parallize',
    SERIALIZE: 'serialize',
}

class ResponceVo {
    constructor(status, data, message = null, code = 0) {
        this.status = status;
        this.data = data;
        this.message = message;
        this.code = code;
    }
}

const requestHandler = (error, result, req, res, next) => {
    if (error) {
        res.send(new ResponceVo(false, error, error.message));
    } else {
        res.send(new ResponceVo(true, result));
    }
};

function run(sql, params = [], callback = null, runMode = false, useAll=false) {
    let db = new sqlite3.Database('./data/jagan-todos.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (error) => {
        if (error) {
            callback && callback(error);
        } else {
            if (runMode) {
                db[runMode](() => {
                    // TODO :: modify this case to run multiple sql's
                    // TODO :: conside useAll
                    // TODO :: how to make a single 'callback' when running multiple [COMMANDS] ?
                    db.run(sql, params, (error, rows) => {
                        if (error) {
                            callback && callback(error);
                        } else {
                            callback && callback(null, rows);
                        }
                    });
                    db.close();
                });
            } else {
                let command = useAll ? 'all' : 'run';

                db[command](sql, params, (error, result) => {
                    if (error) {
                        callback && callback(error);
                    } else {
                        callback && callback(null, result);
                    }
                });
                db.close();
            }
        }
    });
}

function initilizeDB() {
    run('CREATE TABLE AI(id, label, status, ts)', [], (error, result) => {
        if (error) {
            console.error('Failed to create tabel AI', error);
        } else {
            insertDefaultValues();
            isConnectedToDB = true;
        }
    }, DB_RUN_MODE.DEFAULT);
}


function insertDefaultValues() {
    let todos = tempTODOs.map((todo, index) => ({ label: todo, id: index, status: TODO_STATUS.OPEN }));
    let query = [], params = [];
    todos.forEach(todo => {
        query.push('(?, ?, ?, ?)');
        params.push(todo.id, todo.label, todo.status, Date.now());
    });
    let sql = `INSERT INTO AI(id, label, status, ts) VALUES${query.join(', ')}`;
    run(sql, params, (error, result) => {
        if (error) {
            console.error(error);
        } else {
            console.info('Initilized AI table with default values');
        }
    });
}

initilizeDB();

/* ALL todo listing. */
router.all('/', function (req, res, next) {
    let sql = `SELECT * FROM AI ORDER BY id`;
    run(sql, [], (error, result) => requestHandler(error, result, req, res, next), DB_RUN_MODE.DEFAULT, true);
});

router.all('/update', function (req, res, next) {

    let payload = req.body;
    let sql = `UPDATE AI SET status=?, label=? WHERE id=?`;
    run(sql, [payload.status, payload.label, payload.id], (error, result) => requestHandler(error, result, req, res, next), DB_RUN_MODE.SERIALIZE);
});

router.all('/add', function (req, res, next) {

    let todo = req.body;
    let sql = `INSERT INTO AI(id, label, status, ts) VALUES(?, ?, ?, ?)`;

    run(sql, [Date.now(), todo.label, todo.status, Date.now()], (error, result) => requestHandler(error, result, req, res, next));
});

module.exports = router;