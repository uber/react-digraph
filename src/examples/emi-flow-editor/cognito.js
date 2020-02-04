import AWS from 'aws-sdk';
import s3Mock from './cognito-localmock';

// console.log('loading cognito');
const ID_POOL_ID = 'us-east-1:c21c376e-3be7-433a-a5e2-970abf8f115b';
const AWS_REGION = 'us-east-1';
const BUCKET = 'emi-floweditor-flow-defs';
const IS_DEVENV = window.location.href.includes('127.0.0.1');
const GOOGLE_CLIENT_ID =
  '324398625718-llvsda7bg9aai1epu61i3mdofbj2iokd.apps.googleusercontent.com';

const connect = response => {
  if (IS_DEVENV) {
    return new Promise(resolve => resolve(s3Mock));
  }

  // const myCredentials = new AWS.CognitoIdentityCredentials({ IdentityPoolId: ID_POOL_ID });
  const authResult = response.getAuthResponse();

  AWS.config.update({
    region: AWS_REGION,
    credentials: new AWS.CognitoIdentityCredentials({
      IdentityPoolId: ID_POOL_ID,
      Logins: {
        'accounts.google.com': authResult.id_token,
      },
    }),
  });

  // const identityId = AWS.config.credentials.identityId;
  const promise = new Promise(function(resolve, reject) {
    AWS.config.getCredentials(function(err) {
      if (err) {
        reject(err);
      } else {
        const s3 = new AWS.S3({
          apiVersion: '2006-03-01',
          params: { Bucket: BUCKET },
        });

        resolve(s3);
      }
    });
  });

  return promise;
};

export { connect, GOOGLE_CLIENT_ID };
