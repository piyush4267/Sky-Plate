# Sky-Plate

You are a senior full-stack engineer and product designer. Build a hackathon-winning prototype called "SkyChain": an in-flight dietary safety and fulfillment platform. Build it in the phases below, finishing and verifying each phase before starting the next. After each phase, summarize what you built and how to run it.

==================================================
1. PRODUCT CONCEPT
==================================================
Airlines already have catering planning tools (Paxia, gategroup, LSG) and passenger special-meal request forms. The gap is the link between them: declared dietary need -> verified meal -> seat -> crew action -> closed loop.

SkyChain is NOT a meal-booking app and NOT a catering forecaster. It is a closed-loop "Dietary Fulfillment Chain" that proves each passenger's dietary need was received, validated, matched, confirmed by catering, loaded, briefed to crew, served, and closed, and that raises specific actions when any step fails.

Core principles (enforce in code and mention in the UI/docs):
- Declared vs. verified are separate concepts. A passenger's declared allergy is never treated as equivalent to a verified meal ingredient record.
- The LLM only EXTRACTS and SUGGESTS. A deterministic rules engine makes every safety decision.
- Fail-safe default: unknown or unverified is never shown as safe.
- Every state change is an immutable, timestamped event (audit log).
- Role-scoped data: crew see only what they need for service.
- The system supports crew decisions; it never claims an "allergen-free" guarantee.

==================================================
2. TECH STACK
==================================================
- Frontend: React + TypeScript + Vite + Tailwind CSS. Crew view is a PWA (installable, works offline with local cache and sync-on-reconnect).
- Backend: Python FastAPI, Pydantic models, SQLite (SQLAlchemy) for easy setup.
- Realtime: WebSockets (or SSE) for live alerts to crew and ops dashboards.
- LLM: pluggable provider interface (default: Anthropic API using an env var; also a deterministic mock parser fallback so the demo works offline with no API key).
- Forecasting (optional module, Phase 7): scikit-learn quantile regression or simple statistical model with uncertainty ranges.
- Testing: pytest for backend (rules engine and state machine must have thorough tests), Vitest for key frontend logic.
- One-command local run (docker-compose or a Makefile with `make dev`), plus seed script.

==================================================
3. DATA MODEL
==================================================
Design these entities with clear relationships and indexes:

- Flight: id, flight_number, route (origin, destination), departure_time, aircraft_type, cabins, status
- Passenger: id (synthetic), name (synthetic), seat, cabin, party_id, language, booking_ref
- DietaryDeclaration: id, passenger_id, raw_text, source (booking | check-in | call_center | crew), structured fields (allergens[], severity per allergen, religious_restrictions[], medical_restrictions[], preferences[], notes), parse_confidence, review_status (auto_accepted | needs_review | human_confirmed | rejected), created_at
- Meal: id, name, special_meal_code (e.g. VGML, AVML, JNML, MOML, KSML, DBML, GFML, LFML, CHML, BBML, NLML), cabin, description
- MealIngredientRecord: id, meal_id, ingredients[], declared_allergens[], may_contain[], cross_contact_assessed (bool), verification_source, verified_at, verified_by, batch_id
- MatchResult: id, declaration_id, meal_id, status enum {CONFIRMED_SAFE, SAFE_CROSS_CONTACT_NOT_ASSESSED, UNVERIFIED, CONFLICT, NO_SUITABLE_MEAL}, reasons[], rule_ids_triggered[], computed_at
- FulfillmentChain: id, passenger_id, declaration_id, current_stage enum {DECLARED, VALIDATED, MATCHED, CATERING_CONFIRMED, LOADED, CREW_BRIEFED, SERVED, CLOSED, EXCEPTION}, owner_role, updated_at
- FulfillmentEvent (append-only audit log): id, chain_id, event_type, from_stage, to_stage, actor_role, actor_id, payload JSON, timestamp
- Alert: id, chain_id, flight_id, seat, severity (CRITICAL | HIGH | MEDIUM | INFO), title, required_action, status (OPEN | ACKNOWLEDGED | RESOLVED | ESCALATED), acknowledged_by, acknowledged_at, resolved_at
- ExceptionCase: id, chain_id, type (LATE_ADD | SEAT_CHANGE | MEAL_UNAVAILABLE | BATCH_CHANGE | CODE_MISMATCH | LOW_CONFIDENCE_PARSE), proposed_resolutions[], chosen_resolution, approved_by
- User/Role: passenger, catering, crew, ops_admin

==================================================
4. RULES ENGINE (deterministic, heavily tested)
==================================================
Implement as a pure, side-effect-free module with versioned rule IDs. Inputs: DietaryDeclaration + candidate Meal + MealIngredientRecord. Output: MatchResult with reasons.

Required rules (non-exhaustive, extend sensibly):
- R1: Any declared allergen present in the meal's ingredients or declared_allergens -> CONFLICT.
- R2: Declared allergen appears in may_contain -> CONFLICT if severity is severe/anaphylactic, otherwise flag SAFE_CROSS_CONTACT_NOT_ASSESSED with a warning.
- R3: Meal ingredient record missing or cross_contact_assessed = false -> at best SAFE_CROSS_CONTACT_NOT_ASSESSED; if no record at all -> UNVERIFIED.
- R4: Religious/dietary code restrictions (halal, kosher, Jain, vegetarian, vegan) checked against ingredient tags; ambiguous items (e.g., gelatin, rennet, alcohol-based flavorings) -> UNVERIFIED, not safe.
- R5: Allergen synonym and hierarchy handling (e.g., "groundnut" = peanut, "tree nuts" expands to specific nuts, "dairy" includes milk, whey, casein, ghee, paneer, butter; "gluten" includes wheat, barley, rye, and common derivatives).
- R6: Severe allergy declared + no suitable meal -> NO_SUITABLE_MEAL with CRITICAL alert and recommended escalation (e.g., passenger may bring own food per airline policy, notify ground staff before departure).
- R7: Low parse confidence (< configurable threshold) or any unresolved ambiguity -> route to human review; never auto-accept.
- R8: Party handling: a declaration for a child or family member applies to the correct passenger, and the parent seat is linked in the alert.
- R9: Unknown anything defaults to UNVERIFIED.

Write at least 40 pytest cases covering: synonyms, hierarchies, cross-contact, severity differences, multi-allergen passengers, religious ambiguity, missing records, and late changes. Include property-style tests where a meal containing a declared allergen must NEVER produce CONFIRMED_SAFE.

==================================================
5. LLM INTAKE PARSER
==================================================
- Endpoint: POST /api/intake taking free text (English, Hindi, Punjabi, Hinglish supported) and the passenger/flight context.
- The LLM returns strict JSON matching a Pydantic schema: allergens (with severity), restrictions, preferences, party members referenced, ambiguities[], and a confidence score 0-1.
- Validate the output against the schema; on failure, retry once, then fall back to needs_review.
- Never let the LLM output a safety verdict. It only fills the DietaryDeclaration; the rules engine produces the MatchResult.
- Include a mock parser (keyword and synonym-based) used when no API key is present so the demo is always runnable.
- Provide the full system prompt for the parser in /backend/prompts/intake_parser.md, including few-shot examples with messy input (e.g., "no nuts, my son is severely allergic, we also don't eat beef", "bina pyaaz lehsun ke Jain khana chahiye", "mild lactose issue, not serious").
- Show the extracted structure, confidence, and flagged ambiguities to the user for confirmation before submission.

==================================================
6. FULFILLMENT STATE MACHINE
==================================================
- Explicit allowed transitions only; invalid transitions are rejected and logged.
- Each stage has an owner role and a failure path to EXCEPTION.
- Every transition writes an append-only FulfillmentEvent.
- Idempotent endpoints: duplicate or out-of-order messages must not corrupt state.
- Time-based escalation: configurable thresholds (e.g., unresolved CRITICAL item at T-6h, T-3h, T-1h before departure escalates to ops_admin).

==================================================
7. EXCEPTION ENGINE
==================================================
Detect and propose resolutions (human approval required) for:
- LATE_ADD: passenger added after catering cutoff -> check spare special-meal buffer, propose substitute meals, flag if none.
- SEAT_CHANGE: update seat in alerts and notify crew.
- BATCH_CHANGE: ingredient record changes for a loaded meal -> re-run matching for all affected passengers.
- MEAL_UNAVAILABLE: propose the safest alternative and show the match status of each option.
- CODE_MISMATCH: booking special-meal code differs from the parsed declaration -> raise for review.
Each exception shows: what happened, who's affected, proposed options with their match statuses, and an approve action that writes an audit event.

==================================================
8. USER INTERFACES
==================================================
A) Passenger intake (mobile-first)
- Free-text box plus quick-select chips. Live parsed preview with confidence and ambiguity prompts. Confirmation step. Status tracker showing their chain stage in plain language. Honest disclaimer: requests are supported but allergen-free environments cannot be guaranteed.

B) Crew app (PWA, dark-cabin mode, large touch targets, offline-capable)
- Seat map of the cabin with color-coded dietary status per seat.
- Prioritized task list: severity-sorted alerts with seat, passenger, what is confirmed, what is unresolved, and the required action.
- One-tap acknowledge and resolve; every action timestamped and logged.
- Search by seat or name; filter by severity and status.
- Offline queue that syncs on reconnect, with a visible sync indicator.

C) Catering/Ops dashboard
- Aggregated special-meal counts per flight, unresolved items, chain-stage funnel, countdown to departure, exception queue with approve actions, and the human review queue for low-confidence parses.

D) Impact dashboard
- Metrics: percent of requests with a complete chain, unresolved high-severity items at T-24h/T-6h/T-1h, meal mismatch rate, average time-to-resolution, estimated waste avoided from special-meal buffer sizing. Label all numbers clearly as simulated with published assumptions.

E) Audit timeline view
- Per-passenger chronological event log (who did what, when).

Design direction: clean, calm, high-contrast, aviation-grade clarity. Status colors must never rely on color alone (use icons and labels). Accessible (WCAG AA), responsive.

==================================================
9. SYNTHETIC DATA AND DEMO SCENARIO
==================================================
Create a seed script generating:
- One flight (e.g., Delhi to London, ~160 passengers, economy plus business), realistic seat map.
- Passenger dietary mix: majority no restrictions; ~25-30% special meals (vegetarian, Jain, halal, diabetic, gluten-free, low-lactose, child meals); a handful of severe allergies (peanut, tree nut, shellfish, sesame); several messy free-text declarations in English/Hindi/Hinglish; a few ambiguous cases.
- 8-10 meals with ingredient records, including some with may_contain warnings and some with missing cross-contact assessment.
- Pre-scripted demo scenario (triggerable by a "Run demo" button or script):
  1. A passenger submits a messy request with a severe allergy.
  2. Parser extracts it with a flagged ambiguity; the passenger confirms.
  3. Rules engine returns SAFE_CROSS_CONTACT_NOT_ASSESSED; catering confirms; chain advances.
  4. Disruption: a catering batch change or seat change turns the match into CONFLICT.
  5. Exception engine raises a CRITICAL alert on the crew app at the correct seat with a specific action; crew acknowledges; ops approves a substitute meal.
  6. The audit timeline shows the full story; the impact dashboard updates.
All synthetic data only. No real PII.

==================================================
10. INTEGRATION ADAPTER LAYER (mock)
==================================================
Define clean interfaces (ports/adapters) for: PassengerServiceSystem (booking/manifest), CateringSystem (meal plans, ingredient records), and CrewMessaging. Provide mock implementations and clear docs showing where a real airline or Paxia/gategroup integration would plug in. Label these as mocks in the UI and README. Do not claim real integrations.

==================================================
11. OPTIONAL MODULE: SPECIAL-MEAL BUFFER FORECAST (Phase 7)
==================================================
Only after everything else works. Predict how many extra special meals of each code to load per route/flight using synthetic historical data, output quantile ranges (e.g., P50/P90), compare against a naive baseline, and show expected surplus and shortfall risk. Safety rule: forecasts never override or suppress any individual allergy alert or match result.

==================================================
12. SECURITY, PRIVACY, AND SAFETY
==================================================
- Role-based access on every endpoint; crew endpoints return minimal necessary data.
- No secrets in the repo; .env.example provided.
- Input validation and rate limiting on intake.
- Document data retention and consent assumptions in the README.
- UI copy must avoid guarantee language; use "supports crew decisions" phrasing.

==================================================
13. BUILD PHASES (complete in order)
==================================================
Phase 1: Repo scaffold, data model, migrations, seed data generator.
Phase 2: Rules engine and state machine with full test suite passing.
Phase 3: LLM intake parser (with mock fallback) and intake API plus passenger UI.
Phase 4: Crew PWA with seat map, alerts, acknowledge flow, realtime updates, offline queue.
Phase 5: Exception engine plus ops dashboard plus review queue.
Phase 6: Impact dashboard, audit timeline, scripted demo scenario with a "Run demo" control.
Phase 7: (Optional) buffer forecast module.
Phase 8: Polish: accessibility pass, README, architecture diagram, pitch-ready screenshots, a 2-minute demo script, and a short "known limitations" section.

==================================================
14. DELIVERABLES
==================================================
- Working code with a one-command setup and a seeded demo.
- README covering: problem, differentiators (declared-vs-verified, LLM-extracts/rules-decide, closed-loop chain, exception engine), architecture diagram, how to run, how to run tests, demo script, limitations, and honest competitive positioning (acknowledge Paxia, gategroup, and LSG cover catering planning; SkyChain focuses on the passenger-to-crew safety chain and is designed to integrate, not replace).
- /docs/rules.md describing every rule ID and its rationale.
- Test report summary.

==================================================
15. WORKING STYLE
==================================================
- Before writing code, briefly state your plan and any assumptions; ask me only about true blockers.
- Prefer small, verifiable steps; run the tests and the app after each phase and fix failures before moving on.
- Keep code typed, modular, and commented where safety logic is involved.
- Do not add features outside this spec. If you think something is missing, propose it at the end rather than building it.
- Never mark anything as "safe" in code or UI unless the rules engine explicitly returns CONFIRMED_SAFE.
