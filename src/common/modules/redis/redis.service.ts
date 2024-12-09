import { Injectable, Inject, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

/**
 * RedisService is a utility class for interacting with Redis.
 * It provides methods for setting, getting, deleting, and flushing Redis keys.
 * Additionally, it supports operations on sorted sets, such as adding, removing, and ranging elements.
 * 
 * @class RedisService
 * @implements OnModuleDestroy
 */
@Injectable()
export class RedisService implements OnModuleDestroy {
  /**
   * Constructs a new instance of RedisService.
   * 
   * @param {Redis} redisClient - The Redis client instance.
   */
  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

  /**
   * Sets a TTL (time to live) for a given Redis key.
   * 
   * @param {string} key - The Redis key.
   * @param {number} ttl - The TTL in seconds.
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
   */
  private async setTTL(key: string, ttl: number): Promise<void> {
    await this.redisClient.expire(key, ttl);
  }

  /**
   * Sets a value for a given Redis key with an optional TTL.
   * 
   * @param {string} key - The Redis key.
   * @param {string} value - The value to set.
   * @param {number} [ttl] - The TTL in seconds. Defaults to 0.
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
   */
  async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      await this.redisClient.set(key, value, 'EX', ttl ? ttl : 0);
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Retrieves the value of a given Redis key.
   * 
   * @param {string} key - The Redis key.
   * @returns {Promise<string | null>} A promise that resolves to the value or null if the key does not exist.
   */
  async get(key: string): Promise<string | null> {
    try {
      return this.redisClient.get(key);
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Deletes a given Redis key.
   * 
   * @param {string} key - The Redis key.
   * @returns {Promise<number>} A promise that resolves to the number of keys deleted.
   */
  async del(key: string): Promise<number> {
    try {
      return this.redisClient.del(key);
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Retrieves all Redis keys matching a given pattern.
   * 
   * @param {string} pattern - The pattern to match keys against.
   * @returns {Promise<string[]>} A promise that resolves to an array of matching keys.
   */
  async keys(pattern: string): Promise<string[]> {
    try {
      return this.redisClient.keys(pattern);
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Flushes all Redis keys.
   * 
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
   */
  async flushAll(): Promise<void> {
    try {
      await this.redisClient.flushall();
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Adds a member to a sorted set with an optional TTL.
   * 
   * @param {string} key - The Redis key.
   * @param {number} score - The score of the member.
   * @param {string} member - The member to add.
   * @param {number} [ttl] - The TTL in seconds. Defaults to 0.
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
   */
  async zadd(key: string, score: number, member: string, ttl: number = 0): Promise<void> {
    try {
      if (ttl > 0 && !await this.redisClient.exists(key)){
        await this.redisClient.zadd(key, score, member);
        await this.setTTL(key, ttl)
      }else await this.redisClient.zadd(key, score, member);
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Removes a member from a sorted set.
   * 
   * @param {string} key - The Redis key.
   * @param {string} value - The member to remove.
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
   */
  async zRem(key: string, value: string): Promise<void> {
    try {
      await this.redisClient.zrem(key, value);
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Removes elements from a sorted set based on a score range.
   * 
   * @param {string} key - The Redis key.
   * @param {number} minScore - The minimum score.
   * @param {number} maxScore - The maximum score.
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
   */
  async zRemoveRangeByScore(key: string, minScore: number, maxScore: number): Promise<void> {
    try {
      await this.redisClient.zremrangebyscore(key, minScore, maxScore);
    } catch (error) {
      throw new Error(`Error removing range by score from sorted set: ${error.message}`);
    }
  }

  /**
   * Removes an element from a sorted set based on its score.
   * 
   * @param {string} key - The Redis key.
   * @param {number} score - The score of the element.
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
   */
  async zRemoveElementByScore(key: string, score: number): Promise<void> {
    try {
      await this.redisClient.zremrangebyscore(key, score, score);
    } catch (error) {
      throw new Error(`Error removing element by score from sorted set: ${error.message}`);
    }
  }

  /**
   * Retrieves elements from a sorted set based on their position.
   * 
   * @param {string} key - The Redis key.
   * @param {number} start - The start position.
   * @param {number} end - The end position.
   * @param {boolean} [withScores] - Whether to include scores. Defaults to false.
   * @returns {Promise<any[]>} A promise that resolves to an array of elements.
   */
  async zRange(key: string, start: number, end: number, withScores = false) {
    try {
      if (withScores)
        return await this.redisClient.zrange(key, start, end, 'WITHSCORES');
        else return await this.redisClient.zrange(key, start, end);
    } catch (error) {
      throw new Error(`Error in zRange: ${error.message}`);
    }
  }

  /**
   * Retrieves elements from a sorted set based on their score.
   * 
   * @param {string} key - The Redis key.
   * @param {number} minScore - The minimum score.
   * @param {number} maxScore - The maximum score.
   * @param {boolean} [withScores] - Whether to include scores. Defaults to false.
   * @returns {Promise<any[]>} A promise that resolves to an array of elements.
   */
  async zRangeByScore(
    key: string,
    minScore: number,
    maxScore: number,
    withScores = false
  ) {
    try {
      if (withScores)
        return await this.redisClient.zrangebyscore(key, minScore, maxScore, 'WITHSCORES');
      else return await this.redisClient.zrangebyscore(key, minScore, maxScore);
    } catch (error) {
      throw new Error(`Error in zRangeByScore: ${error.message}`);
    }
  }

  /**
   * Retrieves an element from a sorted set based on its score.
   * 
   * @param {string} key - The Redis key.
   * @param {number} score - The score of the element.
   * @returns {Promise<string | null>} A promise that resolves to the element or null if not found.
   */
  async zGet(key: string, score: number) {
    try {
      const elements = await this.zRangeByScore(key, score, score);
      return elements ? elements[0] : null;
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Disconnects from the Redis client when the module is destroyed.
   */
  onModuleDestroy() {
    this.redisClient.disconnect();
  }
}
