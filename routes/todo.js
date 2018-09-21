var { ResponceVo } = require('./vo');

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

const TODO_PRIORITY = {
    BLOCKER: 0,
    CRITICAL: 1,
    HIGH: 2,
    NORMAL: 3,
    LOW: 4
}

const TODO_TYPE = {
    TASK: 0,
    BUG: 1,
    
}

const DB_RUN_MODE = {
    DEFAULT: false,
    PARALLIZE: 'parallize',
    SERIALIZE: 'serialize',
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
            let command = useAll ? 'all' : 'run';
            if (runMode) {
                db[runMode](() => {
                    // TODO :: how to make a single 'callback' when running multiple [COMMANDS] ?
                    // TODO :: test this case
                    let queries = sql;
                    if(!Array.isArray(sql)) {
                        queries = [sql];
                    }
                    // This if case is logis is not working. Find Y?
                    console.log('sql: %O \n queries: %O \n params: %O', sql, queries, params);

                    queries.forEach(sql, ()=>{
                        db[command](sql, params, (error, rows) => {
                            if (error) {
                                callback && callback(error);
                            } else {
                                callback && callback(null, rows);
                            }
                        });
                    });
                    db.close();
                });
            } else {
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
    let sql = `CREATE TABLE AI(id PRIMARY KEY, title, status DEFAULT ${TODO_STATUS.OPEN}, description DEFAULT "", priority DEFAULT ${TODO_PRIORITY.HIGH}, type DEFAULT ${TODO_TYPE.TASK})`;
    let params = [];
    run(sql, params, (error, result) => {
        if (error) {
            console.error('Failed to create tabel AI', error);
        } else {
            insertDefaultValues();
            isConnectedToDB = true;
        }
    }, DB_RUN_MODE.DEFAULT);
}


function insertDefaultValues() {
    let todos = tempTODOs.map((todo, index) => ({ title: todo, id: index}));
    let query = [], params = [];
    todos.forEach(todo => {
        query.push('(?, ?)');
        params.push(todo.id, todo.title);
    });
    let sql = `INSERT INTO AI(id, title) VALUES${query.join(', ')}`;
    run(sql, params, (error, result) => {
        if (error) {
            console.error('Failed to inser default values in AI', error);
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
    let sql = `UPDATE AI SET status=?, title=?, priority=?, type=? WHERE id=?`;
    let params = [payload.status, payload.title, payload.priority, payload.type, payload.id];
    run(sql, params, (error, result) => requestHandler(error, result, req, res, next), DB_RUN_MODE.DEFAULT);
});

router.all('/add', function (req, res, next) {

    let todo = req.body;
    let sql = `INSERT INTO AI(id, title, status, priority, type) VALUES(?, ?, ?, ?, ?)`;
    let params = [Date.now(), todo.title, todo.status||TODO_STATUS.OPEN, todo.priority || TODO_PRIORITY.NORMAL, todo.type||TODO_TYPE.TASK];
    run(sql, params, (error, result) => requestHandler(error, result, req, res, next));
});

module.exports = router;