import { randomUUID } from 'node:crypto';
import amqp, { type Channel, type ChannelModel, type ConsumeMessage, type Options } from 'amqplib';
import { getLogContext, logger, runWithLogContext } from './logger';

type ConsumerHandler<T> = (payload: T, rawMessage: ConsumeMessage) => Promise<void> | void;

const REQ_HEADER = 'x-request-id';
const JOB_HEADER = 'x-job-id';

export class RabbitMQService {
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;
  private connectingPromise: Promise<Channel> | null = null;

  constructor(
    private readonly config: {
      url?: string;
      prefetch?: number;
    } = {},
  ) {}

  private static resolvePrefetch() {
    const value = Number(process.env.RABBITMQ_PREFETCH ?? '10');
    return Number.isFinite(value) && value > 0 ? value : 10;
  }

  private getUrl() {
    return this.config.url ?? process.env.RABBITMQ_URL ?? 'amqp://guest:guest@localhost:5672';
  }

  private getPrefetch() {
    if (typeof this.config.prefetch === 'number' && this.config.prefetch > 0) {
      return this.config.prefetch;
    }
    return RabbitMQService.resolvePrefetch();
  }

  public async connect(): Promise<Channel> {
    if (this.channel) return this.channel;
    if (this.connectingPromise) return this.connectingPromise;

    this.connectingPromise = (async () => {
      const url = this.getUrl();
      const prefetch = this.getPrefetch();
      const connection = await amqp.connect(url);
      this.connection = connection;

      connection.on('error', (error: Error) => {
        logger.error({ err: error }, 'RabbitMQ connection error');
      });

      connection.on('close', () => {
        logger.warn('RabbitMQ connection closed');
        this.connection = null;
        this.channel = null;
        this.connectingPromise = null;
      });

      const channel = await connection.createChannel();
      await channel.prefetch(prefetch);
      this.channel = channel;
      logger.info({ url, prefetch }, 'RabbitMQ connected');

      return channel;
    })();

    return this.connectingPromise;
  }

  public async assertQueue(queueName: string, options: Options.AssertQueue = { durable: true }) {
    const channel = await this.connect();
    return channel.assertQueue(queueName, options);
  }

  public async publish(
    queueName: string,
    payload: unknown,
    options: Options.Publish = { persistent: true },
  ) {
    const channel = await this.connect();
    await this.assertQueue(queueName);

    const ctx = getLogContext();
    const jobId = randomUUID();
    const headers = {
      ...(options.headers ?? {}),
      [REQ_HEADER]: ctx.requestId ?? options.headers?.[REQ_HEADER] ?? jobId,
      [JOB_HEADER]: jobId,
    };

    const serializedPayload = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const sent = channel.sendToQueue(queueName, Buffer.from(serializedPayload), {
      ...options,
      headers,
      messageId: jobId,
    });

    if (!sent) {
      logger.warn({ queueName, jobId }, 'RabbitMQ internal write buffer is full');
    } else {
      logger.debug({ queueName, jobId, requestId: headers[REQ_HEADER] }, 'Job published');
    }
  }

  public async consume<T = unknown>(
    queueName: string,
    handler: ConsumerHandler<T>,
    options?: Options.Consume,
  ) {
    const channel = await this.connect();
    await this.assertQueue(queueName);

    await channel.consume(
      queueName,
      async (message: ConsumeMessage | null) => {
        if (!message) return;

        const headers = message.properties.headers ?? {};
        const requestId = String(headers[REQ_HEADER] ?? '') || undefined;
        const jobId = String(headers[JOB_HEADER] ?? message.properties.messageId ?? '') || undefined;

        await runWithLogContext({ requestId, jobId }, async () => {
          try {
            const content = message.content.toString();
            const parsed = this.tryParseJson<T>(content);
            await handler(parsed, message);
            channel.ack(message);
          } catch (error) {
            logger.error({ err: error, queueName, jobId }, 'RabbitMQ consumer handler failed');
            channel.nack(message, false, false);
          }
        });
      },
      options,
    );
  }

  public async close() {
    try {
      if (this.channel) {
        await this.channel.close();
        this.channel = null;
      }

      if (this.connection) {
        await this.connection.close();
        this.connection = null;
      }

      this.connectingPromise = null;
      logger.info('RabbitMQ connection closed cleanly');
    } catch (error) {
      logger.error({ err: error }, 'Failed to close RabbitMQ cleanly');
    }
  }

  private tryParseJson<T>(content: string): T {
    try {
      return JSON.parse(content) as T;
    } catch {
      return content as unknown as T;
    }
  }
}

export const rabbitMQService = new RabbitMQService();
