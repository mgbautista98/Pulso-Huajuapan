import tempfile
import unittest
from pathlib import Path

import app as pulso


class BusinessApiTest(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        pulso.DATABASE = Path(self.temp_dir.name) / "test.db"
        pulso.init_db()
        pulso.app.config.update(TESTING=True)
        self.client = pulso.app.test_client()

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_business_crud_and_export(self):
        created = self.client.post("/api/businesses", json={
            "name": "Negocio de prueba",
            "category": "Servicios",
            "latitude": 17.8065,
            "longitude": -97.778,
            "needs": ["digital", "accesible"],
        })
        self.assertEqual(created.status_code, 201)
        item = created.get_json()
        self.assertEqual(item["needs"], ["digital", "accesible"])

        listed = self.client.get("/api/businesses").get_json()
        self.assertEqual(len(listed), 1)

        item["name"] = "Negocio actualizado"
        updated = self.client.put(f"/api/businesses/{item['id']}", json=item)
        self.assertEqual(updated.get_json()["name"], "Negocio actualizado")

        exported = self.client.get("/api/export")
        self.assertIn("Negocio actualizado", exported.get_data(as_text=True))

        deleted = self.client.delete(f"/api/businesses/{item['id']}")
        self.assertEqual(deleted.status_code, 204)


if __name__ == "__main__":
    unittest.main()
