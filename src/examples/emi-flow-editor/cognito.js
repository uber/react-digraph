import AWS from 'aws-sdk';

// console.log('loading cognito');
const ID_POOL_ID = 'us-east-1:c21c376e-3be7-433a-a5e2-970abf8f115b';
const AWS_REGION = 'us-east-1';
const BUCKET = 'emi-floweditor-flow-defs';

const connect = authResult => {
  // const myCredentials = new AWS.CognitoIdentityCredentials({ IdentityPoolId: ID_POOL_ID });
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

export default connect;
