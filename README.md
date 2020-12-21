# simulated-mqtt-device
A simulated AWS IoT device

## To run on an EC2 Instance

Install a nodejs interpreter as part of your user scripts:

`yum install nodejs`

Built against node 15.4.0

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
