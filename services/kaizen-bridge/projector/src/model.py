import torch
import base64
import numpy as np
import os
import json
import yaml

class MLPProjector(torch.nn.Module):
    def __init__(self, in_dim, out_dim, hidden):
        super().__init__()
        self.net = torch.nn.Sequential(
            torch.nn.Linear(in_dim, hidden),
            torch.nn.GELU(),
            torch.nn.Linear(hidden, out_dim)
        )

    def forward(self, x):  # x: [N, D]
        return self.net(x)

def load_cfg(path="bridge_config.yaml"):
    with open(path, "r") as f:
        return yaml.safe_load(f)

def b64_to_tensor(packet):
    buf = base64.b64decode(packet["bytes_b64"])
    arr = np.frombuffer(buf, dtype=np.float16 if packet["dtype"]=="float16" else np.float32)
    flat = arr.astype(np.float32)  # compute in fp32
    return torch.from_numpy(flat).unsqueeze(0)

def tensor_to_packet_like(t, like):
    out = t.squeeze(0).detach().cpu().numpy().astype(np.float16 if like["dtype"]=="float16" else np.float32)
    b64 = base64.b64encode(out.tobytes()).decode("utf-8")
    pkt = dict(like)
    pkt["bytes_b64"] = b64
    return pkt
