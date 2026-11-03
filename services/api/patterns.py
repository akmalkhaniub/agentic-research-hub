"""
patterns.py: Reference catalog of 9 canonical Agentic AI System Architecture Patterns,
complete with trade-offs, diagrams, and runnable code in LangGraph, Google ADK, and CrewAI.
"""

from typing import List, Dict, Any

PATTERNS_CATALOG: List[Dict[str, Any]] = [
    {
        "slug": "react",
        "name": "ReAct (Reason + Act)",
        "category": "Single Agent",
        "summary": "Interleaves internal reasoning traces with dynamic tool calls in an iterative decision loop.",
        "when_to_use": "Unpredictable workflows where the next tool call strictly depends on the previous tool's output.",
        "when_to_avoid": "Long-horizon workflows (>15 steps) where reasoning traces pollute the context window.",
        "tradeoffs": {"reliability": 3, "latency": 2, "token_cost": 2, "complexity": 1},
        "langgraph_code": """from langgraph.prebuilt import create_react_agent
from langchain_openai import ChatOpenAI

tools = [search_tool, execute_code, retrieve_docs]
model = ChatOpenAI(model="gpt-4o", temperature=0)

agent = create_react_agent(model, tools)
# Execute:
events = agent.stream({"messages": [("user", "Analyze the latest arXiv SOTA for MemOS-2")]})""",
        "adk_code": """from google.genai import agents

agent = agents.ReActAgent(
    model="gemini-2.5-flash",
    tools=[search_tool, calculator],
    system_instruction="Think step by step before calling tools."
)
response = agent.run("Find the optimal learning rate from the paper.")""",
        "crewai_code": """from crewai import Agent, Task, Crew

researcher = Agent(
    role="SOTA Researcher",
    goal="Discover and synthesize technical papers",
    tools=[search_tool],
    verbose=True
)"""
    },
    {
        "slug": "supervisor",
        "name": "Supervisor (Central Orchestrator)",
        "category": "Multi-Agent",
        "summary": "A centralized coordinator delegates sub-tasks to specialist agents and aggregates outputs.",
        "when_to_use": "Tasks cleanly split into distinct domains (e.g. Researcher, Code Implementer, Reviewer).",
        "when_to_avoid": "High-throughput, ultra-low-latency APIs where coordinator handoff hops add excessive delay.",
        "tradeoffs": {"reliability": 5, "latency": 4, "token_cost": 4, "complexity": 3},
        "langgraph_code": """from langgraph_supervisor import create_supervisor
from langgraph.prebuilt import create_react_agent

researcher = create_react_agent(model, [search_tool], name="researcher")
coder = create_react_agent(model, [python_repl], name="coder")
evaluator = create_react_agent(model, [metric_check], name="evaluator")

app = create_supervisor(
    [researcher, coder, evaluator],
    model=model,
    prompt="Manage specialists to reproduce table results."
).compile()""",
        "adk_code": """from google.genai import agents

supervisor = agents.CoordinatorAgent(
    model="gemini-2.5-flash",
    specialists=[research_agent, coding_agent],
    strategy="hierarchical"
)""",
        "crewai_code": """from crewai import Crew, Process

crew = Crew(
    agents=[researcher, coder, reviewer],
    tasks=[research_task, code_task, review_task],
    process=Process.hierarchical,
    manager_llm=ChatOpenAI(model="gpt-4o")
)"""
    },
    {
        "slug": "swarm",
        "name": "Swarm & Dynamic Handoffs",
        "category": "Multi-Agent",
        "summary": "Peer agents directly hand off conversation state and execution control to each other without a central supervisor.",
        "when_to_use": "Customer support routing, triage pipelines, and multi-domain chatbots where specialists take turns.",
        "when_to_avoid": "Critical operations requiring centralized auditing, token budgeting, and deadlock detection.",
        "tradeoffs": {"reliability": 3, "latency": 3, "token_cost": 3, "complexity": 4},
        "langgraph_code": """from langgraph.graph import StateGraph, START, END
from langgraph.types import Command

def triage_agent(state) -> Command[Literal["billing", "technical"]]:
    # Route directly to another agent node
    return Command(goto="technical", update={"active_agent": "technical"})""",
        "adk_code": """# Dynamic handoff protocol via agent transfers
transfer_to_support = agents.create_transfer_tool(target="support_agent")""",
        "crewai_code": """# Peer-to-peer delegation
coder.allow_delegation = True
researcher.allow_delegation = True"""
    },
    {
        "slug": "reflexion",
        "name": "Reflexion (Self-Critique & Memory)",
        "category": "Single Agent",
        "summary": "Agent evaluates its own execution results against a test harness, verbalizes failures, and stores them in memory to retry.",
        "when_to_use": "Code generation, algorithmic synthesis, and mathematical proofs where unit tests provide binary ground truth.",
        "when_to_avoid": "Subjective generation (creative writing, summarization) where programmatic validation is unavailable.",
        "tradeoffs": {"reliability": 5, "latency": 5, "token_cost": 4, "complexity": 3},
        "langgraph_code": """def evaluate_code(state):
    passed = run_pytest(state["code"])
    if not passed:
        critique = generate_critique(state["code"], state["test_output"])
        return Command(goto="coder", update={"reflections": [critique]})
    return Command(goto=END)""",
        "adk_code": """agent = agents.ReflexionLoop(
    generator=coder_agent,
    evaluator=unit_test_evaluator,
    max_retries=3
)""",
        "crewai_code": """# Self-refinement loop with custom reflection callback
task = Task(description="Write test-passing code", agent=coder, evaluation_callback=verify_solution)"""
    },
    {
        "slug": "hitl",
        "name": "Human-in-the-Loop (Interrupt Breakpoints)",
        "category": "Control",
        "summary": "Graph execution automatically halts at sensitive nodes (live financial spend, GPU quota consumption, cloud deployment) until approved.",
        "when_to_use": "Production agents with live credentials, live credit card spend, or irreversible destructive actions.",
        "when_to_avoid": "Pure read-only, non-destructive summarization queries.",
        "tradeoffs": {"reliability": 5, "latency": 5, "token_cost": 1, "complexity": 2},
        "langgraph_code": """# Compile with durable checkpointer and interrupt breakpoint
app = workflow.compile(
    checkpointer=MemorySaver(),
    interrupt_before=["deploy_cloud_infra", "dispatch_gpu_job"]
)
# Resume after human approval:
app.invoke(Command(resume={"approved": True}), config=config)""",
        "adk_code": """@agent.tool(requires_approval=True)
def delete_database_record(record_id: str):
    pass""",
        "crewai_code": """task = Task(
    description="Deploy service to Cloud Run",
    agent=devops_agent,
    human_input=True
)"""
    }
]

def get_all_patterns() -> List[Dict[str, Any]]:
    return PATTERNS_CATALOG

def get_pattern_by_slug(slug: str) -> Dict[str, Any]:
    for p in PATTERNS_CATALOG:
        if p["slug"] == slug:
            return p
    return PATTERNS_CATALOG[0]
