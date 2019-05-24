# react-aws-iot

## Usage

1. Set up the provider high in your tree. No props required

```js
import { AWSIOTProvider } from "react-aws-iot";

export default () => (
  <AWSIOTProvider>
    //Whatever goes in here - doesn't matter
    <ApolloHooksProvider client={client}>...</ApolloHooksProvider>
  </AWSIOTProvider>
);
```

2. In whatever component is going to be aware of your connection information, use the `useIOTSettings` hook to make that connection. Like React, its smart enough to make changes only when the underlying data changes, so it stays calm.

```js
const DataFetchingComponent = () => {
  const { data, loading, error } = useQuery(MY_QUERY);
  const {
    region,
    accessKeyId,
    secretKey,
    sessionToken,
    host,
    iotTopic
  } = data.getMyStuff;
  useIOTProvider({
    region,
    accessKeyId,
    secretKey,
    sessionToken,
    host,
    iotTopic
  });
  //...
};
```

3. And where you want to listen for messages, use `useIOT`. Apply a filter if that helps you only listen for the messages that affect you

```js
import { useIOT } from "react-aws-iot";
const MessageAwareComponent = () => {
  const { message, send, error, status } = useIOT();
  const { message: filteredMessage } = useIOT("myprefix: *");
};
```
