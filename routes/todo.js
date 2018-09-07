var express = require('express');
var router = express.Router();


class ResponceVo {
    constructor(status, data, message=null, code=0) {
        this.status = status;
        this.data = data;
        this.message = message;
        this.code = code;
    }
}

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


/* ALL todo listing. */
router.all('/', function(req, res, next) {
  res.send(new ResponceVo(true, tempTODOs.map(todo=>({label: todo, id: Date.now(), status: TODO_STATUS.OPEN}))));
});

module.exports = router;
