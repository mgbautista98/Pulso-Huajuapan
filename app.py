from __future__ import annotations

import csv
import io
import json
import sqlite3
from pathlib import Path

from flask import Flask, Response, jsonify, render_template, request

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
DATABASE = DATA_DIR / "pulso_huajuapan.db"

app = Flask(__name__)

FIELDS = (
    "name", "category", "address", "neighborhood", "latitude", "longitude",
    "phone", "schedule", "price_range", "responsible", "source",
    "verified_at", "notes", "needs",
)


def db() -> sqlite3.Connection:
    DATA_DIR.mkdir(exist_ok=True)
    connection = sqlite3.connect(DATABASE)
    connection.row_factory = sqlite3.Row
    return connection


def init_db() -> None:
    with db() as connection:
        connection.execute("""
            CREATE TABLE IF NOT EXISTS businesses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                category TEXT NOT NULL DEFAULT '',
                address TEXT NOT NULL DEFAULT '',
                neighborhood TEXT NOT NULL DEFAULT '',
                latitude REAL,
                longitude REAL,
                phone TEXT NOT NULL DEFAULT '',
                schedule TEXT NOT NULL DEFAULT '',
                price_range TEXT NOT NULL DEFAULT '',
                responsible TEXT NOT NULL DEFAULT '',
                source TEXT NOT NULL DEFAULT 'Captura propia',
                verified_at TEXT NOT NULL DEFAULT '',
                notes TEXT NOT NULL DEFAULT '',
                needs TEXT NOT NULL DEFAULT '[]',
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        """)


def normalize(payload: dict) -> dict:
    item = {field: payload.get(field, "") for field in FIELDS}
    item["name"] = str(item["name"]).strip()
    item["category"] = str(item["category"]).strip()
    if not item["name"]:
        raise ValueError("El nombre es obligatorio")
    for coordinate in ("latitude", "longitude"):
        value = item[coordinate]
        item[coordinate] = float(value) if value not in (None, "") else None
    needs = item["needs"]
    if isinstance(needs, str):
        needs = [value.strip() for value in needs.split(",") if value.strip()]
    item["needs"] = json.dumps(needs, ensure_ascii=False)
    return item


def serialize(row: sqlite3.Row) -> dict:
    item = dict(row)
    try:
        item["needs"] = json.loads(item.get("needs") or "[]")
    except json.JSONDecodeError:
        item["needs"] = []
    return item


@app.get("/")
def index():
    return render_template("app.html")


@app.get("/api/businesses")
def list_businesses():
    with db() as connection:
        rows = connection.execute("SELECT * FROM businesses ORDER BY updated_at DESC, name").fetchall()
    return jsonify([serialize(row) for row in rows])


@app.post("/api/businesses")
def create_business():
    try:
        item = normalize(request.get_json(force=True))
    except (ValueError, TypeError) as error:
        return jsonify({"error": str(error)}), 400
    columns = ", ".join(FIELDS)
    placeholders = ", ".join("?" for _ in FIELDS)
    with db() as connection:
        cursor = connection.execute(
            f"INSERT INTO businesses ({columns}) VALUES ({placeholders})",
            [item[field] for field in FIELDS],
        )
        row = connection.execute("SELECT * FROM businesses WHERE id = ?", (cursor.lastrowid,)).fetchone()
    return jsonify(serialize(row)), 201


@app.put("/api/businesses/<int:business_id>")
def update_business(business_id: int):
    try:
        item = normalize(request.get_json(force=True))
    except (ValueError, TypeError) as error:
        return jsonify({"error": str(error)}), 400
    assignments = ", ".join(f"{field} = ?" for field in FIELDS)
    with db() as connection:
        cursor = connection.execute(
            f"UPDATE businesses SET {assignments}, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            [item[field] for field in FIELDS] + [business_id],
        )
        if not cursor.rowcount:
            return jsonify({"error": "Negocio no encontrado"}), 404
        row = connection.execute("SELECT * FROM businesses WHERE id = ?", (business_id,)).fetchone()
    return jsonify(serialize(row))


@app.delete("/api/businesses/<int:business_id>")
def delete_business(business_id: int):
    with db() as connection:
        cursor = connection.execute("DELETE FROM businesses WHERE id = ?", (business_id,))
    return ("", 204) if cursor.rowcount else (jsonify({"error": "Negocio no encontrado"}), 404)


@app.post("/api/import")
def import_csv():
    uploaded = request.files.get("file")
    if not uploaded:
        return jsonify({"error": "Selecciona un archivo CSV"}), 400
    try:
        text = uploaded.stream.read().decode("utf-8-sig")
        rows = list(csv.DictReader(io.StringIO(text)))
        items = [normalize(row) for row in rows]
    except (UnicodeDecodeError, ValueError, TypeError) as error:
        return jsonify({"error": f"CSV inválido: {error}"}), 400
    columns = ", ".join(FIELDS)
    placeholders = ", ".join("?" for _ in FIELDS)
    with db() as connection:
        connection.executemany(
            f"INSERT INTO businesses ({columns}) VALUES ({placeholders})",
            [[item[field] for field in FIELDS] for item in items],
        )
    return jsonify({"imported": len(items)})


@app.get("/api/export")
def export_csv():
    with db() as connection:
        rows = connection.execute(f"SELECT {', '.join(FIELDS)} FROM businesses ORDER BY name").fetchall()
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=FIELDS)
    writer.writeheader()
    for row in rows:
        item = dict(row)
        try:
            item["needs"] = ",".join(json.loads(item["needs"] or "[]"))
        except json.JSONDecodeError:
            pass
        writer.writerow(item)
    return Response(
        "\ufeff" + output.getvalue(),
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment; filename=negocios_huajuapan.csv"},
    )


init_db()

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
