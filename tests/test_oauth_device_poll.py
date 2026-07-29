import unittest
from unittest.mock import patch

from cpa_xai.oauth_device import poll_device_token


class OAuthDevicePollTests(unittest.TestCase):
    @staticmethod
    def _token_response():
        return {
            "access_token": "access-token",
            "refresh_token": "refresh-token",
            "expires_in": 3600,
        }

    def test_等待授权时遵守服务端初始间隔(self):
        responses = [
            (
                400,
                {
                    "error": "authorization_pending",
                    "error_description": "User has not yet authorized",
                },
            ),
            (200, self._token_response()),
        ]

        with patch(
            "cpa_xai.oauth_device._post_form", side_effect=responses
        ), patch("cpa_xai.oauth_device.time.sleep") as sleep_mock:
            result = poll_device_token("device-code", interval=5, expires_in=60)

        self.assertEqual(result.access_token, "access-token")
        sleep_mock.assert_called_once_with(5)

    def test_slow_down后按增加后的间隔等待(self):
        responses = [
            (
                400,
                {
                    "error": "slow_down",
                    "error_description": "Polling too frequently",
                },
            ),
            (200, self._token_response()),
        ]

        with patch(
            "cpa_xai.oauth_device._post_form", side_effect=responses
        ), patch("cpa_xai.oauth_device.time.sleep") as sleep_mock:
            result = poll_device_token("device-code", interval=5, expires_in=60)

        self.assertEqual(result.access_token, "access-token")
        sleep_mock.assert_called_once_with(10)


if __name__ == "__main__":
    unittest.main()
