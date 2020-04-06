import AWS from 'aws-sdk';

const ID_POOL_ID = 'us-east-1:c21c376e-3be7-433a-a5e2-970abf8f115b';
const AWS_REGION = 'us-east-1';
const STG_BUCKET = 'emi-floweditor-flow-defs';
const PROD_BUCKET = 'emi-flow-defs';
const GOOGLE_CLIENT_ID =
  '324398625718-4p5bqger9p0993bbvqglq1fqhhhp3ebs.apps.googleusercontent.com';

const connect = response => {
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
          params: { Bucket: STG_BUCKET },
        });

        resolve(s3);
      }
    });
  });

  return promise;
};

export { connect, GOOGLE_CLIENT_ID, STG_BUCKET, PROD_BUCKET };
