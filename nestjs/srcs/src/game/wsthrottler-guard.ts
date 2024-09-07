// import { ExecutionContext, Injectable } from '@nestjs/common';
// import {
//   ThrottlerException,
//   ThrottlerGuard,
//   ThrottlerRequest,
// } from '@nestjs/throttler';

// @Injectable()
// export class wsThrottlerGuard extends ThrottlerGuard {
//   async handleRequest(
//     request: ThrottlerRequest,
//     context: ExecutionContext,
//     limit: number,
//     ttl: number,
//   ): Promise<boolean> {
//     const client = context.switchToWs().getClient();
//     const ip = client.conn.remoteAddress;
//     const key = this.generateKey(context, ip, 'wsThrottle');
//     const ttls = await this.storageService.getRecord(key);

//     if (ttls.length >= limit) {
//       throw new ThrottlerException();
//     }

//     await this.storageService.incrementRecord(key, ttl);
//     return true;
//   }
// }
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  ThrottlerException,
  ThrottlerGuard,
  ThrottlerModuleOptions,
  ThrottlerRequest,
  ThrottlerStorage,
} from '@nestjs/throttler';
import { ThrottlerStorageRecord } from '@nestjs/throttler/dist/throttler-storage-record.interface';
// import { ThrottlerStorage } from './throttler-storage.interface';
// import { ThrottlerStorageRecord } from './throttler-storage-record.interface';

@Injectable()
export class WsThrottlerGuard extends ThrottlerGuard {
  constructor(
    options: ThrottlerModuleOptions,
    storageService: ThrottlerStorage,
    reflector: Reflector,
  ) {
    super(options, storageService, reflector);
  }

  async handleRequest(
    request: ThrottlerRequest, // Signature corrigée
  ): Promise<boolean> {
    const { context, limit, ttl } = request;
    const client = context.switchToWs().getClient();
    const ip = client.conn?.remoteAddress || 'unknown'; // Utilisation de 'unknown' si l'adresse IP est introuvable
    const key = this.generateKey(context, ip, 'wsThrottle');

    // Appel à l'interface ThrottlerStorage
    const throttlerRecord: ThrottlerStorageRecord =
      await this.storageService.increment(key, ttl, limit, 0, 'wsThrottle');

    if (throttlerRecord.isBlocked) {
      throw new ThrottlerException();
    }

    return true;
  }
}
