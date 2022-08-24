import { v4 as uuid } from 'uuid';
import sha1 from 'sha1';

import dbClient from '../utils/db';
import redisClient from '../utils/redis';

export const getConnect = async (req, res) => {
  const authHeader = req.header('Authorization').slice(6);

  const buffer = Buffer.from(authHeader, 'base64');

  const [email, password] = buffer.toString('utf8').split(':');

  const user = await dbClient.findUser({ email });

  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  if (sha1(password) !== user.password) {
    return res.status(403).json({ error: 'Invalid credentials' });
  }

  const token = uuid();
  const key = `auth_${token}`;
  await redisClient.set(key, user._id.toString(), 86400);

  return res.json({ token });
};

export const getDisconnect = async (req, res) => {
  const token = req.header('X-Token');
  const key = `auth_${token}`;

  const uid = await redisClient.get(key);

  if (!uid) return res.status(401).json({ error: 'Unauthorized' });

  await redisClient.del(key);

  return res.status(204).json({});
};
