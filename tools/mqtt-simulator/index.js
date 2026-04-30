'use strict';

const mqtt = require('mqtt');

const DEFAULT_BROKER_URL = 'mqtt://localhost:1883';
const DEFAULT_INTERVAL_SECONDS = 5;

function parseArgs(argv) {
  const options = {
    brokerUrl: DEFAULT_BROKER_URL,
    intervalSeconds: DEFAULT_INTERVAL_SECONDS,
    username: '',
    password: '',
    organizationId: '',
    deviceId: '',
  };

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];

    if (!current.startsWith('--')) {
      continue;
    }

    const key = current.slice(2);
    const value = argv[index + 1];

    if (value == null || value.startsWith('--')) {
      throw new Error(`Missing value for --${key}`);
    }

    index += 1;

    switch (key) {
      case 'brokerUrl':
        options.brokerUrl = value;
        break;
      case 'organizationId':
        options.organizationId = value;
        break;
      case 'deviceId':
      case 'deviceIdentifier':
        options.deviceId = value;
        break;
      case 'interval':
      case 'intervalSeconds':
        options.intervalSeconds = Number(value);
        break;
      case 'username':
        options.username = value;
        break;
      case 'password':
        options.password = value;
        break;
      default:
        throw new Error(`Unknown option: --${key}`);
    }
  }

  return options;
}

function validateOptions(options) {
  if (!options.organizationId.trim()) {
    throw new Error('organizationId is required');
  }

  if (!options.deviceId.trim()) {
    throw new Error('deviceId or deviceIdentifier is required');
  }

  if (!Number.isFinite(options.intervalSeconds) || options.intervalSeconds <= 0) {
    throw new Error('intervalSeconds must be a positive number');
  }
}

function randomValue(min, max, decimals = 1) {
  const value = min + (Math.random() * (max - min));
  return Number(value.toFixed(decimals));
}

function buildPayload() {
  return {
    temperature: randomValue(20, 35, 1),
    humidity: randomValue(40, 80, 0),
    soil_moisture: randomValue(15, 70, 0),
    battery_level: randomValue(50, 100, 0),
  };
}

function createTopic(organizationId, deviceId) {
  return `agri/${organizationId}/${deviceId}/data`;
}

function printUsage() {
  console.log(`
Usage:
  node index.js --organizationId <uuid> --deviceId <uuid> [options]

Required:
  --organizationId <uuid>
  --deviceId <uuid> | --deviceIdentifier <uuid>

Optional:
  --brokerUrl <url>          Default: ${DEFAULT_BROKER_URL}
  --intervalSeconds <secs>   Default: ${DEFAULT_INTERVAL_SECONDS}
  --interval <secs>          Alias for --intervalSeconds
  --username <value>
  --password <value>
`);
}

function main() {
  let options;

  try {
    options = parseArgs(process.argv.slice(2));
    validateOptions(options);
  } catch (error) {
    console.error(`[mqtt-simulator] ${error.message}`);
    printUsage();
    process.exit(1);
  }

  const topic = createTopic(options.organizationId.trim(), options.deviceId.trim());
  const client = mqtt.connect(options.brokerUrl, {
    username: options.username || undefined,
    password: options.password || undefined,
  });

  let timer = null;

  client.on('connect', () => {
    console.log(`[mqtt-simulator] Connected to broker: ${options.brokerUrl}`);
    console.log(`[mqtt-simulator] Publishing every ${options.intervalSeconds} seconds`);
    console.log(`[mqtt-simulator] Topic: ${topic}`);

    const publishReading = () => {
      const payload = buildPayload();
      const payloadJson = JSON.stringify(payload);
      const timestamp = new Date().toISOString();

      client.publish(topic, payloadJson, { qos: 0 }, (error) => {
        if (error) {
          console.error(`[mqtt-simulator] Failed to publish at ${timestamp}: ${error.message}`);
          return;
        }

        console.log(`[mqtt-simulator] Published at ${timestamp}`);
        console.log(`  topic: ${topic}`);
        console.log(`  payload: ${payloadJson}`);
      });
    };

    publishReading();
    timer = setInterval(publishReading, options.intervalSeconds * 1000);
  });

  client.on('error', (error) => {
    console.error(`[mqtt-simulator] MQTT error: ${error.message}`);
  });

  client.on('reconnect', () => {
    console.log('[mqtt-simulator] Reconnecting to broker...');
  });

  const shutdown = () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }

    client.end(false, () => {
      console.log('[mqtt-simulator] Disconnected');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main();
