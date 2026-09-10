# RenderFlow

## Dynamic, Edge-Ready HMI Screen Generation for Industrial Systems

> **Ask → Understand → Validate → Render → Monitor**

RenderFlow is an **event-driven, AI-powered HMI screen generation platform** designed to make industrial interfaces more dynamic, contextual, and scalable.

Traditional HMI systems rely heavily on predefined screens that are manually designed for specific machines, assets, alarms, and operating conditions.

RenderFlow introduces a different approach:

> **Instead of designing every possible screen in advance, let the operator describe what they need and dynamically construct the appropriate interface from trusted machine context.**

An operator can simply request:

```text
Show me Pump 3 status
```

RenderFlow uses a **local AI model** to understand the request, selects relevant machine information and widgets, generates a structured screen specification, validates it against known machine context, and dynamically renders the interface.

The result is a system that combines:

**Natural Language + Local AI + Machine Context + Structured Generation + Validation + Deterministic Rendering + Live Telemetry**

---

# 🚨 The Industrial Problem

Industrial HMI systems need to present large amounts of machine information in a way that is fast, reliable, and understandable to operators.

However, traditional approaches commonly depend on **pre-designed screens**.

For every new machine, asset, diagnostic scenario, or operational requirement, engineering teams may need to:

1. Identify the required data
2. Design the screen
3. Configure widgets
4. Map machine tags
5. Test the interface
6. Deploy the configuration
7. Maintain it as the system evolves

This works well for known and stable workflows.

The challenge appears when plants become larger and more complex.

A single industrial environment may contain:

* Hundreds or thousands of telemetry tags
* Multiple machines
* Different asset hierarchies
* Different operator roles
* Large numbers of alarms
* Machine-specific diagnostic requirements
* Multiple operating conditions

This can lead to a growing number of predefined screens and increasing maintenance effort.

### The fundamental problem

An operator may know exactly **what information they need**, but the system may only provide **what someone previously designed**.

RenderFlow changes that interaction.

Instead of navigating through predefined screens:

```text
Operator
   │
   │ "Show me Pump 3 temperature,
   │ pressure and active alarms"
   ▼
RenderFlow
   │
   ▼
Context-aware HMI
```

The interface is generated around the operator's current requirement.

---

# 💡 Our Approach

RenderFlow treats the HMI as a **dynamic interface layer over trusted machine context**.

The AI is not allowed to freely generate application code.

Instead:

```text
Natural Language Request
          │
          ▼
      Local LLM
          │
          ▼
Structured Screen Specification
          │
          ▼
       Validation
          │
          ▼
Deterministic Renderer
          │
          ▼
     Dynamic HMI
          │
          ▼
    Live Telemetry
```

This separation is one of the core design decisions of RenderFlow.

### AI decides:

* What information is relevant
* Which supported widgets should be used
* Which machine tags are required
* How the information should be organized

### The application decides:

* Which tags actually exist
* Which widgets are allowed
* Whether the specification follows the schema
* How the widgets are rendered
* How telemetry is displayed

This gives us the flexibility of generative AI without allowing the model to directly control the UI implementation.

---

# 🧠 Why RenderFlow Is Different

## 1. Dynamic instead of Screen-First

Traditional approach:

```text
Machine → Pre-designed Screen
```

RenderFlow:

```text
Machine Context
      +
Operator Intent
      ↓
Dynamic Screen
```

The system doesn't need a separate manually designed screen for every possible operator request.

---

## 2. AI Generates Specifications, Not UI Code

The local LLM does **not** generate React, HTML, CSS, or executable code.

It generates a controlled JSON specification.

For example:

```json
{
  "title": "Pump 3 Overview",
  "layout": "grid",
  "widgets": [
    {
      "type": "gauge",
      "size": "medium",
      "tag": "pump3_temp"
    },
    {
      "type": "trend",
      "size": "large",
      "tag": "pump3_pressure",
      "window_seconds": 60
    },
    {
      "type": "alarm_banner",
      "tags": ["pump3_temp"]
    }
  ]
}
```

The frontend then renders this specification using a controlled widget registry.

This architecture makes the system significantly easier to validate, test, and scale than allowing an LLM to generate arbitrary UI code.

---

# 🏭 Machine Context Awareness

RenderFlow maintains structured machine context.

The context can include:

* Assets
* Telemetry tags
* Units
* Operating ranges
* Warning thresholds
* Critical thresholds
* Asset hierarchy
* Tag categories

Example:

```json
{
  "id": "pump3_temp",
  "name": "Pump 3 Temperature",
  "unit": "°C",
  "min": 0,
  "max": 120,
  "warn_threshold": 85,
  "crit_threshold": 100,
  "asset": "pump_3",
  "category": "temperature"
}
```

The AI receives this known context when generating a screen.

This means the model is not simply asked:

> "Create a screen about a pump."

It is given the actual available machine vocabulary and must construct the interface using that context.

---

# 📊 Dynamic HMI Widget System

RenderFlow uses a controlled widget registry.

Current prototype widgets include:

| Widget         | Purpose                          |
| -------------- | -------------------------------- |
| `gauge`        | Range-aware single-value display |
| `trend`        | Historical telemetry trend       |
| `numeric_card` | Large numerical value and label  |
| `alarm_banner` | Active threshold violations      |
| `table`        | Multi-tag diagnostic information |

### Why a controlled widget registry?

Because unrestricted AI-generated interfaces would make the system difficult to predict and validate.

Instead, RenderFlow follows:

```text
LLM
 │
 ├── gauge
 ├── trend
 ├── numeric_card
 ├── alarm_banner
 └── table
```

The model can compose interfaces from these approved building blocks.

This gives us a path to expand the platform without fundamentally changing the architecture.

New widgets can be added to the registry and become available to future generated screens.

---

# ⚡ Event-Driven HMI

RenderFlow is not limited to operator prompts.

The platform supports two primary interaction patterns.

## 1. Operator-Driven

```text
"Show me Pump 3 status"
```

The system generates the requested interface.

## 2. Event-Driven

For example:

```text
Pump 3 temperature > critical threshold
```

The event can cause RenderFlow to surface an appropriate diagnostic interface.

This creates a more proactive HMI experience.

Instead of:

```text
Alarm occurs
     ↓
Operator searches for information
     ↓
Operator navigates through screens
```

RenderFlow aims toward:

```text
Alarm occurs
     ↓
Affected asset identified
     ↓
Relevant context assembled
     ↓
Diagnostic HMI surfaced
```

This is particularly important for situations where operators need information quickly.

---

# 🛡️ AI Safety Through Structured Validation

Generative AI introduces an important challenge:

> **What happens if the model produces something incorrect?**

RenderFlow does not blindly trust the model output.

Every generated screen passes through a validation layer.

### Validation checks include:

* Schema validity
* Required fields
* Supported widget types
* Known machine tags
* Valid machine context references

```text
             LLM
              │
              ▼
       Screen Specification
              │
              ▼
         ┌───────────┐
         │ Validator │
         └─────┬─────┘
               │
       ┌───────┴───────┐
       │               │
     Valid           Invalid
       │               │
       ▼               ▼
    Render            Retry
                       │
                       ▼
                   Validate
                       │
                ┌──────┴──────┐
                │             │
              Valid         Invalid
                │             │
                ▼             ▼
              Render     Graceful Error
```

The current prototype performs one automatic retry using validation feedback.

If the second attempt is still invalid, the system returns a controlled error rather than rendering an invalid screen.

---

# 🔒 Local-First / Edge-Ready Architecture

Industrial environments often have requirements around:

* Data locality
* Network reliability
* Operational continuity
* Security
* Connectivity constraints

RenderFlow is therefore designed around a **local-first architecture**.

The prototype uses:

```text
Ollama
   ↓
Local AI Model
   ↓
RenderFlow Backend
   ↓
React HMI
```

The architecture does not fundamentally depend on sending machine context to a remote cloud AI service.

This makes RenderFlow suitable for an **edge deployment model** where AI inference and application services can operate within the plant environment.

### Target deployment architecture

```text
┌───────────────────────────────────────────────┐
│                 FACTORY / EDGE                │
│                                               │
│   PLC / Industrial Data Source                │
│              │                                │
│              ▼                                │
│       Machine Context                         │
│              │                                │
│              ▼                                │
│       RenderFlow Backend                      │
│              │                                │
│       ┌──────┴──────┐                         │
│       ▼             ▼                         │
│   Local AI      Validation                    │
│       │             │                         │
│       └──────┬──────┘                         │
│              ▼                                │
│       HMI / Operator UI                       │
│                                               │
└───────────────────────────────────────────────┘
```

The current prototype uses simulated telemetry. Real PLC and industrial protocol integrations are part of the roadmap.

---

# 📡 Live Telemetry

The prototype includes a telemetry simulator that produces changing machine values.

Telemetry is exposed through:

```http
GET /telemetry
```

The React frontend consumes telemetry through a shared hook.

```text
Telemetry Simulator
        │
        ▼
   /telemetry
        │
        ▼
  useTelemetry()
        │
   ┌────┼────┐
   ▼    ▼    ▼
 Gauge Trend Table
```

This allows dynamically generated widgets to display continuously changing machine values.

---

# 🎙️ Voice-Based Interaction

RenderFlow can optionally accept operator requests using the browser's native **Web Speech API**.

Example:

```text
🎙 "Show me Pump 3 status"
```

The resulting transcript follows the same generation pipeline as typed input.

```text
Voice
  ↓
Speech-to-Text
  ↓
Natural Language Request
  ↓
Screen Generation
  ↓
Validation
  ↓
Dynamic HMI
```

If speech recognition is unavailable, the application falls back to text input.

---

# 📈 Scalability

One of the core goals of RenderFlow is to avoid scaling the HMI experience purely by adding more manually designed screens.

## Traditional scaling model

```text
More Machines
      ↓
More Tags
      ↓
More Screens
      ↓
More Configuration
      ↓
More Maintenance
```

## RenderFlow scaling model

```text
More Machines
      ↓
More Machine Context
      ↓
Same Generation Engine
      ↓
Dynamic Screens
```

The generation engine and rendering framework remain reusable while machine-specific information is represented as structured context.

### Scaling across assets

A new machine can introduce:

* New assets
* New telemetry tags
* New thresholds
* New relationships

without necessarily requiring a completely new screen architecture.

The same controlled widget vocabulary can be reused.

---

# 🌐 Multi-Plant Scalability

RenderFlow is also designed with multi-site deployment in mind.

```text
                  RenderFlow Platform
                         │
          ┌──────────────┼──────────────┐
          │              │              │
          ▼              ▼              ▼
       Plant A        Plant B        Plant C
          │              │              │
      Local Edge     Local Edge     Local Edge
          │              │              │
       Machine       Machine       Machine
       Context       Context       Context
```

Each plant can maintain its own local machine context and operational environment.

This creates a potential deployment model where the same core platform can serve multiple industrial environments while preserving plant-specific configuration.

---

# 🔌 Real-World Industrial Integration

The current prototype uses simulated telemetry to demonstrate the architecture.

The same interface can be extended toward real industrial data sources.

### Planned integrations include:

* OPC UA
* Modbus TCP
* PLC connectivity
* Additional industrial communication protocols

Conceptually:

```text
Real PLC / Industrial Protocol
              ↓
       Data Ingestion Layer
              ↓
       Machine Context
              ↓
         RenderFlow
              ↓
        Dynamic HMI
```

This separation between **data ingestion** and **HMI generation** is intentional.

It allows the HMI generation engine to remain largely independent of the underlying machine communication protocol.

---

# 🏗️ Architecture

```text
RenderFlow
│
├── Frontend
│   ├── PromptBar
│   ├── ScreenCanvas
│   ├── WidgetRegistry
│   ├── GaugeWidget
│   ├── TrendWidget
│   ├── NumericCardWidget
│   ├── AlarmBannerWidget
│   ├── TableWidget
│   ├── HistorySidebar
│   └── MachineVisualization
│
├── Backend
│   ├── Express API
│   ├── LLM orchestration
│   ├── Output validation
│   ├── Retry / fallback logic
│   ├── Machine context
│   └── Telemetry simulator
│
└── Local AI
    └── Ollama
        └── Phi-3
```

---

# 🔄 Core Data Flow

## Operator Request

```text
Operator
   │
   ▼
Prompt / Voice
   │
   ▼
Backend
   │
   ├── Machine Context
   ├── Widget Registry
   └── Output Schema
           │
           ▼
        Local LLM
           │
           ▼
    JSON Screen Spec
           │
           ▼
       Validator
           │
           ▼
    React Renderer
           │
           ▼
       HMI Screen
```

## Machine Event

```text
Machine Telemetry
       │
       ▼
Threshold / Event
       │
       ▼
Affected Asset
       │
       ▼
Relevant Context
       │
       ▼
Diagnostic Screen
       │
       ▼
Operator
```

---

# 🔄 API

| Endpoint           | Method | Description                                         |
| ------------------ | ------ | --------------------------------------------------- |
| `/machine-context` | `GET`  | Returns machine tags and asset hierarchy            |
| `/telemetry`       | `GET`  | Returns current telemetry snapshot                  |
| `/generate-screen` | `POST` | Generates and validates an HMI screen specification |

### Generate Screen

```http
POST /generate-screen
Content-Type: application/json
```

Request:

```json
{
  "type": "prompt",
  "text": "Show me Pump 3 status"
}
```

Response:

```json
{
  "title": "Pump 3 Status",
  "layout": "grid",
  "widgets": []
}
```

---

# 🧪 End-to-End Demo

The current prototype can be demonstrated through the following flow.

### Step 1 — Initialize

RenderFlow loads the available machine context.

### Step 2 — Ask

The operator enters:

```text
Show me Pump 3 status
```

### Step 3 — Understand

The local LLM receives the request together with relevant machine context and the allowed widget vocabulary.

### Step 4 — Generate

The model produces a structured screen specification.

### Step 5 — Validate

The backend verifies:

```text
Known Tags
Supported Widgets
Valid Schema
Required Fields
```

### Step 6 — Render

React dynamically constructs the HMI.

### Step 7 — Monitor

Widgets display live telemetry.

### Step 8 — Trigger Event

A simulated machine value crosses its configured threshold.

### Step 9 — Diagnose

RenderFlow surfaces the relevant alarm/diagnostic context.

---

# 🛠️ Technology Stack

## Frontend

* React
* Tailwind CSS
* JavaScript
* Web Speech API

## Backend

* Node.js
* Express

## AI

* Ollama
* Phi-3
* Structured JSON generation

## Data

* Machine context JSON
* In-memory telemetry simulator

## Validation

* Structured screen schema
* Tag validation
* Widget validation
* Automatic retry
* Graceful fallback

---

# 📁 Project Structure

```text
renderflow/
│
├── backend/
│   ├── ingestion/
│   │   └── simulator.js
│   ├── routes/
│   │   └── context.routes.js
│   ├── db/
│   ├── server.js
│   └── ...
│
├── frontend/
│   ├── components/
│   ├── widgets/
│   ├── hooks/
│   └── ...
│
├── prisma/
│   └── schema.prisma
│
├── shared/
│   └── fixtures/
│       ├── alarms.json
│       └── context.json
│
└── README.md
```

---

# 🚀 Getting Started

## Prerequisites

Make sure you have:

* Node.js
* npm
* Ollama
* Phi-3 model

## Install Dependencies

```bash
npm install
```

Start Ollama and make sure the required model is available.

Start the backend:

```bash
npm run dev
```

Start the frontend using the configured frontend command.

---

# 💰 Business Model

## Pay for Expansion + Operational Continuity

RenderFlow follows a business model designed around **industrial growth rather than operator count**.

### 1. Plant-Based License

Customers begin with a fixed annual license for a plant deployment.

As their industrial footprint grows, the platform scales with:

* More connected assets
* Higher asset capacity
* Additional plant deployments

The key principle is:

> **Customers pay as their industrial footprint expands, not for every operator using the system.**

---

## 2. Continuity Layer

As RenderFlow becomes part of a plant's daily operational workflow, customers can add an annual **Continuity Layer**.

This can include:

* Configuration backup
* System recovery
* Historical data preservation
* System health monitoring
* Remote diagnostics

The positioning is simple:

> **Operational continuity for the plant's HMI environment.**

This creates recurring revenue while providing a service that becomes increasingly valuable as the platform becomes embedded in the customer's operations.

---

# 📈 Why the Business Model Scales

The model follows:

```text
Initial Plant
      ↓
Platform License
      ↓
More Assets
      ↓
Expansion Revenue
      ↓
More Plants
      ↓
Multi-Site Revenue
      ↓
Continuity Services
      ↓
Recurring Revenue
```

This creates multiple expansion paths without requiring the product to become dependent on per-user pricing.

---

# 🏭 Implementation Strategy

RenderFlow is intentionally designed to support gradual industrial adoption rather than requiring a complete replacement of an existing HMI environment.

## Phase 1 — Pilot

Deploy RenderFlow in a controlled environment using existing machine context and telemetry.

```text
Single Plant
   ↓
Selected Machines
   ↓
Controlled Pilot
```

## Phase 2 — Asset Expansion

Expand the platform to additional machines and asset groups.

```text
Pilot
 ↓
More Assets
 ↓
More Operators
 ↓
More Use Cases
```

## Phase 3 — Industrial Connectivity

Integrate with real industrial data sources such as PLCs and industrial protocols.

```text
PLC / OPC UA / Modbus
          ↓
     Data Layer
          ↓
      RenderFlow
          ↓
        HMI
```

## Phase 4 — Multi-Plant Deployment

Deploy the platform across multiple facilities using plant-specific machine contexts.

```text
Plant A ─┐
Plant B ─┼── RenderFlow Architecture
Plant C ─┘
```

This staged approach reduces adoption risk while allowing the platform to scale progressively.

---

# 🔐 Security & Reliability Principles

RenderFlow follows several architectural principles intended for industrial environments.

### Local-First AI

AI inference can run locally instead of requiring machine telemetry to be sent to a remote AI service.

### Controlled Generation

The model generates structured specifications rather than arbitrary executable code.

### Validation Before Rendering

Generated interfaces are validated before being rendered.

### Graceful Failure

Invalid AI output does not automatically become an HMI screen.

### Deterministic UI

The frontend controls the actual rendering behavior.

### Separation of Concerns

Machine communication, AI orchestration, validation, and UI rendering are separated into distinct layers.

---

# 📊 Why This Can Scale Technically

RenderFlow's scalability comes from separating **machine-specific information** from the **core rendering engine**.

Instead of creating:

```text
Machine A → Custom Screen Code
Machine B → Custom Screen Code
Machine C → Custom Screen Code
Machine D → Custom Screen Code
```

RenderFlow aims for:

```text
Machine Context
      ↓
Common Generation Engine
      ↓
Common Widget Registry
      ↓
Dynamic Screen
```

This means the system can expand its machine coverage primarily by expanding machine context and supported integrations rather than continuously creating completely independent screen implementations.

---

# 🧩 Design Principles

## LLM Generates Specifications, Not UI Code

Keeps generative behavior constrained.

## Deterministic Rendering

The application controls the final UI.

## Backend Validation

Generated output is never trusted blindly.

## Local-First Architecture

Supports local AI inference and local machine-context processing.

## Controlled Widget Vocabulary

Keeps generated interfaces predictable.

## Event-Driven Interaction

Allows machine events to influence the operator interface.

## Protocol-Agnostic HMI Layer

The HMI generation layer can be separated from the underlying industrial communication technology.

---

# 🔮 Roadmap

## Current Prototype

* Natural-language screen generation
* Local LLM integration
* Structured JSON output
* Screen validation
* Automatic retry
* Dynamic React rendering
* Machine context
* Simulated telemetry
* Threshold-based events
* Voice input
* Controlled widget registry

## Next Stage

* Real PLC connectivity
* OPC UA
* Modbus TCP
* Additional industrial protocols
* Persistent telemetry
* Persistent screen history
* Role-specific operator views
* Advanced diagnostic reasoning
* More industrial visualization primitives

## Long-Term Vision

```text
                  RenderFlow
                      │
       ┌──────────────┼──────────────┐
       ▼              ▼              ▼
    Machine        Operator       Machine
    Context         Intent         Events
       │              │              │
       └──────────────┼──────────────┘
                      ▼
             Contextual HMI
                      │
             ┌────────┴────────┐
             ▼                 ▼
        Monitoring         Diagnostics
             │                 │
             └────────┬────────┘
                      ▼
              Smarter Operations
```

The long-term vision is to move from **static HMI screens** toward a more **context-aware operational interface**.

---

# 🎯 Why RenderFlow Matters

RenderFlow is not simply an AI chatbot placed inside an HMI.

Its architecture deliberately combines:

### Natural Language

Operators describe what they need.

### Machine Context

The system understands the available assets and telemetry.

### Local AI

Inference can happen within the local environment.

### Structured Generation

AI produces a controlled screen specification.

### Validation

Generated output is checked before rendering.

### Deterministic Rendering

The application remains in control of the final interface.

### Live Telemetry

The generated interface connects to continuously changing machine values.

### Event-Driven Diagnostics

Machine events can influence what the operator sees.

Together, these capabilities create a fundamentally different interaction model for industrial HMIs.

---

# 🏆 The Core Idea

Traditional HMI:

> **Design the screen first, then ask the operator to navigate to it.**

RenderFlow:

> **Let the operator describe what they need, then construct the appropriate interface from trusted machine context.**

This changes the HMI from a collection of predefined screens into a **dynamic interface layer over the industrial environment**.

---

# 👥 Team

## Team Diamonds

* Soumil
* Aditi
* Shristy

---

# 🚧 Project Status

**Hackathon Prototype**

RenderFlow is currently a proof-of-concept demonstrating:

* Dynamic HMI generation
* Local AI inference
* Structured screen specifications
* Machine-context awareness
* Validation and fallback
* Live simulated telemetry
* Event-driven diagnostics
* Edge-ready architecture

The architecture is intentionally designed so that the prototype can evolve toward real industrial data sources and larger multi-machine deployments.

---

## Final Vision

> **RenderFlow aims to make industrial HMIs more adaptive, contextual, and scalable — allowing operators to interact with machines through intent rather than navigating a fixed collection of screens.**

**Ask what you need.
Render the right interface.
Monitor the machine.**
