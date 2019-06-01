import { useState, useEffect } from "react";
import { device } from "./aws-iot-device-sdk-js-react-native";
import { TextDecoder } from "text-encoding";
//V2
const clients = {};
const useIot = ({
  region,
  accessKeyId,
  secretKey,
  sessionToken,
  host,
  iotTopic,
  topic: oldTopic,
  port,
  protocol
} = {}) => {
  const topic = iotTopic ? iotTopic : oldTopic;
  const [error, setError] = useState();
  const [send, setSend] = useState();
  const [message, setMessage] = useState();
  const [messageText, setMessageText] = useState();
  const [messageObj, setMessageObj] = useState();
  useEffect(() => {
    const hash = [
      region,
      accessKeyId,
      secretKey,
      sessionToken,
      host,
      port,
      protocol
    ].join();
    if (!host) return;
    const newClient = host
      ? Object.values(clients)[0]
      : clients[hash]
      ? clients[hash]
      : device({
          region,
          protocol,
          accessKeyId,
          secretKey,
          sessionToken,
          port,
          host
        });
    if (!newClient) return;
    clients[hash] = newClient;
    newClient.on("connect", () => {
      setStatus("connected");
      newClient.subscribe(topic);
    });
    newClient.on("error", error => setError(error));
    newClient.on("message", (thisTopic, message) => {
      if (!topic || thisTopic === topic) {
        setMessage(message);
        const text = new TextDecoder().decode(message);
        setMessageText(text);
        try {
          setMessageObj(JSON.parse(text));
        } catch (e) {
          setMessageObj(null);
        }
      }
    });
    newClient.on("close", () => {
      setStatus("closed");
      setClient(null);
    });
    setSend(message => {
      newClient.publish(topic, message); // send messages
    });
    return () => {
      if (newClient.close) newClient.close();
      delete clients[hash];
    };
  }, [
    region,
    accessKeyId,
    secretKey,
    sessionToken,
    host,
    iotTopic,
    oldTopic,
    port,
    protocol
  ]);
  return { send, message, messageText, messageObj, error };
};
export { useIot };
export default useIot;
