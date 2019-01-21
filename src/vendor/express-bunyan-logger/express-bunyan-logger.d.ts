declare module 'express-bunyan-logger' {
  import Bunyan from 'bunyan';
  import express from 'express';

  export = Factory;

  function Factory(options?: Factory.Options): express.RequestHandler;

  namespace Factory {
    type FormatFunction = (meta: any) => string;
    type IncludesFunction = (req: express.Request, res: express.Response) => any;
    type RequestIdGenFunction = (req: express.Request) => string;
    type LevelFunction = (status: number, err: Error | null, meta: any) => string;

    interface Options {
      name?: string;
      streams?: Bunyan.Stream[];
      logger?: Bunyan;
      format?: string | FormatFunction;
      parseUA?: boolean;
      levelFn?: LevelFunction;
      includesFn?: IncludesFunction;
      excludes?: string[];
      obfuscate?: string[];
      obfuscatePlaceholder?: string;
      serializers?: { [field: string]: Bunyan.Serializer };
      immediate?: boolean;
      genReqId?: RequestIdGenFunction;
    }
  }
}
