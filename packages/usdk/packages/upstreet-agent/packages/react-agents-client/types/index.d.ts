export type FetchOpts = {
  method?: string;
  headers?: object | Headers;
  body?: string | ArrayBuffer;
};
export type FetchableWorker = Worker & {
  fetch: (url: string, opts: FetchOpts) => Promise<Response>;
};