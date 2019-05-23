const AWSIoTData = require("aws-iot-device-sdk");
module.exports = {
  thingShadow: AWSIoTData.thingShadow,
  device: AWSIoTData.device,
  jobs: AWSIoTData.jobs
};
