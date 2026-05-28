import type { ConsumeMessage } from 'amqplib';
import { createLogger, getLogContext } from '../libs/logger';
import { rabbitMQService } from '../libs/rabbitmq';
import {
  recordJobFailure,
  recordJobStart,
  recordJobSuccess,
} from '../libs/metrics';
import { captureException } from '../libs/sentry';

export abstract class BaseWorker<TPayload> {
  private started = false;

  protected abstract readonly queueName: string;
  protected abstract readonly workerName: string;

  protected get log() {
    return createLogger({ module: 'worker', worker: this.workerName, queue: this.queueName });
  }

  protected abstract process(payload: TPayload, rawMessage: ConsumeMessage): Promise<void>;

  public async start() {
    if (this.started) return;

    await rabbitMQService.consume<TPayload>(
      this.queueName,
      async (payload, message) => {
        const { jobId, requestId } = getLogContext();
        const log = this.log;
        const startedAt = Date.now();

        recordJobStart(this.queueName);
        log.info({ jobId, requestId }, 'Job received');

        try {
          await this.process(payload, message);
          const durationMs = Date.now() - startedAt;
          recordJobSuccess(this.queueName, durationMs);
          log.info({ jobId, requestId, durationMs }, 'Job completed');
        } catch (error) {
          const durationMs = Date.now() - startedAt;
          recordJobFailure(this.queueName, durationMs);
          log.error({ err: error, jobId, requestId, durationMs }, 'Job failed');
          captureException(error, { worker: this.workerName, queue: this.queueName, jobId });
          throw error;
        }
      },
      { noAck: false },
    );

    this.started = true;
    this.log.info('Worker consumer started');
  }
}
