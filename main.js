class Transaction {
    constructor() {
        this.IndexARR = [];
        this.logs = [];
        this.store = null;
        this.storeBF = {};
        this.BeforeLogs = [];
        this.NewScenario = [];
        this.NewOBJForLogs = {};
    }
    async dispatch(scenario) {
        scenario.forEach((element) => {
            if (typeof element.index == 'undefined') {
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

        for (var element of this.NewScenario) {
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
                        var Restored = await element.restore("rollBacked");
                        this.NewOBJForLogs = {};
                        Object.assign(this.NewOBJForLogs, {
                            index: element.index,
                            meta: element.meta,
                            storeBefore: {},
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
                                name: er.name,
                                message: er.message,
                                // stack: err.stack
                            }

                        })
                        this.logs.push(this.NewOBJForLogs);
                        this.store = {};
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
            // return store;
            throw new Error("Restore Error for scenario 1")
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
            // return 2;
            throw new Error("Call Error for scenario 2")
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
            return 2;
            throw new Error("Call Error for scenario 2")
        },
        // callback for rollback
        restore: async(store) => {
            // return store;
            throw new Error("Restore Error for scenario 2")
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
            throw new Error("Call Error for scenario 2")
        },
        // callback for rollback
        restore: async(store) => {
            // return store;
            throw new Error("Restore Error for scenario 2")
        }
    }
];

const transaction = new Transaction();

(async() => {
    try {
        await transaction.dispatch(scenario);
        const store = transaction.store; // {} | null
        const logs = transaction.logs; // []
        console.log(store);
    } catch (err) {
        console.log(err.message);
        // log detailed error
    }
})();