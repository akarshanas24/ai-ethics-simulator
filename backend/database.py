import os
from typing import Any

# If MONGO_URI is not provided, fall back to an in-memory async DB for local, free testing.
MONGO_URI = os.getenv('MONGO_URI', '').strip()
DB_NAME = os.getenv('DB_NAME', 'ai_ethics')

_client = None
_db = None


class FakeCollection:
    def __init__(self):
        self._docs = []

    async def insert_one(self, doc: dict) -> Any:
        # store a shallow copy
        self._docs.append(dict(doc))
        class R: pass
        r = R()
        r.inserted_id = doc.get('_id')
        return r

    async def find_one(self, filter: dict):
        key, val = next(iter(filter.items())) if filter else (None, None)
        for d in self._docs:
            if key is None:
                return d
            if d.get(key) == val:
                return d
        return None

    async def update_one(self, filter: dict, update: dict):
        key, val = next(iter(filter.items())) if filter else (None, None)
        for idx, d in enumerate(self._docs):
            if key is None or d.get(key) == val:
                # apply a simple $set only
                set_doc = update.get('$set', {})
                d.update(set_doc)
                self._docs[idx] = d
                class R: pass
                r = R()
                r.modified_count = 1
                return r
        class R: pass
        r = R()
        r.modified_count = 0
        return r


class FakeDB:
    def __init__(self):
        self.debates = FakeCollection()
        self.messages = FakeCollection()


def get_client():
    # Not used for fake DB
    return None


def get_db():
    global _db
    if MONGO_URI:
        # try to lazy-import motor only when configured
        from motor.motor_asyncio import AsyncIOMotorClient
        global _client
        if _client is None:
            _client = AsyncIOMotorClient(MONGO_URI)
        if _db is None:
            _db = _client[DB_NAME]
        return _db
    else:
        if _db is None:
            _db = FakeDB()
        return _db


async def close_client():
    global _client
    if _client:
        _client.close()
        _client = None
