import crypto from 'crypto';

interface PayUPaymentData {
  key: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  phone: string;
  surl: string;
  furl: string;
  hash?: string;
  salt: string;
}

export function generatePayUHash(data: PayUPaymentData) {
  // Hash Formula: sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT)
  const hashString = `${data.key}|${data.txnid}|${data.amount}|${data.productinfo}|${data.firstname}|${data.email}|||||||||||${data.salt}`;
  return crypto.createHash('sha512').update(hashString).digest('hex');
}

export function verifyPayUHash(data: any, salt: string) {
  // Reverse Hash Formula: sha512(SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
  const hashString = `${salt}|${data.status}|||||||||||${data.email}|${data.firstname}|${data.productinfo}|${data.amount}|${data.txnid}|${data.key}`;
  const expectedHash = crypto.createHash('sha512').update(hashString).digest('hex');
  return expectedHash === data.hash;
}

export const PAYU_CONFIG = {
  TEST_URL: 'https://test.payu.in/_payment',
  PROD_URL: 'https://secure.payu.in/_payment',
};
