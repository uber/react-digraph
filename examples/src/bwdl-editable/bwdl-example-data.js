// @flow
/*
  Copyright(c) 2018 Uber Technologies, Inc.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

          http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

export default {
  ExampleSource:
    'https://code.uberinternal.com/file/data/aioyv5yrrs3dadbmxlap/PHID-FILE-v36jeiyn4y3gphtdwjsm/1.json',
  Name: 'Colombo_Intercity_Driver_dispatch',
  Comment:
    'Send SMS message to drivers accept dispatch for Colombo intercity trip',
  Version: 1,
  Domain: '//Autobots',
  Id: '//Autobots/ColomboIntercityDriverDispatch',
  StartAt: 'Init',
  AllowReentry: true,
  States: {
    Init: {
      Type: 'Terminator',
      Resource: 'kafka://hp_demand_job-assigned',
      ResultPath: '$.event',
      Next: 'Check City and Vehicle View',
    },
    'Check City and Vehicle View': {
      Type: 'Choice',
      InputPath: '$.event',
      Choices: [
        {
          And: [
            {
              Variable: '$.region.id',
              NumberEquals: 478,
            },
            {
              Variable: '$.vehicleViewId',
              NumberEquals: 20006733,
            },
          ],
          Next: 'SMS for Dispatch accepted',
        },
        {
          And: [
            {
              Variable: '$.region.id',
              NumberEquals: 999,
            },
          ],
          Next: 'SMS for Dispatch denied',
        },
      ],
    },
    'Check Other City': {
      Type: 'Choice',
      InputPath: '$.event',
      Choices: [
        {
          And: [
            {
              Variable: '$.region.id',
              NumberEquals: 478,
            },
          ],
          Next: 'Wait for six hours',
        },
        {
          And: [
            {
              Variable: '$.region.id',
              NumberEquals: 999,
            },
          ],
          Next: 'Wait for twenty four hours',
        },
      ],
    },
    'SMS for Dispatch accepted': {
      Type: 'Pass',
      InputPath: '$.event',
      Result: {
        expirationMinutes: 60,
        fromUserUUID: '71af5aea-9eaa-45a1-9825-2c124030b063',
        toUserUUID: 'Eval($.supplyUUID)',
        getSMSReply: false,
        message:
          'Hithawath Partner, Oba labegena athi mema trip eka UberGALLE trip ekaki, Karunakara rider wa amatha drop location eka confirm karaganna. Sthuthi',
        messageType: 'SEND_SMS',
        priority: 1,
        actionUUID: 'd259c34d-457a-411e-8c93-6edd63a7ddc6',
      },
      ResultPath: '$.actionParam',
      Next: 'Send SMS',
    },
    'SMS for Dispatch denied': {
      Type: 'Pass',
      InputPath: '$.event',
      Result: {
        expirationMinutes: 60,
        fromUserUUID: '71af5aea-9eaa-45a1-9825-2c124030b063',
        toUserUUID: 'Eval($.supplyUUID)',
        getSMSReply: false,
        message:
          'Hithawath Partner, Oba labegena athi mema trip eka UberGALLE trip ekaki, Karunakara rider wa amatha drop location eka confirm karaganna. Sthuthi',
        messageType: 'SEND_SMS',
        priority: 1,
        actionUUID: 'd259c34d-457a-411e-8c93-6edd63a7ddc6',
      },
      ResultPath: '$.actionParam',
      Next: 'Send SMS',
    },
    'Send SMS': {
      Type: 'Task',
      InputPath: '$.actionParam',
      Resource: 'uns://sjc1/sjc1-prod01/us1/cleopatra/Cleopatra::sendSMS',
      InputSchema: {
        '$.expirationMinutes': 'int',
        '$.toUserUUID': 'string',
        '$.fromUserUUID': 'string',
        '$.getSMSReply': 'bool',
        '$.message': 'string',
        '$.messageType': 'string',
        '$.priority': 'int',
        '$.actionUUID': 'string',
      },
      OutputSchema: {
        '$.fraudDriverUUIDs[*]': 'string',
      },
      Next: 'Check Other City',
    },
    'Wait for six hours': {
      Type: 'Wait',
      Seconds: 21600,
      Next: 'Exit',
    },
    'Wait for twenty four hours': {
      Type: 'Wait',
      Seconds: 86400,
      Next: 'Exit',
    },
    Exit: {
      Type: 'Terminator',
      End: true,
    },
  },
};
