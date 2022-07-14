export type addMemberToZsetType = {
  key: string;
  value: string;
  score: number;
};

export type zsetMembersByScoreType = {
  key: string;
  min: number;
  max: number;
};
