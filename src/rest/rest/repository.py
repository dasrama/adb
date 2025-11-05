import os
import logging
from datetime import datetime
from typing import Optional, List, Dict, Any

from pymongo import MongoClient, errors
from bson import ObjectId

def _to_dict(doc: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    if not doc:
        return None
    doc = dict(doc)
    doc['_id'] = str(doc.get('_id'))
    for k, v in list(doc.items()):
        if hasattr(v, "isoformat"):
            doc[k] = v.isoformat()
    return doc

def get_mongo_client() -> MongoClient:
    mongo_host = os.environ.get("MONGO_HOST", "localhost")
    mongo_port = os.environ.get("MONGO_PORT", "27017")
    mongo_uri = f"mongodb://{mongo_host}:{mongo_port}"
    try:
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
        client.admin.command('ping')
        return client
    except errors.ConnectionFailure as exc:
        logging.exception("Failed to connect to MongoDB")
        raise ConnectionError(f"MongoDB connection failed: {exc}")

class TodoRepository:

    def __init__(self, db=None):
        if db is not None:
            self.db = db
        else:
            client = get_mongo_client()
            self.db = client['test_db']

    def list(self) -> List[Dict[str, Any]]:
        try:
            items = []
            for doc in self.db.todos.find().sort("created_at", -1):
                items.append(_to_dict(doc))
            return items
        except Exception as exc:
            logging.exception("Error listing todos")
            raise RuntimeError("Failed to list todos") from exc

    def create(self, task: str) -> Optional[Dict[str, Any]]:
        if not task or not task.strip():
            raise ValueError("Task must be a non-empty string")

        now = datetime.now()
        doc = {
            "task": task.strip(),
            "done": False,
            "created_at": now,
            "updated_at": now,
        }
        try:
            res = self.db.todos.insert_one(doc)
            return _to_dict(self.db.todos.find_one({"_id": res.inserted_id}))
        except Exception as exc:
            logging.exception("Error creating todo")
            raise RuntimeError("Failed to create todo") from exc

    def get(self, id: str) -> Optional[Dict[str, Any]]:
        try:
            object_id = ObjectId(id)
            doc = self.db.todos.find_one({"_id": object_id})
            return _to_dict(doc)
        except Exception as exc:
            logging.exception(f"Error fetching todo id={id}")
            return None

    def update(self, id: str, fields: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            object_id = ObjectId(id)
            fields['updated_at'] = datetime.now()
            result = self.db.todos.update_one({"_id": object_id}, {"$set": fields})
            if result.modified_count == 1:
                return self.get(id)
            return None
        except Exception as exc:
            logging.exception(f"Error updating todo id={id}")
            return None  

    def delete(self, id: str) -> bool:
        try:
            object_id = ObjectId(id)
            result = self.db.todos.delete_one({"_id": object_id})
            return result.deleted_count == 1
        except Exception as exc:
            logging.exception(f"Error deleting todo id={id}")
            return False
