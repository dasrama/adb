import os
import logging
from datetime import datetime
from pymongo import MongoClient
from bson import ObjectId


def _to_dict(doc):
    if not doc:
        return None
    doc = dict(doc)
    doc['_id'] = str(doc.get('_id'))
    for k, v in list(doc.items()):
        if hasattr(v, "isoformat"):
            doc[k] = v.isoformat()
    return doc


class TodoRepository:

    def __init__(self, db=None):
        if db is not None:
            self.db = db
            return

        mongo_host = os.environ.get("MONGO_HOST", "localhost")
        mongo_port = os.environ.get("MONGO_PORT", "27017")
        mongo_uri = f"mongodb://{mongo_host}:{mongo_port}"
        try:
            client = MongoClient(mongo_uri)
            self.db = client['test_db']
        except Exception:
            logging.exception("Failed to connect to MongoDB")
            raise

    def list(self):
        items = []
        for doc in self.db.todos.find().sort("created_at", -1):
            items.append(_to_dict(doc))
        return items

    def create(self, task: str):
        now = datetime.now()
        doc = {
            "task": task,
            "done": False,
            "created_at": now,
            "updated_at": now,
        }
        res = self.db.todos.insert_one(doc)
        doc["_id"] = str(res.inserted_id)
        doc["created_at"] = now.isoformat()
        doc["updated_at"] = now.isoformat()
        return doc

    def get(self, pk: str):
        try:
            oid = ObjectId(pk)
        except Exception:
            return None
        doc = self.db.todos.find_one({"_id": oid})
        return _to_dict(doc)

    def update(self, pk: str, update_fields: dict):
        try:
            oid = ObjectId(pk)
        except Exception:
            return None
        update_fields = dict(update_fields)
        update_fields["updated_at"] = datetime.utcnow()
        res = self.db.todos.update_one({"_id": oid}, {"$set": update_fields})
        if res.matched_count == 0:
            return None
        return self.get(pk)

    def delete(self, pk: str):
        try:
            oid = ObjectId(pk)
        except Exception:
            return False
        res = self.db.todos.delete_one({"_id": oid})
        return res.deleted_count > 0
    