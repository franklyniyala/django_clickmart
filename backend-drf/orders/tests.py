from decimal import Decimal

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase

from carts.models import Cart, CartItem
from products.models import Product
from orders.models import Order, OrderItem


User = get_user_model()


class OrderAPITestCase(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="orderuser",
            email="orderuser@example.com",
            password="TestPassword123!",
        )

        self.other_user = User.objects.create_user(
            username="otheruser",
            email="otheruser@example.com",
            password="TestPassword123!",
        )

        self.product = Product.objects.create(
            name="Test Product",
            description="Test product description",
            price=Decimal("100.00"),
            stock=10,
            tax_percent=Decimal("10.00"),
            is_active=True,
        )

        self.client.force_authenticate(user=self.user)

        self.cart = Cart.objects.create(user=self.user)

        self.cart_item = CartItem.objects.create(
            cart=self.cart,
            product=self.product,
            quantity=2,
        )

    def test_place_order_successfully(self):
        response = self.client.post(
            reverse("place_order"),
            {
                "shippingAddress": {
                    "address": "123 Test Street",
                    "phone": "08012345678",
                    "city": "Lagos",
                    "state": "Lagos",
                    "zipCode": "100001",
                }
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)

        self.assertEqual(Order.objects.count(), 1)
        self.assertEqual(OrderItem.objects.count(), 1)

        self.product.refresh_from_db()

        self.assertEqual(self.product.stock, 8)

        self.assertEqual(
            CartItem.objects.filter(cart=self.cart).count(),
            0,
        )

    def test_place_order_with_empty_cart(self):
        self.cart.items.all().delete()

        response = self.client.post(
            reverse("place_order"),
            {
                "shippingAddress": {
                    "address": "123 Test Street",
                    "phone": "08012345678",
                    "city": "Lagos",
                    "state": "Lagos",
                    "zipCode": "100001",
                }
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)

        self.assertEqual(
            response.data["error"],
            "Cart is empty",
        )

    def test_place_order_with_insufficient_stock(self):
        self.cart_item.quantity = 20
        self.cart_item.save()

        response = self.client.post(
            reverse("place_order"),
            {
                "shippingAddress": {
                    "address": "123 Test Street",
                    "phone": "08012345678",
                    "city": "Lagos",
                    "state": "Lagos",
                    "zipCode": "100001",
                }
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)

        self.assertIn("details", response.data)

    def test_authenticated_user_can_view_orders(self):
        order = Order.objects.create(
            user=self.user,
            subtotal=Decimal("200.00"),
            tax_amount=Decimal("20.00"),
            grand_total=Decimal("220.00"),
        )

        response = self.client.get(reverse("my_orders"))

        self.assertEqual(response.status_code, 200)

        self.assertEqual(len(response.data), 1)

        self.assertEqual(
            response.data[0]["id"],
            order.id,
        )

    def test_user_can_view_own_order(self):
        order = Order.objects.create(
            user=self.user,
            subtotal=Decimal("200.00"),
            tax_amount=Decimal("20.00"),
            grand_total=Decimal("220.00"),
        )

        response = self.client.get(
            reverse(
                "order_detail",
                kwargs={"pk": order.id},
            )
        )

        self.assertEqual(response.status_code, 200)

        self.assertEqual(
            response.data["id"],
            order.id,
        )

    def test_user_cannot_view_another_users_order(self):
        order = Order.objects.create(
            user=self.other_user,
            subtotal=Decimal("200.00"),
            tax_amount=Decimal("20.00"),
            grand_total=Decimal("220.00"),
        )

        response = self.client.get(
            reverse(
                "order_detail",
                kwargs={"pk": order.id},
            )
        )

        self.assertEqual(response.status_code, 404)
