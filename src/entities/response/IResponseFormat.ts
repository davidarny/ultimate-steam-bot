export interface IResponseFormat<T extends {}> {
  success: boolean;
  data?: T;
  error?: string;
}
