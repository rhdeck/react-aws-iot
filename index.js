import React, { createContext, useState, useContext, useEffect } from "react";
import { device } from "./aws-iot-device-sdk-js-react-native";
const context = createContext({});
const { Provider } = context;
const AWSIOTProvider = ({ children }) => {
  const [region, setRegion] = useState();
  const [accessKeyId, setAccessKeyId] = useState();
  const [secretKey, setSecretKey] = useState();
  const [sessionToken, setSessionToken] = useState();
  const [host, setHost] = useState();
  const [iotTopic, setIotTopic] = useState();
  const [status, setStatus] = useState("closed");
  const [message, setMessage] = useState();
  const [messageText, setMessageText] = useState("");
  const [messageObj, setMessageObj] = useState(null);
  const [value, setValue] = useState();
  const [client, setClient] = useState();
  const [send, setSend] = useState();
  const [error, setError] = useState();
  const [port, setPort] = useState(443);
  const [protocol, setProtocol] = useState("wss");
  useEffect(() => {
    if (
      !(
        region &&
        protocol &&
        accessKeyId &&
        secretKey &&
        sessionToken &&
        port &&
        host &&
        protocol
      )
    )
      return;
    if (client && client.close) client.close();
    const params = {
      region,
      protocol,
      accessKeyId,
      secretKey,
      sessionToken,
      port,
      host
    };
    const newClient = device(params);
    newClient.on("connect", () => {
      setStatus("connected");
      newClient.subscribe(iotTopic);
    });
    newClient.on("error", error => setError(error));
    newClient.on("message", (topic, message) => {
      setMessage(message);
      const text = new TextDecoder().decode(message);
      setMessageText(text);
      try {
        setMessageObj(JSON.parse(text));
      } catch (e) {
        setMessageObj(null);
      }
    });
    newClient.on("close", () => {
      setStatus("closed");
      setClient(null);
    });
    setSend(message => {
      newClient.publish(iotTopic, message); // send messages
    });
    setClient(newClient);
    return () => newClient && newClient.close && newClient.close();
  }, [
    region,
    accessKeyId,
    secretKey,
    sessionToken,
    host,
    iotTopic,
    port,
    protocol
  ]);
  useEffect(() => {
    setValue({
      setRegion,
      setAccessKeyId,
      setSecretKey,
      setSessionToken,
      setHost,
      setIotTopic,
      setProtocol,
      setPort,
      message,
      status,
      send,
      error,
      messageObj,
      messageText
    });
  }, [status, message, error, messageObj, messageText]);
  return <Provider value={value}>{children}</Provider>;
};
const useIOT = filter => {
  const {
    message: oldMessage,
    status,
    send,
    error,
    messageObj,
    messageText
  } = useContext(context);
  const [message, setMessage] = useState(null);
  useEffect(() => {
    // if (!filter || micromatch(oldMessage, filter).isMatch())
    setMessage(oldMessage);
    // else setMessage(null);
  }, [oldMessage]);
  return { message, status, send, error, messageObj, messageText };
};
const useIOTSettings = ({
  region,
  accessKeyId,
  secretKey,
  sessionToken,
  host,
  iotTopic,
  topic,
  port,
  protocol
} = {}) => {
  const {
    setRegion,
    setAccessKeyId,
    setSecretKey,
    setSessionToken,
    setHost,
    setIotTopic,
    setPort,
    setProtocol
  } = useContext(context);
  if (region) setRegion(region);
  if (accessKeyId) setAccessKeyId(accessKeyId);
  if (secretKey) setSecretKey(secretKey);
  if (sessionToken) setSessionToken(sessionToken);
  if (host) setHost(host);
  if (iotTopic || topic) setIotTopic(iotTopic ? iotTopic : topic);
  if (port) setPort(port);
  if (protocol) setProtocol(protocol);
};
export { AWSIOTProvider, useIOT, useIOTSettings, context };
