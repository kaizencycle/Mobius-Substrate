---- MODULE Invariants ----
EXTENDS Naturals, Sequences

CONSTANTS GI_LIVE_THRESHOLD, GI_EMERGENCY_STOP

VARIABLES gi_prev, gi_curr, delta_bias, delta_entropy,
          capability_envelope, requested_capability,
          two_human_gate, signed_state

Init == /\ gi_prev \in 0..1
        /\ gi_curr \in 0..1
        /\ delta_bias \in Real
        /\ delta_entropy \in Real
        /\ capability_envelope \in SUBSET {"read","classify","write_production"}
        /\ requested_capability \in {"none","read","classify","write_production"}
        /\ two_human_gate \in {TRUE, FALSE}
        /\ signed_state \in {TRUE, FALSE}

(* Invariant 1: No unsigned state may enter training/serving *)
Inv_SignedState == signed_state = TRUE

(* Invariant 2: No capability expansion without quorum *)
Inv_CapabilityGate ==
    IF requested_capability = "write_production" THEN two_human_gate = TRUE ELSE TRUE

(* Invariant 3: Emergency stop when GI < threshold *)
Inv_GIEmergency == gi_curr >= GI_EMERGENCY_STOP

(* Invariant 4: Live-mode only above GI_LIVE_THRESHOLD *)
Inv_GILive == gi_curr >= GI_LIVE_THRESHOLD

(* Safety theorem placeholder *)
Safety == Inv_SignedState /\ Inv_CapabilityGate /\ Inv_GIEmergency /\ Inv_GILive

====

