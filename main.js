class Transaction {
    constructor() {
        this.IndexARR = [];
        this.logs = [];
        this.store = null;
        this.storeBF = {};
        this.BeforeLogs = [];
        this.NewScenario = [];
        this.NewOBJForLogs = {};
        this.NewOBJForLogsRS = {};
    }
    async dispatch(scenario) {
        scenario.forEach((element) => {
            if (typeof element.index == 'undefined' || typeof element.index !== "number") {
                throw new Error("Invalid object, index is required")
            } else if (typeof element.meta.title == 'undefined' || typeof element.meta.description == 'undefined') {
                throw new Error("Invalid object, Meta is required to have title and description")
            } else if (typeof element.call == "undefined" || typeof element.call !== 'function') {
                throw new Error("Invalid object, call is required and must be function")
            }
            this.IndexARR.push(element.index);
        });
        this.IndexARR.sort(function(a, b) {
            return a - b
        })
        for (var i of this.IndexARR) {
            scenario.forEach((element) => {
                if (i == element.index) {
                    this.NewScenario.push(element)
                }
            })
        }
        main: for (var element of this.NewScenario) {
            try {
                var callValue = await element.call();
                this.NewOBJForLogs = {};
                Object.assign(this.NewOBJForLogs, {
                    index: element.index,
                    meta: element.meta,
                    storeBefore: this.storeBF,
                    storeAfter: callValue,
                    error: null
                })
                this.logs.push(this.NewOBJForLogs)
                this.storeBF = {};
                Object.assign(this.storeBF, {
                    before: callValue
                })
            } catch (err) {
                if (typeof element.restore == 'undefined') {
                    this.NewOBJForLogs = {};
                    Object.assign(this.NewOBJForLogs, {
                        index: element.index,
                        meta: element.meta,
                        error: {
                            name: err.name,
                            message: err.message,
                            // stack: err.stack
                        }
                    })
                    this.logs.push(this.NewOBJForLogs);
                    this.store = {};
                } else if (typeof element.restore !== 'undefined') {
                    try {
                        var Restored = await element.restore("restored");
                        this.NewOBJForLogs = {};
                        Object.assign(this.NewOBJForLogs, {
                            index: element.index,
                            meta: element.meta,
                            storeBefore: {},
                            error: {
                                CallError: JSON.stringify({
                                    name: err.name,
                                    message: err.message

                                }),
                                RestoreError: null

                            },
                            storeAfter: Restored
                        })
                        this.storeBF = {};
                        this.store = null
                        this.logs.push(this.NewOBJForLogs);
                    } catch (er) {
                        this.NewOBJForLogs = {};
                        Object.assign(this.NewOBJForLogs, {
                            index: element.index,
                            meta: element.meta,
                            error: {
                                CallError: JSON.stringify({
                                    Name: err.name,
                                    Message: err.message,
                                }),
                                RestoreError: JSON.stringify({
                                    Name: er.name,
                                    Message: er.message
                                })
                            }
                            // stack: err.stack                            

                        })
                        this.logs.push(this.NewOBJForLogs);
                        this.store = {};
                        try {
                            await element.restore("restored");
                        } catch (error3) {
                            this.NewOBJForLogsRS = {}
                            var k = this.logs.length - 1
                            Object.assign(this.NewOBJForLogsRS, {
                                index: this.logs[k].index,
                                meta: this.logs[k].meta,
                                Error: {
                                    name: error3.name,
                                    message: error3.message
                                }
                            })
                            this.logs.push(this.NewOBJForLogsRS);
                            for (var i = this.logs.length - 3; i >= 0; i--) {
                                if (typeof this.NewScenario[i].restore == 'undefined') {
                                    this.NewOBJForLogsRS = {};
                                    Object.assign(this.NewOBJForLogsRS, {
                                        index: this.logs[i].index,
                                        meta: this.logs[i].meta,
                                        error: {
                                            name: "restore is not defined"
                                        }

                                    })
                                    this.storeBF = {};
                                    this.logs.push(this.NewOBJForLogsRS);

                                    break main
                                }
                                try {
                                    this.NewOBJForLogsRS = {};
                                    Object.assign(this.NewOBJForLogsRS, {
                                        index: this.logs[i].index,
                                        meta: this.logs[i].meta,
                                        storeAfter: await this.NewScenario[i].restore("restored")
                                    })
                                    this.storeBF = {};
                                    this.logs.push(this.NewOBJForLogsRS);

                                } catch (err3) {
                                    Object.assign(this.NewOBJForLogsRS, {
                                            index: this.logs[i].index,
                                            meta: this.logs[i].meta,
                                            Error: {
                                                name: err3.name,
                                                message: err3.message
                                            }
                                        })
                                        // this.store = null
                                    this.logs.push(this.NewOBJForLogsRS);
                                }
                            }
                            break main
                        }
                    }
                }
            }
        } /* loop ending*/
    }
}

const scenario = [{
        index: 1,
        meta: {
            title: 'Read popular customers',
            description: 'This action is responsible for reading the most popular customers'
        },
        // callback for main execution
        call: async(store) => {
            // return 1;
            throw new Error("dima mezrishvili")
        },
        // // callback for rollback
        restore: async(store) => {
            return store;
            // throw new Error("Restore Error for scenario 1")
        }
    },
    {
        index: 2,
        meta: {
            title: 'Delete customer',
            description: 'This action is responsible for deleting customer'
        },
        // callback for main execution
        call: async(store) => {
            return 2;
            // throw new Error("Call Error for scenario 2")
        },
        // callback for rollback
        restore: async(store) => {
            return store;
            // throw new Error("Restore Error for scenario 2")
        }
    },
    {
        index: 3,
        meta: {
            title: 'Delete customer',
            description: 'This action is responsible for deleting customer'
        },
        // callback for main execution
        call: async(store) => {
            // return 2;
            throw new Error("Call Error for scenario 3")
        },
        // callback for rollback
        restore: async(store) => {
            return store;
            // throw new Error("Restored With Error scenario 3")
        }
    },
    {
        index: 4,
        meta: {
            title: 'Delete customer',
            description: 'This action is responsible for deleting customer'
        },
        // callback for main execution
        call: async(store) => {
            // return 2;
            throw new Error("Call Error for scenario 4")
        },
        // callback for rollback
        restore: async(store) => {
            // return store;
            throw new Error("Restore Error for scenario 4")
        }
    }
];

const transaction = new Transaction();

(async() => {
    try {
        await transaction.dispatch(scenario);
        const store = transaction.store; // {} | null
        const logs = transaction.logs; // []
        console.log(logs);
    } catch (err) {
        console.log(err.message);
        // log detailed error
    }
})();