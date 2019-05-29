import React, { createContext, useState, useContext, useEffect } from "react";
import { device } from "./aws-iot-device-sdk-js-react-native";
import micromatch from "micromatch";
const context = createContext({});
const { Provider } = context;
const port = 443;
const protocol = "wss";
const AWSIOTProvider = ({ children }) => {
  const [region, setRegion] = useState();
  const [accessKeyId, setAccessKeyId] = useState();
  const [secretKey, setSecretKey] = useState();
  const [sessionToken, setSessionToken] = useState();
  const [host, setHost] = useState();
  const [iotTopic, setIotTopic] = useState();
  const [status, setStatus] = useState("closed");
  const [message, setMessage] = useState();
  const [value, setValue] = useState();
  const [client, setClient] = useState();
  const [send, setSend] = useState();
  const [error, setError] = useState();
  useEffect(() => {
    if (client) client.close();
    client = device({
      region,
      protocol,
      accessKeyId,
      secretKey,
      sessionToken,
      port,
      host
    });
    client.on("connect", () => {
      setStatus("connected");
      client.subscribe(iotTopic);
    });
    client.on("error", error => setError(error));
    client.on("message", (topic, message) => setMessage(message));
    client.on("close", () => {
      setStatus("closed");
      setClient(null);
    });
    setSend(message => {
      client.publish(iotTopic, message); // send messages
    });
    setClient(client);
    return () => client.close();
  }, [region, accessKey, secretKey, sessionToken, host, iotTopic]);
  useEffect(() => {
    setValue({
      setRegion,
      setAccessKeyId,
      setSecretKey,
      setSessionToken,
      setHost,
      setIotTopic,
      message,
      status,
      send,
      error
    });
  }, [status, message, error]);
  return <Provider value={value}>{children}</Provider>;
};
const useIOT = filter => {
  const { message: oldMessage, status, send, error } = useContext(context);
  const [message, setMessage] = useState(null);
  useEffect(() => {
    if (!filter || micromatch(oldMessage, filter).isMatch())
      setMessage(oldMessage);
    else setMessage(null);
  }, [oldMessage]);
  return { message, status, send, error };
};
const useIOTSettings = ({
  region,
  accessKeyId,
  secretKey,
  sessionToken,
  host,
  iotTopic
}) => {
  const {
    setRegion,
    setAccessKeyId,
    setSecretKey,
    setSessionToken,
    setHost,
    setIotTopic
  } = useContext(context);
  setRegion(region);
  setAccessKeyId(accessKeyId);
  setSecretKey(secretKey);
  setSessionToken(sessionToken);
  setHost(host);
  setIotTopic(iotTopic);
};
export { AWSIOTProvider, useIOT, useIOTSettings, context };
