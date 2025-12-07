from flask import Flask, jsonify, request
from accountController import AccountController
from database import database
from fileController import FileController
from storageController import StorageController
from flask_cors import CORS

app = Flask(__name__)
CORS(app, supports_credentials=True)
app.secret_key = "test_secret_key"  # for session

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://neondb_owner:npg_vl1pNH6tBbwg@ep-billowing-lab-a1dgv6cr-pooler' \
                                        '.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
database.init_app(app)


# just testing (remember to remove before production)
@app.route('/API/account/getAccounts/<int:page>', methods=['GET'])
def get_accounts(page):
    accounts = AccountController.get_accounts(page)
    return jsonify(accounts)


@app.route("/API/storage/login/<string:name>")
def login(name):
    return StorageController.login(name)


@app.route("/API/storage/oauth2callback")
def oauth2callback():
    return StorageController.oauth_callback()


@app.route("/API/file/upload", methods=["POST"])
def upload_file():
    return FileController.upload_file()


@app.route("/API/file/download", methods=["POST"])
def download():
    data = request.get_json()
    file_id = data.get("file_id")
    if not file_id:
        return jsonify({"error": "missing file_id"}), 400
    return FileController.download_and_decrypt(file_id)


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)
