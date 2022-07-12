export type ValidateRequestType = {
  headers: HeadersRequestType;
  body: BodyRequest;
};

type HeadersRequestType = {
  'access-token'?: string;
  account?: string;
  'waivio-auth': string;
};

type BodyRequest = {
  _id?: string;
};
