Write the exact prompt - nothing more, nothing else - to give to Cursor for it to create a web application executable in Cursor that will provide a chatGPT Like service
For the AI processing, use the LLM  Mistral-Small-24B-W8A8 accessible via the Red Hat API https://maas.apps.prod.rhoai.rh-aiservices-bu.com/
The Red Hat API is to be found in the file secrets.md
Red Hat API endpoint is provided in secrets.md
Do not give any specific technical details. But give high level directions like "Keep it as simple as possible simple, use top-of-the art practices, use the language the simpliest and most efficient to generate and run in Cursor"
Make sure there is live feedback on the progress of the operations in the console
Make sure the errors are properly handled and displayed in the output. 
Critical errors must not stop the application but be fully displayed


--------------

Create a minimal, production-grade web application (fully runnable inside Cursor) that provides a ChatGPT-like chat experience (single-page UI + backend API) with streaming responses.

AI inference must use Mistral-Small-24B-W8A8 via the Red Hat AI Services API, and the Red Hat API endpoint must be read from secrets.md (do not hardcode it).
All required Red Hat API credentials / keys / headers must also be read from secrets.md (do not hardcode secrets anywhere). Treat secrets.md as the single source of truth for auth configuration and endpoint configuration.

High-level requirements:
	•	Keep it as simple as possible, while using top-of-the-art best practices.
	•	Use the simplest and most efficient language and stack that is easiest for Cursor to generate, run, and maintain.
	•	Provide a clean chat UI: message list, user input box, send button, and streaming assistant output.
	•	Support multi-turn conversation within a session (maintain context for the conversation).
	•	Include live progress feedback in the console for key operations (startup, request received, upstream call started, streaming in progress, completed, retries/fallbacks, errors).
	•	Implement robust error handling:
	•	Errors must be captured, categorized, and displayed clearly in both the UI output and console logs.
	•	Critical errors must not stop the application; the app must remain running and keep accepting new requests.
	•	When an error happens, the assistant should return a helpful, user-safe error message in the chat, while logging the full technical details to the console.
	•	Add sensible timeouts and retry behavior (kept minimal) for upstream calls, with clear logging.
	•	Include a simple local run workflow that works out-of-the-box in Cursor (clear run steps, minimal dependencies).

Deliverables:
	•	A complete runnable project with clear structure (frontend, backend, shared types/config if needed).
	•	A concise README with how to run, where secrets.md is expected, and how to verify the chat works.
	•	Do not include unnecessary features; focus on a stable, streaming chat experience with excellent resiliency and logging.