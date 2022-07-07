export const HIVE_ENGINE_NODES = [
  'https://api.hive-engine.com/rpc', // Germany
  'https://api2.hive-engine.com/rpc', // Finland
  'https://herpc.dtools.dev', // Miami
  'https://us.engine.rishipanthee.com', // Finland
  'https://ha.herpc.dtools.dev', // New Jersey
];

export const TOKEN_WAIV = Object.freeze({
  SYMBOL: 'WAIV',
  POOL_ID: 13,
  TAGS: ['waivio', 'neoxian', 'palnet', 'waiv', 'food'],
  MARKET_POOL_ID: 63,
});

export const SUPPORTED_ENGINE_TOKENS = [TOKEN_WAIV];

export const ENGINE_METHOD = Object.freeze({
  FIND: 'find',
  FIND_ONE: 'findOne',
  GET_BLOCK_INFO: 'getBlockInfo',
});

export const ENGINE_ENDPOINT = Object.freeze({
  CONTRACTS: '/contracts',
  BLOCKCHAIN: '/blockchain',
});

export const ENGINE_ID = Object.freeze({
  MAIN_NET: 'ssc-mainnet-hive',
});

export const ENGINE_CONTRACT = Object.freeze({
  MARKETPOOLS: {
    NAME: 'marketpools',
    TABLE: {
      POOLS: 'pools',
    },
  },
  COMMENTS: {
    NAME: 'comments',
    TABLE: {
      VOTING_POWER: 'votingPower',
      REWARD_POOLS: 'rewardPools',
    },
    ACTION: {
      VOTE: 'vote',
    },
    EVENT: {
      NEW_VOTE: 'newVote',
      UPDATE_VOTE: 'updateVote',
      CURATION_REWARD: 'curationReward',
      AUTHOR_REWARD: 'authorReward',
      BENEFICIARY_REWARD: 'beneficiaryReward',
    },
  },
  TOKENS: {
    NAME: 'tokens',
    TABLE: {
      BALANCES: 'balances',
    },
    ACTION: {
      TRANSFER: 'transfer',
    },
  },
});

export const POST_REWARD_EVENTS = [
  ENGINE_CONTRACT.COMMENTS.EVENT.CURATION_REWARD,
  ENGINE_CONTRACT.COMMENTS.EVENT.AUTHOR_REWARD,
  ENGINE_CONTRACT.COMMENTS.EVENT.BENEFICIARY_REWARD,
];

export const ENGINE_MARKETPOOLS = Object.freeze({
  WAIV: 'SWAP.HIVE:WAIV',
});

export const MAX_VOTING_POWER = 10000;

export const VOTE_REGENERATION_DAYS = 5;

export const DOWNVOTE_REGENERATION_DAYS = 5;

export const REWARD_POOL_ID = Object.freeze({
  WAIV: 13,
});
