class Transaction {
    constructor() {
        this.IndexARR = [];
        this.logs = [];
        this.BeforeLogs = [];
        this.NewScenario = [];
        this.NewOBJForLogs = {};
    }
    async dispatch(scenario) {
        scenario.forEach((element, key) => {
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
        this.NewScenario.forEach(async(element) => {
            try {
                var callValue = await element.call({});
                this.NewOBJForLogs = {};
                Object.assign(this.NewOBJForLogs, {
                    index: element.index,
                    meta: element.meta,
                    storeBefore: {},
                    storeAfter: callValue,
                    error: null
                })
                this.logs.push(this.NewOBJForLogs)
            } catch (err) {
                var Restored = await element.restore("restored")
                console.log(Restored);
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
                } else if (typeof element.restore !== 'undefined') {
                    this.NewOBJForLogs = {};
                    Object.assign(this.NewOBJForLogs, {
                        storeBefore: {},
                        storeAfter: "Restored",
                        error: {
                            name: err.name,
                            message: err.message,
                            // stack: err.stack
                        }
                    })
                    this.logs.push(this.NewOBJForLogs);
                }
            }
        })
    }
}

const scenario = [{
        index: 30,
        meta: {
            title: 'Read popular customers',
            description: 'This action is responsible for reading the most popular customers'
        },
        // callback for main execution
        call: async(store) => {
            throw new Error("dima mezrishvili")
        },
        // // callback for rollback
        restore: async(store) => {
            return store
        }
    },
    {
        index: 50,
        meta: {
            title: 'Delete customer',
            description: 'This action is responsible for deleting customer'
        },
        // callback for main execution
        call: async(store) => {
            return store
        },
        // callback for rollback
        restore: async(store) => {
            return store
        }
    }
];

const transaction = new Transaction();

(async() => {
    try {
        await transaction.dispatch(scenario);
        // const store = transaction.store; // {} | null
        const logs = transaction.logs; // []
        console.log(logs);
    } catch (err) {
        console.log(err.message);
        // log detailed error
    }
})();