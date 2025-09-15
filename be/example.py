"""for structured output, use the following code:

from google import genai
from pydantic import BaseModel

class Recipe(BaseModel):
    recipe_name: str
    ingredients: list[str]

client = genai.Client()
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="See if the inputs is enough to generate a plan for 6 months for the subject/goal, if not return the list of inputs that are needed in json format, with a list of questions",
    config={
        "response_mime_type": "application/json",
        "response_schema": list[Recipe],
    },
)
# Use the response as a JSON string.
print(response.text)

# Use instantiated objects.
my_recipes: list[Recipe] = response.parsed

"""

"""for structured output, use the following code:

from google import genai
from pydantic import BaseModel

class Recipe(BaseModel):
    recipe_name: str
    ingredients: list[str]

client = genai.Client()
response = client.models.generate_content(
    model="gemini-2.5-pro",
    contents="Hey Chat, I want you to act like a professional mentor and generate a structured 6-month (24-week) learning roadmap for me.
🔹 Goal: I want to learn [SUBJECT/GOAL] in 6 months (24 weeks).
Guidelines:
Split the 6 months into 24 weeks.
For each week, provide a list of actionable to-dos only (not grouped by "read/watch/practice").
Each todo must begin with its Eisenhower quadrant in braces, e.g.
{Q1} Learn FastAPI basics
{Q2} Revise networking fundamentals
{Q3} Check optional forum posts
{Q4} Avoid random YouTube distractions
Use quadrants fairly and beautifully distribute tasks (don’t dump everything into Q1).
Q1 = Urgent + Important → Do First
Q2 = Not Urgent + Important → Schedule
Q3 = Urgent + Not Important → Delegate/Minimize
Q4 = Not Urgent + Not Important → Eliminate/Avoid
Assume ~3 hours/day of effort, and Sundays are rest days.
At the end of each week, add a Weekly Review Task (quiz, reflection, or mini-project), also tagged with its quadrant.
By Week 24, I should demonstrate competence through a capstone project (tagged Q1).
Output format:
Week X – [Theme]
{Q1} Todo 1
{Q2} Todo 2
{Q3} Todo 3
{Q4} Todo 4
Weekly Review Task: {Q1} [review/quiz/project]
Now, please generate the full 24-week plan in this format for [SUBJECT/GOAL].
the subject is adv python dev using fastapi",
    config={
        "response_mime_type": "application/json",
        "response_schema": list[Recipe],
    },
)
# Use the response as a JSON string.
print(response.text)

# Use instantiated objects.
my_recipes: list[Recipe] = response.parsed

"""
