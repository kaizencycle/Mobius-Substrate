from fastapi import FastAPI
from .io_types import ProjectRequest, ProjectResponse
from .registry import get_projector
from .model import b64_to_tensor, tensor_to_packet_like

app = FastAPI()

@app.get("/health")
def health(): return {"status":"ok", "service":"kaizen-bridge-projector"}

@app.post("/project", response_model=ProjectResponse)
def project(req: ProjectRequest):
    proj = get_projector(req.projector)
    x = b64_to_tensor(req.packet.dict())
    with torch.no_grad():
        y = proj(x)
    projected = tensor_to_packet_like(y, req.packet.dict())
    return {"projected": projected}
