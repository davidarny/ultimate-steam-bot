import _ from 'lodash';

export function message(str?: string): string {
  return `[ApiResponse]: ${_.isNil(str) ? '' : str}`;
}
