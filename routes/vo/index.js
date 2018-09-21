class ResponceVo {
    constructor(status, data, message = null, code = 0) {
        this.status = status;
        this.data = data;
        this.message = message;
        this.code = code;
    }
}

module.exports = { ResponceVo };