from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient


User = get_user_model()


class UserAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_user_registration(self):
        data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "TestPassword123!",
        }

        response = self.client.post(
            "/api/v1/register/",
            data,
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertTrue(
            User.objects.filter(email="test@example.com").exists()
        )

    def test_profile_requires_authentication(self):
        response = self.client.get("/api/v1/profile/")

        self.assertEqual(response.status_code, 401)

    def test_authenticated_user_can_view_profile(self):
        user = User.objects.create_user(
            username="testuser",
            email="user@example.com",
            password="TestPassword123!",
        )

        self.client.force_authenticate(user=user)

        response = self.client.get("/api/v1/profile/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["email"], "user@example.com")
