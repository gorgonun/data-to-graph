#! /bin/bash

# mongoimport --collection nyt --db test --type json --file /mongo-seed/nyt-example.json --jsonArray "$MONGO_SEED_MONGODB_URL"

for file in /mongo-seed/stackoverflow/questions-*.json; do
    mongoimport --collection questions --db stackoverflow --type json --file "$file" --jsonArray "$MONGO_SEED_MONGODB_URL"
done
