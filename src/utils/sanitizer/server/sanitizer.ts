import _ from 'lodash';

export function message(str?: string): string {
  return `[ServerApp]: ${_.isNil(str) ? '' : str}`;
}
