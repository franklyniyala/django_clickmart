from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from products.models import Product
from .models import Cart, CartItem


User = get_user_model()


class CartAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.user = User.objects.create_user(
            username="cartuser",
            email="cartuser@example.com",
            password="TestPassword123!",
        )

        self.product = Product.objects.create(
            name="Cart Product",
            price="100.00",
            stock=10,
            tax_percent="5.00",
            is_active=True,
        )

        self.client.force_authenticate(user=self.user)

    def test_get_cart(self):
        response = self.client.get("/api/v1/cart/")

        self.assertEqual(response.status_code, 200)
        self.assertTrue(
            Cart.objects.filter(user=self.user).exists()
        )

    def test_add_product_to_cart(self):
        response = self.client.post(
            "/api/v1/cart/add/",
            {
                "product_id": self.product.id,
                "quantity": 2,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertTrue(
            CartItem.objects.filter(
                cart__user=self.user,
                product=self.product,
            ).exists()
        )

    def test_add_product_requires_product_id(self):
        response = self.client.post(
            "/api/v1/cart/add/",
            {},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.data["error"],
            "product_id is required",
        )

    def test_update_cart_item(self):
        cart = Cart.objects.create(user=self.user)

        item = CartItem.objects.create(
            cart=cart,
            product=self.product,
            quantity=1,
        )

        response = self.client.patch(
            f"/api/v1/cart/items/{item.id}/",
            {"change": 1},
            format="json",
        )

        self.assertEqual(response.status_code, 200)

        item.refresh_from_db()

        self.assertEqual(item.quantity, 2)

    def test_delete_cart_item(self):
        cart = Cart.objects.create(user=self.user)

        item = CartItem.objects.create(
            cart=cart,
            product=self.product,
            quantity=1,
        )

        response = self.client.delete(
            f"/api/v1/cart/items/{item.id}/"
        )

        self.assertEqual(response.status_code, 204)

        self.assertFalse(
            CartItem.objects.filter(id=item.id).exists()
        )
