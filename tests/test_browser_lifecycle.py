import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import grok_register_ttk as app
from cpa_xai import browser_confirm


class FakeChromiumOptions:
    def __init__(self):
        self.headless_values = []
        self.load_modes = []
        self.tmp_path = None
        self.user_data_path = None

    def set_timeouts(self, **_kwargs):
        return self

    def set_tmp_path(self, path):
        self.tmp_path = path
        return self

    def auto_port(self):
        return self

    def set_argument(self, _argument):
        return self

    def headless(self, value):
        self.headless_values.append(value)
        return self

    def set_load_mode(self, value):
        self.load_modes.append(value)
        return self


class BrowserLifecycleTests(unittest.TestCase):
    def setUp(self):
        self.original_config = app.config.copy()

    def tearDown(self):
        app.config = self.original_config
        app._tls.browser = None
        app._tls.page = None
        app._tls.browser_profile_path = None

    def test_headless_registration_is_applied_to_browser_options(self):
        app.config = app.DEFAULT_CONFIG.copy()
        app.config["browser_headless"] = True
        fake_options = FakeChromiumOptions()

        with patch.object(app, "ChromiumOptions", return_value=fake_options), \
                patch.object(app.os, "makedirs"), \
                patch.object(app.os.path, "isfile", return_value=False):
            options = app.create_browser_options()

        self.assertIs(options, fake_options)
        self.assertEqual(fake_options.headless_values, [True])
        self.assertEqual(fake_options.load_modes, ["eager"])

    def test_browser_error_page_returns_network_diagnostic(self):
        class FakePage:
            url = "chrome-error://chromewebdata/"
            title = "无法访问此页面"
            html = "<div>net::ERR_TIMED_OUT</div>"

        detail = app._browser_error_detail(FakePage())

        self.assertIn("chrome-error://chromewebdata/", detail)
        self.assertIn("ERR_TIMED_OUT", detail)

    def test_signup_timeout_retries_without_consuming_account(self):
        class FakePage:
            url = "https://accounts.x.ai/sign-up?redirect=grok-com"

            def __init__(self):
                self.calls = []

            def get(self, url, **kwargs):
                self.calls.append((url, kwargs))
                return False

        class FakeBrowser:
            def __init__(self, page):
                self.page = page

            def get_tabs(self):
                return [self.page]

        page = FakePage()
        app._tls.page = page
        app._tls.browser = FakeBrowser(page)

        with patch.object(app, "prepare_clean_browser_session"), \
                patch.object(app, "restart_browser") as restart, \
                patch.object(app, "sleep_with_cancel"):
            with self.assertRaises(app.AccountRetryNeeded) as raised:
                app.open_signup_page()

        self.assertIn("重试当前账号", str(raised.exception))
        self.assertEqual(len(page.calls), 3)
        self.assertEqual(restart.call_count, 3)
        for url, kwargs in page.calls:
            self.assertEqual(url, app.SIGNUP_URL)
            self.assertEqual(kwargs["retry"], 0)
            self.assertEqual(kwargs["timeout"], app.SIGNUP_PAGE_LOAD_TIMEOUT)

    def test_cleanup_deletes_target_profile_and_empty_root(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            fake_module = Path(temp_dir) / "grok_register_ttk.py"
            profile = Path(temp_dir) / ".browser_profiles" / "w0_1_2_3"
            profile.mkdir(parents=True)
            (profile / "cache.tmp").write_text("cache", encoding="utf-8")

            with patch.object(app, "__file__", str(fake_module)):
                deleted = app.cleanup_browser_profiles(profile_path=str(profile))

            self.assertEqual(deleted, [str(profile)])
            self.assertFalse(profile.exists())
            self.assertFalse(profile.parent.exists())

    def test_stale_cleanup_keeps_profile_owned_by_running_process(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            fake_module = Path(temp_dir) / "grok_register_ttk.py"
            root = Path(temp_dir) / ".browser_profiles"
            stale = root / "w0_54321_1_1"
            active = root / "w1_12345_2_2"
            stale.mkdir(parents=True)
            active.mkdir()

            with patch.object(app, "__file__", str(fake_module)), \
                    patch("psutil.pid_exists", side_effect=lambda pid: pid == 12345):
                app.cleanup_browser_profiles(stale_only=True)

            self.assertFalse(stale.exists())
            self.assertTrue(active.exists())

    def test_cleanup_deletes_auto_port_profile(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            fake_module = Path(temp_dir) / "grok_register_ttk.py"
            profile = Path(temp_dir) / ".browser_profiles" / "autoPortData" / "12345"
            profile.mkdir(parents=True)
            (profile / "cache.tmp").write_text("cache", encoding="utf-8")

            with patch.object(app, "__file__", str(fake_module)):
                app.cleanup_browser_profiles(profile_path=str(profile))

            self.assertFalse(profile.exists())
            self.assertFalse(profile.parent.exists())

    def test_stop_browser_uses_recorded_profile_when_browser_path_is_empty(self):
        class FakeBrowser:
            user_data_path = None

            def quit(self, del_data=False):
                self.del_data = del_data

        browser = FakeBrowser()
        app._tls.browser = browser
        app._tls.page = object()
        app._tls.browser_profile_path = "recorded-profile"

        with patch.object(app, "cleanup_browser_profiles") as cleanup:
            app.stop_browser()

        cleanup.assert_called_once_with(profile_path="recorded-profile")
        self.assertTrue(browser.del_data)
        self.assertIsNone(app._tls.browser_profile_path)

    def test_cpa_standalone_browser_cleanup_uses_its_profile(self):
        class FakeBrowser:
            user_data_path = "cpa-profile"

            def quit(self):
                self.closed = True

        browser = FakeBrowser()

        with patch.object(app, "cleanup_browser_profiles") as cleanup:
            browser_confirm.close_standalone(browser)

        cleanup.assert_called_once_with(profile_path="cpa-profile")
        self.assertTrue(browser.closed)


if __name__ == "__main__":
    unittest.main()
