import { Inject, Injectable, Logger } from '@nestjs/common';
import { REDIS_PROVIDERS } from '../redis/constants/provider';
import { RedisBlockProcessorInterface } from '../redis/interfaces/redis-client.interfaces';
import {
  DEFAULT_START_ENGINE_BLOCK,
  REDIS_KEY,
} from '../redis/constants/redis.constants';
import { HiveEngineClientInterface } from '../services/hive-engine-api/interface';
import {
  HIVE_ENGINE_NODES,
  HIVE_ENGINE_PROVIDE,
} from '../services/hive-engine-api/constants';
import { ENGINE_PARSER_PROVIDERS } from './engine-parser/constants/provider';
import { EngineParserInterface } from './engine-parser/interfaces/engine-parser.interface';

@Injectable()
export class BlockProcessor {
  private _currentBlock: number;
  private readonly _logger = new Logger(BlockProcessor.name);
  private readonly _redisBlockKey: string = REDIS_KEY.LAST_BLOCK;
  private readonly _startDefaultBlock: number = DEFAULT_START_ENGINE_BLOCK;
  private hostUrl = HIVE_ENGINE_NODES[0];

  constructor(
    @Inject(REDIS_PROVIDERS.BLOCK_PROCESSOR)
    private readonly _redisProcessorClient: RedisBlockProcessorInterface,
    @Inject(HIVE_ENGINE_PROVIDE.CLIENT)
    private readonly _hiveEngineApiDomain: HiveEngineClientInterface,
    @Inject(ENGINE_PARSER_PROVIDERS.MAIN)
    private readonly _engineParser: EngineParserInterface,
  ) {}

  async start(): Promise<void> {
    console.log('started!');
    await this._loadNextBlock();
  }

  /** --------------------------PRIVATE METHODS----------------------------------------*/

  private async _loadNextBlock(): Promise<void> {
    this._currentBlock = await this._getBlockNumber();
    const start = process.hrtime();
    const processed = await this._processBlock(this._currentBlock);
    const end = process.hrtime(start);

    this._logger.log(`${this._currentBlock}: ${end[1] / 1000000}ms`);
    if (processed) {
      await this._redisProcessorClient.set(
        this._redisBlockKey,
        `${this._currentBlock + 1}`,
      );
      await this._loadNextBlock();
    } else {
      await setTimeout(async () => this._loadNextBlock(), 1000);
    }
  }

  private async _processBlock(blockNumber: number): Promise<boolean> {
    const block = await this._hiveEngineApiDomain.getBlock(
      blockNumber,
      this.hostUrl,
    );
    if (block instanceof Error) {
      this.changUrl(this.hostUrl);
      this._logger.log(this.hostUrl);
      return false;
    }
    if (block && (!block.transactions || !block.transactions[0])) {
      this._logger.log(`EMPTY BLOCK: ${blockNumber}`);

      return true;
    }
    if (block && block.transactions && block.transactions[0]) {
      await this._engineParser.parseEngineBlock(block.transactions);

      return true;
    }

    return false;
  }

  private async _getBlockNumber(): Promise<number> {
    const blockNumber = await this._redisProcessorClient.get(
      this._redisBlockKey,
    );
    if (blockNumber) return +blockNumber;

    return this._startDefaultBlock;
  }

  private changUrl(hostUrl): void {
    const index = hostUrl ? HIVE_ENGINE_NODES.indexOf(hostUrl) : 0;

    if (index === HIVE_ENGINE_NODES.length - 1) {
      this.hostUrl = HIVE_ENGINE_NODES[0];
    } else {
      this.hostUrl = HIVE_ENGINE_NODES[index + 1];
    }
  }
}
