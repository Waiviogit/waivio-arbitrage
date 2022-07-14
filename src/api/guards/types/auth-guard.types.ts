export type ValidateRequestType = {
  headers: HeadersRequestType;
  body: BodyRequest;
  path: string;
};

type HeadersRequestType = {
  'access-token'?: string;
  account?: string;
  'waivio-auth': string;
};

type BodyRequest = {
  _id?: string;
};
