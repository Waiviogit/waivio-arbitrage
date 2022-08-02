import { OpenMarketType } from '../../../domain/rebalancing/types';

export type PrepareNotificationType = {
  pools: OpenMarketType[];
  account: string;
  differencePercentSubscription: number;
};

export type CheckNotificationSentRecentlyType = {
  pool: OpenMarketType;
  account: string;
  differencePercentSubscription: number;
};

export type CheckDifferencePercentChangeType = {
  notifications: string[];
  pool: OpenMarketType;
  percentStep: string;
}
