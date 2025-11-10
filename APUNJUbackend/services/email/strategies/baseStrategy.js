class BaseEmailStrategy {
    constructor(data){
        this.data = data;
    }
    getEmailOptions() {
        throw new Error("getEmailOptions method must be implemented in the subclass");
    }
}
module.exports = BaseEmailStrategy;