import { logger } from '../../lib/logger';
import type { SmsProvider } from './interface';

export class ConsoleSmsProvider implements SmsProvider {
  async sendOtp(mobile: string, code: string): Promise<void> {
    logger.info({ mobile, code }, 'JANANI OTP generated');
  }
}
