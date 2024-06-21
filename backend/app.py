from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/logs', methods=['POST'])
def receive_logs():
    data = request.get_json()
    instruction = data['instruction']
    logs = data['logs']
    print(data) 
    return jsonify({'status': 'success', 'received': len(logs), 'task': instruction})

if __name__ == '__main__':
    app.run(debug=True, port=8000)
