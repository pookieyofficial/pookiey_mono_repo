# Corrected script: generate 20 MongoDB-ready user documents

import json
import uuid
import random

def fake_object_id():
    return ''.join(random.choices('0123456789abcdef', k=24))

base_user = {
  "_id": {"$oid": "693fd7702625f60ef471e58c"},
  "user_id": "a94c57cf-1b7f-4eca-b120-9e16e2a67d69",
  "email": "sanjaymahto763172@gmail.com",
  "displayName": "Sanjay Mahto",
  "photoURL": "https://pookiey-dating-app.s3.ap-south-1.amazonaws.com/users/sample/sample.jpg",
  "provider": "google",
  "isEmailVerified": True,
  "isPhoneVerified": False,
  "status": "active",
  "profile": {},
  "preferences": {
    "distanceMaxKm": 50,
    "ageRange": [18, 35],
    "showMe": []
  },
  "subscription": {
    "status": "none",
    "plan": "free",
    "startDate": None,
    "endDate": None,
    "autoRenew": True,
    "lastPaymentAt": None,
    "provider": None,
    "updatedAt": None
  },
  "dailyInteractionCount": 0,
  "notificationTokens": ["ExponentPushToken[EjVxZDJZ_k4gdrfATrdUKK]"],
  "lastInteractionResetAt": {"$date": "2025-12-15T09:40:00.639Z"},
  "createdAt": {"$date": "2025-12-15T09:40:00.640Z"},
  "updatedAt": {"$date": "2025-12-15T09:43:13.770Z"},
  "lastLoginAt": {"$date": "2025-12-15T09:40:00.640Z"},
  "__v": 0
}

profile_template = {
  "location": {
    "type": "Point",
    "city": "Patna, Bihar, 800024",
    "coordinates": [85.0995986, 25.6251129]
  },
  "bio": "",
  "interests": [
    "photography","shopping","karaoke","yoga","cooking","run","tennis",
    "swimming","art","traveling","drink","music","extreme",
    "videogames","movies","reading"
  ],
  "height": 0,
  "education": "",
  "occupation": "Student",
  "company": "",
  "school": "",
  "isOnboarded": True,
  "photos": [
    {
      "url": "https://pookiey-dating-app.s3.ap-south-1.amazonaws.com/static/sample.jpg",
      "isPrimary": True,
      "uploadedAt": {"$date": "2025-12-15T09:43:10.353Z"},
      "_id": {"$oid": fake_object_id()}
    }
  ],
  "dateOfBirth": {"$date": "2006-12-15T09:40:00.000Z"},
  "firstName": "Sanjay",
  "gender": "male",
  "lastName": "Mahto"
}

users = []

for i in range(20):
    user = json.loads(json.dumps(base_user))
    user["_id"]["$oid"] = fake_object_id()
    user["user_id"] = str(uuid.uuid4())
    user["email"] = f"user{i+1}_{uuid.uuid4().hex[:6]}@example.com"
    user["profile"] = json.loads(json.dumps(profile_template))

    for photo in user["profile"]["photos"]:
        photo["_id"]["$oid"] = fake_object_id()

    users.append(user)

file_path = "20_users_for_mongodb.json"
with open(file_path, "w", encoding="utf-8") as f:
    json.dump(users, f, indent=2)

