package com.bigdev;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import com.rabbitmq.client.DeliverCallback;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;



public final class Worker {
  private static final Logger log = LoggerFactory.getLogger(Worker.class);
  private static final ObjectMapper mapper = new ObjectMapper();

  private final String rabbitUrl;
  private final String queueName;
  private final int prefetch;

  public Worker(String rabbitUrl, String queueName, int prefetch) {
    this.rabbitUrl = rabbitUrl;
    this.queueName = queueName;
    this.prefetch = prefetch;
  }

  public static Worker fromEnv() {
    var rabbitUrl = env("RABBITMQ_URL", "amqp://guest:guest@localhost:5672");
    var queueName = env("RABBITMQ_QUEUE", "java-worker.jobs");
    var prefetch = envInt("RABBITMQ_PREFETCH", 10);
    return new Worker(rabbitUrl, queueName, prefetch);
  }

  public void startForever() throws InterruptedException {
    log.info(
        "Starting java-worker consumer. queue={}, prefetch={}, url={}", queueName, prefetch, rabbitUrl);

    var backoff = Duration.ofSeconds(1);
    while (true) {
      try {
        runConsumerOnce();
        backoff = Duration.ofSeconds(1);
      } catch (Exception ex) {
        log.error("Consumer crashed; restarting in {}s", backoff.toSeconds(), ex);
        Thread.sleep(backoff.toMillis());
        backoff = backoff.multipliedBy(2);
        if (backoff.compareTo(Duration.ofSeconds(30)) > 0) backoff = Duration.ofSeconds(30);
      }
    }
  }

  private void runConsumerOnce() throws Exception {
    var factory = new ConnectionFactory();
    factory.setUri(rabbitUrl);
    factory.setAutomaticRecoveryEnabled(true);
    factory.setTopologyRecoveryEnabled(true);

    try (Connection connection = factory.newConnection("java-worker");
        Channel channel = connection.createChannel())
         {

      channel.basicQos(prefetch);

      var declared = channel.queueDeclare(queueName, true, false, false, null);
      log.info(
          "Connected. queue={}, messages={}, consumers={}",
          declared.getQueue(),
          declared.getMessageCount(),
          declared.getConsumerCount());

      DeliverCallback deliverCallback =
          (consumerTag, delivery) -> {
            var raw = new String(delivery.getBody(), StandardCharsets.UTF_8);
            try {
              JsonNode payload = tryParseJson(raw);
              handleJob(payload, raw);
              channel.basicAck(delivery.getEnvelope().getDeliveryTag(), false);
            } catch (Exception ex) {
              log.error("Job failed; discarding message (no requeue). raw={}", raw, ex);
              channel.basicNack(delivery.getEnvelope().getDeliveryTag(), false, false);
            }
          };

      var consumerTag = channel.basicConsume(queueName, false, deliverCallback, tag -> {});
      log.info("Consuming. consumerTag={}", consumerTag);

      var shutdownLatch = new Object();
      Runtime.getRuntime()
          .addShutdownHook(
              new Thread(
                  () -> {
                    log.info("Shutdown requested.");
                    synchronized (shutdownLatch) {
                      shutdownLatch.notifyAll();
                    }
                  }));

      synchronized (shutdownLatch) {
        shutdownLatch.wait();
      }
    }
  }

  protected void handleJob(JsonNode payload, String raw) throws Exception {
    // Your “worker logic” lives here. Expand into routing by payload.get("type"), etc.
    log.info("Received job. payload={}, raw={}", payload, raw);
  }

  private static JsonNode tryParseJson(String raw) {
    try {
      return mapper.readTree(raw);
    } catch (Exception ignored) {
      return mapper.getNodeFactory().textNode(raw);
    }
  }

  private static String env(String key, String defaultValue) {
    return Optional.ofNullable(System.getenv(key)).filter(v -> !v.isBlank()).orElse(defaultValue);
  }

  private static int envInt(String key, int defaultValue) {
    try {
      var raw = System.getenv(key);
      if (raw == null || raw.isBlank()) return defaultValue;
      return Integer.parseInt(raw);
    } catch (Exception ignored) {
      return defaultValue;
    }
  }
}

