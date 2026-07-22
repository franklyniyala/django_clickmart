from django.test import TestCase
from rest_framework.test import APIClient

from .models import Product


class ProductAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.product = Product.objects.create(
            name="Test Product",
            description="Test product description",
            price="100.00",
            stock=10,
            tax_percent="5.00",
            is_active=True,
        )

    def test_product_list(self):
        response = self.client.get("/api/v1/products/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name"], "Test Product")

    def test_product_detail(self):
        response = self.client.get(
            f"/api/v1/products/{self.product.id}/"
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["name"], "Test Product")

    def test_inactive_product_not_in_list(self):
        self.product.is_active = False
        self.product.save()

        response = self.client.get("/api/v1/products/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 0)
