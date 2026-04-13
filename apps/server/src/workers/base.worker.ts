import type { ConsumeMessage } from 'amqplib';
import { logger } from '../libs/logger';
import { rabbitMQService } from '../libs/rabbitmq';

export abstract class BaseWorker<TPayload> {
  private started = false;

  protected abstract readonly queueName: string;
  protected abstract readonly workerName: string;

  protected abstract process(payload: TPayload, rawMessage: ConsumeMessage): Promise<void>;

  public async start() {
    if (this.started) return;

    await rabbitMQService.consume<TPayload>(
      this.queueName,
      async (payload, message) => {
        logger.info({ worker: this.workerName, queue: this.queueName }, 'Worker received message');
        await this.process(payload, message);
      },
      { noAck: false },
    );

    this.started = true;
    logger.info({ worker: this.workerName, queue: this.queueName }, 'Worker consumer started');
  }
}
