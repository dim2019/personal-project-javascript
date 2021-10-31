import { CallErrorWithFailedRestore, CallErrorWithoutRestore, CallErrorWithSuccessRestore, CallSuccess, RollbackRestoreError, RollbackRestoreSuccess, RollbackRestoreUndefind } from "./component";

{   
    class Transaction{
        IndexARR: number[]
        logs: Array<CallSuccess | CallErrorWithoutRestore | CallErrorWithSuccessRestore | CallErrorWithFailedRestore | RollbackRestoreUndefind | RollbackRestoreSuccess | RollbackRestoreError> ;
        store: {} | null;
        storeBF: {};
        BeforeLogs: any[];
        NewScenario: any[];
        NewOBJForLogs: object;
        NewOBJForLogsRS: {};
        constructor(){
            this.IndexARR = [];
            this.logs = [];
            this.store = null;
            this.storeBF = {};
            this.BeforeLogs = [];
            this.NewScenario = [];
            this.NewOBJForLogs = {};
            this.NewOBJForLogsRS = {};
        }
        async dispatch(scenario: ScenarioCheck[]) {
            scenario.forEach((element) => {
                if (typeof element.index == 'undefined' || typeof element.index !== "number") {
                    throw new Error("Invalid object, index is required")
                } else if (typeof element.meta.title == 'undefined' || typeof element.meta.description == 'undefined') {
                    throw new Error("Invalid object, Meta is required to have title and description")
                }else if(typeof element.meta == "undefined" || typeof element.meta !== "object"){
                    throw new Error("Invalid object, Meta is required should be an Object")
                }
                else if (typeof element.call == "undefined" || typeof element.call !== 'function') {
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
                    this.NewOBJForLogs = {} as CallSuccess;
                    Object.assign(this.NewOBJForLogs, {
                        index: element.index,
                        meta: element.meta,
                        storeBefore: this.storeBF,
                        storeAfter: callValue,
                        error: null
                    })
                    this.logs.push(this.NewOBJForLogs as CallSuccess)
                    this.storeBF = {};
                    Object.assign(this.storeBF, {
                        before: callValue
                    })
                } catch (err) {
                    var ErrorForundefinedRestore = (err as Error);
                    if (typeof element.restore == 'undefined') {
                        this.NewOBJForLogs = {};
                        Object.assign(this.NewOBJForLogs, {
                            index: element.index,
                            meta: element.meta,
                            error: {
                                name: ErrorForundefinedRestore.name,
                                message: ErrorForundefinedRestore.message,
                            }
                        })
                        this.logs.push(this.NewOBJForLogs as CallErrorWithoutRestore);
                        this.store = {};
                    } else if (typeof element.restore !== 'undefined') {
                        try {
                            var Restored: any = await element.restore("restored");
                            this.NewOBJForLogs = {};
                            Object.assign(this.NewOBJForLogs, {
                                index: element.index,
                                meta: element.meta,
                                storeBefore: {},
                                error: {
                                    CallError: JSON.stringify({
                                        name: ErrorForundefinedRestore.name,
                                        message: ErrorForundefinedRestore.message
    
                                    }),
                                    RestoreError: null
    
                                },
                                storeAfter: Restored
                            })
                            this.storeBF = {};
                            this.store = null
                            this.logs.push(this.NewOBJForLogs as CallErrorWithSuccessRestore);
                        } catch (er) {
                            let ErrorForRestore = (er as Error);
                            this.NewOBJForLogs = {};
                            Object.assign(this.NewOBJForLogs, {
                                index: element.index,
                                meta: element.meta,
                                error: {
                                    CallError: JSON.stringify({
                                        Name: ErrorForundefinedRestore.name,
                                        Message: ErrorForundefinedRestore.message,
                                    }),
                                    RestoreError: JSON.stringify({
                                        Name: ErrorForRestore.name,
                                        Message: ErrorForRestore.message
                                    })
                                }
                                // stack: err.stack                            
    
                            })
                            this.logs.push(this.NewOBJForLogs as CallErrorWithFailedRestore);
                            this.store = {};
                            try {
                                await element.restore("restored");
                            } catch (error3) {
                                let ErrorForRollbackTodescribeLastScenario = (error3 as Error)
                                this.NewOBJForLogsRS = {}
                                var k = this.logs.length - 1
                                Object.assign(this.NewOBJForLogsRS, {
                                    index: this.logs[k].index,
                                    meta: this.logs[k].meta,
                                    Error: {
                                        name: ErrorForRollbackTodescribeLastScenario.name,
                                        message: ErrorForRollbackTodescribeLastScenario.message
                                    }
                                })
                                this.logs.push(this.NewOBJForLogsRS as RollbackRestoreError);
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
                                        this.logs.push(this.NewOBJForLogsRS as RollbackRestoreUndefind);
    
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
                                        this.logs.push(this.NewOBJForLogsRS as RollbackRestoreSuccess);
    
                                    } catch (err3) {
                                        let ErrorForRollBackWhenRestoreIsFaild = (err3 as Error);
                                        Object.assign(this.NewOBJForLogsRS, {
                                                index: this.logs[i].index,
                                                meta: this.logs[i].meta,
                                                Error: {
                                                    name: ErrorForRollBackWhenRestoreIsFaild.name,
                                                    message: ErrorForRollBackWhenRestoreIsFaild.message
                                                }
                                            })
                                        this.logs.push(this.NewOBJForLogsRS as RollbackRestoreError);
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

    interface ScenarioCheck{
        index: number;
        meta: {
            title: string;
            description: string;
        }
        call: (store?: any)=> any;
        restore?: (store?: any)=> any;

    }

    const scenario= [{
        index: 1,
        meta: {
            title: 'Read popular customers',
            description: 'This action is responsible for reading the most popular customers'
        },
        call: async(store: any) => {
            return 1
            throw new Error("Call Error For Scenario 1")
        },
        restore: async(store: any) => {
            return store;
            throw new Error("restore Error For Scenario 1")
        }
    },
    {
        index: 2,
        meta: {
            title: 'Delete customer',
            description: 'This action is responsible for deleting customer'
        },
        call: async(store: any) => {
            // return 2;
            throw new Error("Call Error For Scenario 2")
        },
        restore: async(store: any) => {
            return store;
            throw new Error("restore Error For Scenario 2")
        }
    },
    {
        index: 3,
        meta: {
            title: 'Read popular customers',
            description: 'This action is responsible for reading the most popular customers'
        },
        call: async(store: any) => {
            throw new Error("Call Error For Scenario 3")
        },
        restore: async(store: any) => {
            return 3;
            throw new Error("restore Error For Scenario 3")
        }
    },
    {
        index: 4,
        meta: {
            title: 'Read popular customers',
            description: 'This action is responsible for reading the most popular customers'
        },
        call: async(store: any) => {
            // return 4
            throw new Error("Call Error For Scenario 4")
        },
        restore: async(store: any) => {
            // return 4;
            throw new Error("restore Error For Scenario 4")
        }
    },
    ];
    
    const transaction = new Transaction();
    
    (async() => {
        try {
            await transaction.dispatch(scenario);
            const store : null | {} = transaction.store; // {} | null
            const logs: object[] = transaction.logs; // []
            console.log(logs);
        } catch (err) {
           var result = (err as Error);
           console.log(result.message);
           
        }
    })();
}