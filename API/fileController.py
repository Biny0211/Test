import json
import struct
from flask import request, jsonify, send_file
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload
from googleapiclient.http import MediaIoBaseDownload
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from zfec.easyfec import Encoder, Decoder
from io import BytesIO
import os
from storageController import StorageController
from files import File
from file_shards import FileShard
from file_keys import FileKey
from database import database
from Crypto.Protocol.SecretSharing import Shamir
from Crypto.Random import get_random_bytes


class FileController:

    @staticmethod
    def upload_google(dest_storage_id, shard, file, i, dest_folder, is_key=False):
        creds = StorageController.get_google_creds(dest_storage_id)
        if not creds:
            raise Exception("Google Drive credentials missing or expired")
        drive = build("drive", "v3", credentials=creds)

        if is_key:
            name = f"{file.filename}.key{i}"
        else:
            name = f"{file.filename}.shard{i}"

        media = MediaIoBaseUpload(BytesIO(shard), mimetype="application/octet-stream")
        metadata = {
            "name": name,
            "parents": [dest_folder]
        }

        uploaded = drive.files().create(
            body=metadata, media_body=media, fields="id"
        ).execute()

        return uploaded["id"]

    @staticmethod
    def download_google(storage_id, file_id):
        creds = StorageController.get_google_creds(storage_id)
        if not creds:
            raise Exception("Google Drive credentials missing or expired")

        drive = build("drive", "v3", credentials=creds)
        download_request = drive.files().get_media(fileId=file_id)

        buffer = BytesIO()
        downloader = MediaIoBaseDownload(buffer, download_request)
        done = False
        while not done:
            _, done = downloader.next_chunk()

        return buffer.getvalue()

    @staticmethod
    def encrypt(original_bytes):
        key = AESGCM.generate_key(bit_length=256)
        aes = AESGCM(key)
        nonce = os.urandom(12)
        ciphertext = aes.encrypt(nonce, original_bytes, None)
        encrypted_data = nonce + ciphertext

        return key, encrypted_data

    @staticmethod
    def upload_item(dest, new_file, data, file, index, is_key=False):
        dest_folder = dest["folder_id"]
        dest_storage_id = dest["storage_id"]
        dest_type = dest["type"]

        # Upload depending on storage type
        if dest_type == "google":
            try:
                file_id = FileController.upload_google(
                    dest_storage_id,
                    data,
                    file,
                    index,
                    dest_folder,
                    is_key=is_key
                )
            except Exception as e:
                raise Exception(f"Google upload failed: {str(e)}")

        elif dest_type == "dropbox":
            raise Exception("Dropbox upload not implemented yet")

        else:
            raise Exception(f"Invalid storage type: {dest_type}")

        if is_key:
            return FileKey(
                file_id=new_file.file_id,
                storage_id=dest_storage_id,
                key_file_id=file_id
            )
        else:
            return FileShard(
                file_id=new_file.file_id,
                shard_index=index,
                storage_id=dest_storage_id,
                shard_file_id=file_id,
                folder_id=dest_folder,
                shard_size=len(data)
            )

    @staticmethod
    def upload_file():
        file = request.files.get("file")
        if not file:
            return jsonify({"error": "No file uploaded"}), 400

        # Parse user-specified config
        try:
            n = int(request.form.get("n"))  # reed solomon shards
            k = int(request.form.get("k"))  # minimum of reed solomon shards
            m = int(request.form.get("m"))  # shamir secret shares
            t = int(request.form.get("t"))  # minimum of shamir secret shares

            fragment_destinations = json.loads(request.form.get("fragment_destinations"))
            key_destinations = json.loads(request.form.get("key_destinations"))
        except Exception as e:
            return jsonify({"error": f"Invalid shard destination configuration: {str(e)}"}), 400

        # Validate lengths
        if len(fragment_destinations) != n:
            return jsonify({
                "error": f"fragment_destinations length must be {n}, got {len(fragment_destinations)}"
            }), 400

        if len(key_destinations) != m:
            return jsonify({
                "error": f"fragment_destinations length must be {m}, got {len(key_destinations)}"
            }), 400

        account_id = request.form.get("account_id")
        group_id = request.form.get("group_id")

        # AES-GCM encryption
        original_bytes = file.read()
        key, encrypted_data = FileController.encrypt(original_bytes)

        original_length = len(original_bytes)
        encrypted_with_length = struct.pack(">I", original_length) + encrypted_data

        # create file row
        new_file = File(
            filename=file.filename,
            group_id=group_id,
            account_id=account_id,
            shard_count=n,
            required_shards=k,
            original_length=original_length,
            key_threshold=t
        )

        database.session.add(new_file)
        database.session.flush()

        # zfec reed solomon encoding
        encoder = Encoder(k, n)
        shards = encoder.encode(encrypted_with_length)

        shard_records = []

        # upload each shards
        for i, shard in enumerate(shards):
            dest = fragment_destinations[i]
            try:
                row = FileController.upload_item(dest, new_file, shard, file, i)
            except Exception as e:
                database.session.rollback()
                return jsonify({"error": f"Failed to upload shard {i}: {str(e)}"}), 500
            database.session.add(row)
            shard_records.append(row)

        # Split AES key using shamir
        try:
            if len(key) != 32:
                raise ValueError(f"AES key should be 32 bytes, got {len(key)} bytes")

            # Split key into two 16-byte parts
            key_part1 = key[:16]
            key_part2 = key[16:]

            # Split each part into shares
            shares1 = Shamir.split(t, m, key_part1)
            shares2 = Shamir.split(t, m, key_part2)

            # Combine shares from both parts
            shares = []
            for i in range(m):
                idx1, share1 = shares1[i]
                idx2, share2 = shares2[i]

                # Verify indices matches
                if idx1 != idx2:
                    raise ValueError(f"Share index mismatch: {idx1} != {idx2}")

                # Combine both shares into one
                combined_share = share1 + share2  # 16 + 16 = 32 bytes
                shares.append((idx1, combined_share))
        except Exception as e:
            database.session.rollback()
            return jsonify({"error": f"Failed to split key into shares: {str(e)}"}), 500

        key_rows = []
        try:
            for i, (share_index, share_bytes) in enumerate(shares):
                dest = key_destinations[i]
                share_with_index = struct.pack('B', share_index) + share_bytes
                row = FileController.upload_item(dest, new_file, share_with_index, file, i, is_key=True)
                database.session.add(row)
                key_rows.append(row)
        except Exception as e:
            database.session.rollback()
            return jsonify({"error": f"Failed to upload key shares: {str(e)}"}), 500

        # commit all additions to database
        database.session.commit()

        return jsonify({
            "message": "Upload successful",
            "file_id": str(new_file.file_id),
            "shards": [
                {
                    "index": s.shard_index,
                    "shard_file_id": s.shard_file_id,
                    "folder_id": s.folder_id,
                    "storage_id": s.storage_id
                } for s in shard_records
            ],
            "key_shares": [
                {
                    "share_index": idx,
                    "key_file_id": kr.key_file_id,
                    "storage_id": kr.storage_id
                } for idx, kr in enumerate(key_rows)
            ]
        })

    @staticmethod
    def download_file_from_storage(storage_id, file_id):
        storage = StorageController.get_storage_info(storage_id)
        if storage.storage_type == 'google_drive':
            return FileController.download_google(storage_id, file_id)
        elif storage.storage_type == 'dropbox':
            raise ValueError(f"dropbox not implemented yet")
            # return FileController.download_dropbox(storage_id, file_id)
        else:
            raise ValueError(f"Unsupported storage type: {storage.storage_type}")

    @staticmethod
    def download_and_decrypt(file_id):
        """Download shards + key from Drive, reconstruct, decrypt, return file."""

        # look at db record for file, file shards, and key
        file_row = File.query.filter_by(file_id=file_id).first()
        if not file_row:
            return jsonify({"error": "File not found"}), 404

        shard_rows = FileShard.query.filter_by(file_id=file_id).order_by(FileShard.shard_index).all()
        if not shard_rows:
            return jsonify({"error": "No shards found"}), 404

        key_share_rows = FileKey.query.filter_by(file_id=file_id).all()
        if not key_share_rows:
            return jsonify({"error": "No key shares found"}), 404

        # determine threshold
        key_threshold = getattr(file_row, "key_threshold", len(key_share_rows))
        if key_threshold > len(key_share_rows):
            return jsonify({"error": "Not enough key shares stored to meet the threshold"}), 500

        # download key shares until threshold is reached
        key_shares = []
        for kr in key_share_rows:
            try:
                raw = FileController.download_file_from_storage(kr.storage_id, kr.key_file_id)
                if not raw or len(raw) < 2:  # At least 1 byte for index + some data
                    continue

                # Extract index and share from the stored format
                share_index = struct.unpack('B', raw[:1])[0]
                share_bytes = raw[1:]

                key_shares.append((share_index, share_bytes))

                if len(key_shares) >= key_threshold:
                    break
            except Exception as e:
                print(f"Failed to download/parse key share {kr.key_file_id}: {e}")
                continue

        if len(key_shares) < key_threshold:
            return jsonify({
                "error": f"Could not download enough key shares. Need {key_threshold}, got {len(key_shares)}"
            }), 500

        # reconstruct key from shares
        try:
            shares_part1 = []
            shares_part2 = []

            for share_index, combined_share in key_shares:
                if len(combined_share) != 32:
                    raise ValueError(f"Combined share should be 32 bytes, got {len(combined_share)}")

                share_part1 = combined_share[:16]
                share_part2 = combined_share[16:]

                shares_part1.append((share_index, share_part1))
                shares_part2.append((share_index, share_part2))

            # Reconstruct each part
            key_part1 = Shamir.combine(shares_part1[:key_threshold])
            key_part2 = Shamir.combine(shares_part2[:key_threshold])

            # Combine back into 32-byte key
            key_bytes = key_part1 + key_part2
        except Exception as e:
            return jsonify({"error": f"Failed to reconstruct AES key from shares: {str(e)}"}), 500

        # download shards
        downloaded_shards = []
        shard_indices = []
        for s in shard_rows:
            try:
                data = FileController.download_file_from_storage(s.storage_id, s.shard_file_id)
                if not data:
                    continue
                downloaded_shards.append(data)
                shard_indices.append(s.shard_index)
            except Exception as e:
                print(f"Error downloading shard {s.shard_index}: {str(e)}")
                # Continue with other shards

        k = file_row.required_shards
        if len(downloaded_shards) < k:
            return jsonify({"error": f"Not enough shards. Need {k}, got {len(downloaded_shards)}"}), 400

        # reconstruct with zfec
        try:
            n = file_row.shard_count
            decoder = Decoder(k, n)
            shards_to_use = downloaded_shards[:k]
            indices_to_use = shard_indices[:k]
            shard_size = max(len(s) for s in shards_to_use)
            normalized_shards = [s.ljust(shard_size, b"\x00") for s in shards_to_use]
            reconstructed = decoder.decode(normalized_shards, indices_to_use, 0)
            if not reconstructed or len(reconstructed) < 16:
                return jsonify({"error": "Reconstructed data incomplete"}), 500
        except Exception as e:
            return jsonify({"error": f"Failed to reconstruct data: {str(e)}"}), 500

        # decrypt using reconstructed key_bytes
        try:
            original_length = struct.unpack(">I", reconstructed[:4])[0]
            encrypted_data = reconstructed[4:]
            nonce = encrypted_data[:12]
            ciphertext = encrypted_data[12:]
            aes = AESGCM(key_bytes)
            decrypted = aes.decrypt(nonce, ciphertext, None)
            if len(decrypted) > original_length:
                decrypted = decrypted[:original_length]
        except Exception as e:
            return jsonify({"error": f"Decryption failed: {str(e)}"}), 500

        return send_file(BytesIO(decrypted),
                         mimetype="application/octet-stream",
                         as_attachment=True,
                         download_name=file_row.filename)
