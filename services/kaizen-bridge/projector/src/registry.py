from .model import MLPProjector, load_cfg
import torch
import os

_cfg = None
_registry = {}

def _ensure_cfg():
    global _cfg
    if _cfg is None:
        cfg_path = os.path.join(os.path.dirname(__file__), "..", "bridge_config.yaml")
        _cfg = load_cfg(cfg_path)
    return _cfg

def get_projector(name:str):
    if name in _registry: return _registry[name]
    cfg = _ensure_cfg()
    spec = cfg["projectors"][name]
    m = MLPProjector(spec["in_dim"], spec["out_dim"], spec["hidden"]).eval()
    _registry[name] = m
    return m
