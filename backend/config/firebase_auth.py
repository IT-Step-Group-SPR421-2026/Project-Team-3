import os
import json
import logging

import firebase_admin
from firebase_admin import credentials, auth as firebase_auth

from rest_framework.authentication import BaseAuthentication
from rest_framework import exceptions


logger = logging.getLogger("config.firebase_auth")


# Initialize Firebase Admin SDK if credentials are available. The service account
# can be provided either as a JSON string via the env var
# `FIREBASE_SERVICE_ACCOUNT_JSON` or as a path in
# `FIREBASE_SERVICE_ACCOUNT_PATH`.
def _initialize_admin():
    if firebase_admin._apps:
        return

    svc_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
    svc_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH")

    cred = None
    try:
        if svc_json:
            data = json.loads(svc_json)
            cred = credentials.Certificate(data)
        elif svc_path and os.path.exists(svc_path):
            cred = credentials.Certificate(svc_path)
    except Exception:
        cred = None

    if cred:
        firebase_admin.initialize_app(cred)
        logger.info("Firebase Admin initialized using provided credentials")
    else:
        logger.warning("Firebase Admin not initialized: no credentials found")


_initialize_admin()


class FirebaseUser:
    """Lightweight user-like object representing a Firebase-authenticated user."""

    def __init__(self, uid: str, email: str | None = None, name: str | None = None):
        self.uid = uid
        self.email = email
        self.name = name

    @property
    def is_authenticated(self):
        return True

    def __str__(self):
        return f"FirebaseUser({self.uid})"


class FirebaseAuthentication(BaseAuthentication):
    """DRF authentication class that verifies Firebase ID tokens.

    Expects `Authorization: Bearer <id-token>` header. If header not present,
    returns `None` so other authentication classes (or anonymous) may apply.
    """

    def authenticate(self, request):
        header = request.headers.get("Authorization") or request.META.get("HTTP_AUTHORIZATION")
        if not header:
            logger.debug("No Authorization header on request %s %s", request.method, request.get_full_path())
            return None

        parts = header.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            logger.debug("Authorization header malformed: %r", header)
            return None

        token = parts[1]
        logger.debug("Received Authorization header, token length=%d", len(token))
        try:
            decoded = firebase_auth.verify_id_token(token)
        except Exception as exc:
            logger.warning("Firebase token verification failed: %s", exc)
            raise exceptions.AuthenticationFailed("Invalid Firebase ID token") from exc

        uid = decoded.get("uid")
        email = decoded.get("email")
        name = decoded.get("name")

        logger.info("Firebase token verified: uid=%s email=%s", uid, email)
        user = FirebaseUser(uid=uid, email=email, name=name)
        return (user, token)
