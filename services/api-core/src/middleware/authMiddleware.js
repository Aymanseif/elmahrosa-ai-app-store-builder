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
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const payload = await new Promise((resolve, reject) => {
      jwt.verify(token, getKey, { issuer: process.env.CLERK_ISSUER_URL }, (err, payload) => {
        if (err) return reject(err);
        resolve(payload);
      });
    });

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
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { authenticateToken };