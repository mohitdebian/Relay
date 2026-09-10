package main

import (
	"context"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/redis/go-redis/v9"
)

var rdb *redis.Client

// Lua script to atomically increment and set expiry if first element
// KEYS[1]: The rate limit key (e.g. rate:api_1:key_1:12345)
// ARGV[1]: The expiry in seconds (e.g. 60)
var rateLimitScript = redis.NewScript(`
	local count = redis.call("INCR", KEYS[1])
	if count == 1 then
		redis.call("EXPIRE", KEYS[1], ARGV[1])
	end
	return count
`)

func initRedis(redisUrl string) error {
	// Upstash requires TLS, but often users put redis:// or https:// instead of rediss://
	if strings.Contains(redisUrl, "upstash.io") {
		if strings.HasPrefix(redisUrl, "redis://") {
			redisUrl = strings.Replace(redisUrl, "redis://", "rediss://", 1)
		} else if strings.HasPrefix(redisUrl, "https://") {
			redisUrl = strings.Replace(redisUrl, "https://", "rediss://", 1)
		}
	}

	opt, err := redis.ParseURL(redisUrl)
	if err != nil {
		return err
	}

	rdb = redis.NewClient(opt)
	
	// Check connection
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	
	if err := rdb.Ping(ctx).Err(); err != nil {
		return err
	}

	log.Println("Connected to Redis successfully")
	return nil
}

func CheckRateLimit(ctx context.Context, apiId int, apiKeyId int, limit int, window int) (allowed bool, remaining int, resetTime int64, err error) {
	// Fixed window calculation
	now := time.Now().Unix()
	windowBucket := now / int64(window)
	
	// Create Redis key
	key := fmt.Sprintf("rate:%d:%d:%d", apiId, apiKeyId, windowBucket)
	
	// Run Lua script
	count, err := rateLimitScript.Run(ctx, rdb, []string{key}, window).Int()
	if err != nil {
		return false, 0, 0, err
	}
	
	allowed = count <= limit
	remaining = limit - count
	if remaining < 0 {
		remaining = 0
	}
	
	// Calculate when this bucket expires (next bucket start time)
	resetTime = (windowBucket + 1) * int64(window)
	
	return allowed, remaining, resetTime, nil
}
