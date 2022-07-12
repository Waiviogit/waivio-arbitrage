import * as WebSocket from 'ws';
import { Injectable } from '@nestjs/common';
import { configService } from '../../common/config';
import { NOTIFICATION_URL } from './constants/notification-socket.constants';
import { NotificationDataType } from './types/notification.types';

@Injectable()
export class NotificationSocketClient {
  private readonly _url = `${configService.getWSUrl()}${NOTIFICATION_URL}`;
  private _ws = new WebSocket(this._url, [], {
    headers: { API_KEY: configService.getApiKey() },
  });
  constructor() {
    this._ws.on('open', () => {
      console.info('socket connection open');
    });

    this._ws.on('error', () => {
      this._ws.close();
    });
  }

  async sendMessage(data: NotificationDataType[]): Promise<void> {
    if (this._ws.readyState !== 1) {
      this._ws = new WebSocket(this._url, [], {
        headers: { API_KEY: configService.getApiKey() },
      });
      this._ws.on('error', () => {
        this._ws.close();
      });

      return;
    }

    // TODO проверить чтоб объект соответствовал
    this._ws.send(JSON.stringify({ payload: { id: 'arbitrage', data }, method: 'setNotification' }));
  }
}
