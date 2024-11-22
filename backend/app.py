
from groq import Groq
from bson import ObjectId
import os
from flask import Flask, request, jsonify
from pymongo import MongoClient
from flask_cors import CORS, cross_origin
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)


API_KEY = os.getenv("API_KEY")
MONGO_URI = os.getenv("MONGO_URI")
client = Groq(api_key=API_KEY)
mongo_client = MongoClient(MONGO_URI)
db = mongo_client["task"]
conversations_collection = db["conversations"]
system_prompts_collection = db["system_prompts"]

conversation_log = []

default_prompts = [
    {"id": 1, "content": "You are an expert assistant capable of solving any problem efficiently, providing clear, accurate, and concise information to achieve desired outcomes."},
    {"id": 2, "content": "Act as a knowledgeable and versatile advisor, adapting to any scenario to deliver actionable insights, solutions, and support."},
    {"id": 3, "content": "Be a reliable, resourceful, and creative problem solver, equipped to handle any task with clarity, precision, and professionalism."}
]
if system_prompts_collection.count_documents({}) == 0:
    system_prompts_collection.insert_many(default_prompts)

@app.route('/')
def home():
    return "Welcome to the Flask API!"


@app.route('/prompts', methods=['GET'])
def get_prompts():
    """Fetch all system prompts with their ObjectId."""
    prompts = list(system_prompts_collection.find({}, {"_id": 1, "content": 1}))
    for prompt in prompts:
        prompt["_id"] = str(prompt["_id"])  
    return jsonify({"prompts": prompts})


@app.route('/prompts', methods=['POST'])
def add_prompt():
    """Add a new system prompt."""
    new_prompt = request.json.get('content')
    if not new_prompt:
        return jsonify({"error": "Prompt content is required."}), 400

    result = system_prompts_collection.insert_one({"content": new_prompt})
    prompt = {"_id": str(result.inserted_id), "content": new_prompt}

    return jsonify({"message": "Prompt added.", "prompt": prompt})


@app.route('/prompts/<string:prompt_id>', methods=['PUT'])
def edit_prompt(prompt_id):
    """Edit an existing system prompt."""
    updated_content = request.json.get('content')
    if not updated_content:
        return jsonify({"error": "Updated content is required."}), 400

    try:
        result = system_prompts_collection.update_one(
            {"_id": ObjectId(prompt_id)},
            {"$set": {"content": updated_content}}
        )
        if result.matched_count == 0:
            return jsonify({"error": "Prompt not found."}), 404

        return jsonify({"message": "Prompt updated.", "id": prompt_id, "content": updated_content})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/prompts/<string:prompt_id>', methods=['DELETE'])
def delete_prompt(prompt_id):
    """Delete a system prompt."""
    try:
        result = system_prompts_collection.delete_one({"_id": ObjectId(prompt_id)})
        if result.deleted_count == 0:
            return jsonify({"error": "Prompt not found."}), 404

        return jsonify({"message": "Prompt deleted.", "id": prompt_id})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def generate_responses(user_input, system_prompts, num_responses=3):
    """Generate responses using system prompts and user input."""
    messages = [
        {"role": "system", "content": " ".join(system_prompts)},
        {"role": "user", "content": user_input}
    ]

    responses = []
    for _ in range(num_responses):
        completion = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=messages,
            temperature=0.2,
            max_tokens=100,
            top_p=1,
            stream=False
        )
        response_content = completion.choices[0].message.content
        responses.append(response_content)
    return responses


@app.route('/start', methods=['POST'])
def start_conversation():
    """Start a conversation by generating responses."""
    user_input = request.json.get('user_input')
    if not user_input:
        return jsonify({"error": "user_input is required."}), 400

    system_prompts = [
        prompt["content"] for prompt in system_prompts_collection.find({}, {"_id": 0, "content": 1})
    ]

    responses = generate_responses(user_input, system_prompts)
    conversation_entry = {
        "user_input": user_input,
        "system_prompts": system_prompts,
        "response_options": responses,
        "chosen_response": None
    }
    conversation_log.append(conversation_entry)

    return jsonify({"responses": responses, "message": "Responses generated."})


@app.route('/select', methods=['POST'])
def select_response():
    """Select a response from the generated options."""
    selected_index = request.json.get('selected_index')
    if selected_index is None:
        return jsonify({"error": "selected_index is required."}), 400

    if not conversation_log or "response_options" not in conversation_log[-1]:
        return jsonify({"error": "No responses available to select from."}), 400

    try:
        selected_response = conversation_log[-1]["response_options"][selected_index]
        conversation_log[-1]["chosen_response"] = selected_response
        return jsonify({"message": "Response selected.", "chosen_response": selected_response})
    except IndexError:
        return jsonify({"error": "Invalid selected_index."}), 400


@app.route('/stop', methods=['POST'])
def stop_conversation():
    """Stop the conversation and save it to MongoDB."""
    global conversation_log
    mongo_result = conversations_collection.insert_one({"conversation": conversation_log})
    conversation_log = []
    return jsonify({
        "message": "Conversation ended and saved to MongoDB as JSON.",
        "mongo_id": str(mongo_result.inserted_id)
    })


@app.route('/continue', methods=['POST'])
def continue_conversation():
    """Continue the conversation."""
    return jsonify({"message": "Conversation ongoing. You can send more user input."})


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))  # Use the PORT provided by Render, default to 5000 locally
    app.run(host="0.0.0.0", port=port)