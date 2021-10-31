interface IndexAndMeta{
  index: number;
  meta: {
    title: string;
    description: string;
  };
}

export interface CallSuccess extends IndexAndMeta{
  storeBefore: {};
  storeAfter: any;
  error: null;
};
export interface CallErrorWithoutRestore extends IndexAndMeta{
  error: { 
      name: string;
      message: string;
      };
};
export interface CallErrorWithSuccessRestore extends IndexAndMeta{
  storeBefore: object;
  error: {
    CallError: string;
    RestoreError: null;
  };
  storeAfter: string;
};
export interface CallErrorWithFailedRestore extends IndexAndMeta{
  error: {
    CallError: string;
    RestoreError: string;
  };
};
export interface RollbackRestoreUndefind extends IndexAndMeta{
  error: {
       name: string;
   };
};
export interface RollbackRestoreSuccess extends IndexAndMeta{
  storeAfter: string;
};
export interface RollbackRestoreError extends IndexAndMeta{
  Error: {
       name: string; 
       message: string;
      }
};