import unittest
from pathlib import Path
from unittest.mock import patch

from cpa_xai.mint import mint_and_export


class CpaMintRetryTests(unittest.TestCase):
    def test_invalid_grant_access_denied_会使用新设备码重试(self):
        logs = []
        token_result = {
            "access_token": "access-token",
            "refresh_token": "refresh-token",
            "id_token": None,
            "expires_in": 3600,
            "user_code": "NEW-CODE",
        }

        with patch(
            "cpa_xai.mint.mint_with_browser",
            side_effect=[
                RuntimeError("device auth token error: invalid_grant: Access denied"),
                token_result,
            ],
        ) as mint_mock, patch("time.sleep") as sleep_mock, patch(
            "cpa_xai.mint.build_cpa_xai_auth", return_value={}
        ), patch(
            "cpa_xai.mint.write_cpa_xai_auth", return_value=Path("xai-test.json")
        ):
            result = mint_and_export(
                email="test@example.com",
                password="password",
                auth_dir="unused",
                probe=False,
                log=logs.append,
            )

        self.assertTrue(result["ok"])
        self.assertEqual(mint_mock.call_count, 2)
        sleep_mock.assert_called_once_with(3)
        self.assertTrue(any("申请新设备码重试" in item for item in logs))

    def test_其它授权错误不会重试(self):
        with patch(
            "cpa_xai.mint.mint_with_browser",
            side_effect=RuntimeError("turnstile timeout"),
        ) as mint_mock:
            result = mint_and_export(
                email="test@example.com",
                password="password",
                auth_dir="unused",
                probe=False,
            )

        self.assertFalse(result["ok"])
        self.assertEqual(result["error"], "turnstile timeout")
        self.assertEqual(mint_mock.call_count, 1)


if __name__ == "__main__":
    unittest.main()
