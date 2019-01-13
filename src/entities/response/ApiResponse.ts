import logger from '@utils/logger';
import * as ApiSanitizer from '@utils/sanitizer/api';
import _ from 'lodash';
import { IResponseFormat } from './IResponseFormat';

export class ApiResponse<T extends {}> {
  constructor(private readonly options: { data?: T; error?: Error }) {}

  public get(): IResponseFormat<T> {
    if (!_.isNil(this.options.error)) {
      logger.error(ApiSanitizer.message(), this.options.error);
      return {
        success: false,
        error: this.options.error.message,
      };
    }
    return {
      success: true,
      data: this.options.data,
    };
  }
}
