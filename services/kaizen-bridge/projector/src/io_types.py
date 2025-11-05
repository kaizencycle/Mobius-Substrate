from pydantic import BaseModel
from typing import List

class KVCachePacket(BaseModel):
    model: str
    layer: List[int]
    dtype: str
    shape: List[int]
    bytes_b64: str
    nonce: str
    ts: str

class ProjectRequest(BaseModel):
    projector: str
    packet: KVCachePacket

class ProjectResponse(BaseModel):
    projected: KVCachePacket
