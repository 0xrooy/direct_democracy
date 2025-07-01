
import json, os
from concrete import fhe
import base64

BASE_DIR = os.path.dirname(__file__)
KEY_DIR = os.path.join(BASE_DIR, "keys")
CIRCUIT_PATH = os.path.join(BASE_DIR, "vote_circuit.zip")

def load_keys():
    pub_path = os.path.join(KEY_DIR, "fhe_public.json")
    priv_path = os.path.join(KEY_DIR, "fhe_private.json")

    # Auto-generate if missing
    if not os.path.exists(pub_path) or not os.path.exists(priv_path):
        print("[INFO] FHE key files missing. Generating new keys...")
        generate_keys(pub_path, priv_path)

    with open(pub_path) as f:
        pub = fhe.PublicKey.from_json(json.load(f))
    with open(priv_path) as f:
        priv = fhe.SecretKey.from_json(json.load(f))

    return pub, priv



def encrypt_vote(vote: int) -> bytes:
    if vote not in (0,1):
        raise ValueError("Only binary votes (0 and 1) are allowed")
    pub, _ = load_keys()
    return pub.encrypt(vote)

def decrypt_result(enc_result: bytes) -> int:
    _, priv = load_keys()
    return priv.decrypt(enc_result)

def load_circuit():
    if not os.path.exists(CIRCUIT_PATH):
        raise FileNotFoundError("Circuit file not found. Compile and save it first. ")
    return fhe.load(CIRCUIT_PATH)

def encode_cipher(cipher_bytes: bytes, encoding='utf-8') -> str:
    return base64.b64encode(cipher_bytes).decode(encoding)

def decode_cipher(cipher_str: str, encoding='utf-8') -> bytes:
    return base64.b64decode(cipher_str.encode(encoding))