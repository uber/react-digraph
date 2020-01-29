import AWS from 'aws-sdk';

// console.log('loading cognito');
const ID_POOL_ID = 'us-east-1:c21c376e-3be7-433a-a5e2-970abf8f115b';
const AWS_REGION = 'us-east-1';
// const BUCKET = 'emi-flow-defs';

const connect = authResult => {
  // const myCredentials = new AWS.CognitoIdentityCredentials({ IdentityPoolId: ID_POOL_ID });
  AWS.config.update({
    region: AWS_REGION,
    credentials: new AWS.CognitoIdentityCredentials({
      IdentityPoolId: ID_POOL_ID,
      Logins: {
        // optional tokens, used for authenticated login
        'accounts.google.com': authResult.id_token,
      },
    }),
  });

  AWS.config.getCredentials(function(err) {
    if (err) {
      // console.log(err.stack);
    }

    // credentials not loaded
    else {
      // console.log('Access key', AWS.config.credentials.accessKeyId);
      // console.log(
      //   'Secret access key:',
      //   AWS.config.credentials.secretAccessKey
      // );
      // console.log('Session token:', AWS.config.credentials.sessionToken);
    }
  });

  // const s3 = new AWS.S3({
  //   apiVersion: "2006-03-01",
  //   params: { Bucket: BUCKET }
  // });
};

export default connect;
