## Java RabbitMQ worker

This service consumes RabbitMQ jobs from a durable queue (default: `java-worker.jobs`).

### Environment variables

- **`RABBITMQ_URL`**: defaults to `amqp://guest:guest@localhost:5672`
- **`RABBITMQ_QUEUE`**: defaults to `java-worker.jobs`
- **`RABBITMQ_PREFETCH`**: defaults to `10`

### Run locally

Start RabbitMQ (already defined in `apps/server/docker-compose.yml`):

```bash
cd /home/adewale/Projects/render-lite-clone/apps/server
docker compose up -d rabbitmq
```

Run the worker:

```bash
cd /home/adewale/Projects/render-lite-clone/apps/java-worker/java-worker
mvn -q -DskipTests package
java -jar target/java-worker-1.0-shaded.jar
```

### Send a test message (from Node side)

Your Node helper (`apps/server/src/libs/rabbitmq.ts`) publishes to a queue name. For example:

- `queueName`: `java-worker.jobs`
- `payload`: `{ "type": "demo", "hello": "world" }`

