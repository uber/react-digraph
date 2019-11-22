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
    // intro: {
    //   Type: 'Choice',
    //   Resource: 'kafka://hp_demand_job-assigned',
    //   ResultPath: '$.event',
    //   Next: 'isFlow',
    //   Choices: []
    // },
    // 'isFlow': {
    //   Type: 'Choice',
    //   InputPath: '$.event',
    //   Choices: [],
    // },
    // 'flowHelp': {
    //   Type: 'Choice',
    //   Choices: [],
    // }
  },
};
