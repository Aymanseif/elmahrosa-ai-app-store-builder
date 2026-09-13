const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const prisma = require('../prisma/client');

const client = jwksClient({
  jwksUri: `${process.env.CLERK_ISSUER_URL}/.well-known/jwks.json`
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      return callback(err);
    }
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

const authenticateToken = async (req, res, next) => {
  let payload;

  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    payload = await new Promise((resolve, reject) => {
      jwt.verify(token, getKey, { issuer: process.env.CLERK_ISSUER_URL }, (err, decoded) => {
        if (err) return reject(err);
        resolve(decoded);
      });
    });
  } catch (error) {
    // FIX: jwt.verify failures (expired token, bad signature, wrong issuer,
    // JWKS lookup failure) were previously falling into the generic 500
    // handler below, which makes a routine "please log in again" case look
    // like a server outage to API consumers.
    if (
      error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError' ||
      error.name === 'NotBeforeError'
    ) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    console.error('Auth token verification failed:', error);
    return res.status(401).json({ error: 'Unable to verify access token' });
  }

  try {
    // Assuming the Clerk ID is in the 'sub' claim
    const clerkId = payload.sub;
    const dbUser = await prisma.user.findUnique({ where: { clerkId } });
    if (!dbUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    req.user = payload; // Attach the decoded token payload
    req.dbUser = dbUser; // Attach the database user object
    next();
  } catch (error) {
    console.error('Error loading user for authenticated request:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { authenticateToken };
