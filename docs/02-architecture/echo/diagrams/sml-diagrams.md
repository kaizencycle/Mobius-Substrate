# Strange Metamorphosis Loop (SML) - Mermaid Diagrams

**Cycle C-148 • Visual Documentation**

---

## Daily Reflection Flow

```mermaid
graph TB
    Start[User Wakes Up] --> Morning[Morning Reflection<br/>08:00]
    Morning --> Q1{How do you see<br/>the world today?}
    Q1 --> Worldview[Worldview Text<br/>+ Sentiment]
    
    Worldview --> Midday[Midday Check-in<br/>13:00]
    Midday --> Q2{How are you<br/>feeling right now?}
    Q2 --> Mood[Mood Label<br/>+ Intensity]
    
    Mood --> Evening[Evening Reflection<br/>20:00]
    Evening --> Q3{What do you intend<br/>for tomorrow?}
    Q3 --> Intent[Intent Text<br/>+ Category]
    
    Intent --> Companion[Companion Agent]
    Companion --> Broker[Thought Broker<br/>Phrase Questions]
    Broker --> ECHO[ECHO Layer<br/>Score Reflection]
    ECHO --> Ledger[Civic Ledger<br/>Attest]
    Ledger --> Update[Update Companion<br/>Memory]
    Update --> Sleep[User Sleeps]
    
    style Q1 fill:#e1f5ff
    style Q2 fill:#fff3e0
    style Q3 fill:#f3e5f5
    style ECHO fill:#c8e6c9
    style Ledger fill:#ffccbc
```

---

## The Mobius Triad of Alignment

```mermaid
graph TD
    Triad[Mobius Triad<br/>of Alignment]
    
    Triad --> Meaning[MEANING<br/>Worldview<br/>Philosophy • Context • Values]
    Triad --> Emotion[EMOTION<br/>Mood<br/>Tone • Empathy • Affective State]
    Triad --> Direction[DIRECTION<br/>Intent<br/>Purpose • Goals • Trajectory]
    
    Meaning --> Integration[Daily Reflection<br/>Integration]
    Emotion --> Integration
    Direction --> Integration
    
    Integration --> Companion[Adapted<br/>Companion Behavior]
    Integration --> MIC[MIC Minting<br/>if GI increased]
    Integration --> Timeline[Metamorphosis<br/>Timeline]
    
    style Triad fill:#673ab7,color:#fff
    style Meaning fill:#2196f3,color:#fff
    style Emotion fill:#ff9800,color:#fff
    style Direction fill:#9c27b0,color:#fff
    style Integration fill:#4caf50,color:#fff
```

---

## SML Architecture Components

```mermaid
flowchart LR
    subgraph User["👤 User Interface"]
        Q1[Worldview<br/>Question]
        Q2[Mood<br/>Question]
        Q3[Intent<br/>Question]
    end
    
    subgraph Companion["🤖 Companion Agent"]
        Phrasing[Question<br/>Phrasing]
        Recording[Answer<br/>Recording]
    end
    
    subgraph Broker["💬 Thought Broker"]
        Deliberation[Multi-LLM<br/>Consensus]
        Constitution[Empathetic<br/>Constitution]
    end
    
    subgraph ECHO["🔍 ECHO Layer"]
        Scoring[Reflection<br/>Scoring]
        Drift[Drift<br/>Detection]
        Validation[Quality<br/>Validation]
    end
    
    subgraph Ledger["📜 Civic Ledger"]
        Attestation[Immutable<br/>Attestation]
        Hash[Cryptographic<br/>Hash]
    end
    
    subgraph Database["🗄️ PostgreSQL"]
        Table[daily_reflections<br/>table]
        Embeddings[Vector<br/>Embeddings]
    end
    
    Q1 & Q2 & Q3 --> Phrasing
    Phrasing --> Deliberation
    Deliberation --> Constitution
    Constitution --> Recording
    Recording --> Scoring
    Scoring --> Drift
    Drift --> Validation
    Validation --> Table
    Table --> Embeddings
    Embeddings --> Attestation
    Attestation --> Hash
    
    style ECHO fill:#c8e6c9
    style Ledger fill:#ffccbc
    style Database fill:#b3e5fc
```

---

*Cycle C-148 • Strange Metamorphosis Loop*  
*"We heal as we walk."*
