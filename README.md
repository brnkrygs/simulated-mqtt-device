# simulated-mqtt-device
A simulated AWS IoT device

## To run on an EC2 Instance

Prerequesits: a `nodejs` interpreter available in your environment

1. Install dependencies: `npm install` from the root of the package
2. Register your device into AWS device manager, and copy your certificates into the `/certificates/` directory (see below for details)
3. Start script `node .` or `node index.js`
   1. Optionally, specify inputs as command line parameters e.g. `node index.js --thing-name thing1 --broker mqtts://<your broker DNS name>:<your broker port> --interval 500`

### Specifying your Broker URL

The [async-mqtt](https://github.com/mqttjs/async-mqtt) library in use requires the broker URL to be specified according to the [mqtt.js format](https://github.com/mqttjs/MQTT.js#connect).

For AWS IoT Core, this ends up looking like:

`mqtts://<your broker dns name>:8883`

* Protocol: mqtts (TLS-encrypted MQTT)
* DNS: found under `Settings` in your AWS IoT Core environment
* 8883: this is the port AWS hosts MQTT over, standard for TLS encrypted MQTT connections

### Creating a Device in AWS IoT Core

You can register a new device with the AWS CLI. This is a quick way to get your device created, and the certs onto your EC2 instance in one command. Run this from the `/credentials/<thingname>` directory on your EC2 instance. This assumes your EC2 role / CLI instance has IoT admin permissions in IAM. The policy created allows the device to connect to your AWS account in the specified region, using the thing name as the MQTT client id.

```bash
aws iot create-thing --thing-name "<thingname>"

aws iot create-keys-and-certificate --set-as-active \
      --certificate-pem-outfile "<thingname>-certificate.pem.crt" \
      --public-key-outfile "<thingname>-public.pem.key" \
      --private-key-outfile "<thingname>-private.pem.key"

aws iot attach-thing-principal \
      --thing-name "<thingname>" \
      --principal "<certificate ARN from previous step>"

aws iot create-policy \
      --policy-name "<policy name>" \
      --policy-document "{ \"Version\": \"2012-10-17\", \"Statement\": [ { \"Effect\": \"Allow\", \"Action\": \"iot:Connect\", \"Resource\": \"arn:aws:iot:<YOUR REGION>:<YOUR AWS ACCOUNT>:client/${iot:Connection.Thing.ThingName}\" }, { \"Effect\": \"Allow\", \"Action\": \"iot:Publish\", \"Resource\": \"arn:aws:iot:<YOUR REGION>:<YOUR AWS ACCOUNT>:topic/<YOUR SIMULATOR TOPIC>\" } ] }"

aws iot attach-policy \
      --policy-name "<policy name>" \
      --target "<certificate ARN from previous step>"
```

## Authorization

### Broker root cert

The root AWS cert is included here for simplicity. You may need to replace this if/when AWS replaces the root cert for their IoT brokers, or if you have a custom domain name.

`/credentials/AmazonRootCA1.pem.txt`

### Device Certs

MQTT certs should be placed into the `/credentials/` directory, in a subfolder matching the thing name.

E.g.

For thing name: `bob`

Put the certificate files here:

```
/credentials/bob/bob-certificate.pem.crt
/credentials/bob/bob-private.pem.key
/credentials/bob/bob-public.pem.key
```

(the public key for the device cert is not used)

### Policies

The device's certificate must be associated with an IoT policy that allows the device to connect and to publish to the configured topic.

## Messages

Upon startup, the simulator connects to the IoT broker as the configured thingname and starts to publish a message to the configured broker based on the configured interval.

> Note: Currently hardcoded to a single message.

Messages are configured in the `/messages/` directory. They are currently JSON objects including both the message topic to publish to, and the message payload itself.

The topic may include the placeholder `__THINGNAME__`... it will be replaced by the device thingname on publish.

The payload may be either a `String` or a JSON `Object`. When configured as an `Object`, the payload is `JSON.stringify()'d` before being published.

### Authorization note

The policy associated to the device's certificate must include the permission to publish to the configured topic.
