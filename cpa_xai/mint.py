"""High-level: mint CPA xai-*.json for one free registered account."""

from __future__ import annotations

from pathlib import Path
from typing import Any, Callable

from .browser_confirm import mint_with_browser
from .probe import probe_mini_response, probe_models
from .proxyutil import proxy_log_label, resolve_proxy, set_runtime_proxy
from .schema import DEFAULT_BASE_URL, build_cpa_xai_auth
from .writer import write_cpa_xai_auth

LogFn = Callable[[str], None]


def _noop(_: str) -> None:
    return None


def mint_and_export(
    *,
    email: str,
    password: str,
    auth_dir: str | Path,
    page: Any | None = None,
    proxy: str | None = None,
    headless: bool = False,
    base_url: str = DEFAULT_BASE_URL,
    headers: dict[str, str] | None = None,
    probe: bool = True,
    probe_chat: bool = False,
    browser_timeout_sec: float = 240.0,
    force_standalone: bool = False,
    cookies: Any | None = None,
    reuse_browser: bool = True,
    recycle_every: int = 15,
    log: LogFn | None = None,
    cancel: Callable[[], bool] | None = None,
) -> dict[str, Any]:
    """Full pipeline: device-auth → write CPA file → optional probe.

    Returns dict with keys: ok, path, email, probe, error?
    """
    import time

    log = log or _noop
    email = (email or "").strip()
    if not email or not password:
        return {"ok": False, "email": email, "error": "missing email/password"}

    # Config/explicit proxy wins over shell https_proxy (common 7890 trap).
    # Thread-local pin — safe under concurrent mint workers.
    resolved = resolve_proxy(proxy)
    set_runtime_proxy(resolved or None)
    log(f"mint start: {email} proxy={proxy_log_label(resolved) or '(none)'}")
    tokens = None
    max_auth_attempts = 2
    for auth_attempt in range(1, max_auth_attempts + 1):
        try:
            tokens = mint_with_browser(
                email=email,
                password=password,
                page=page,
                proxy=resolved or None,
                headless=headless,
                browser_timeout_sec=browser_timeout_sec,
                force_standalone=force_standalone,
                cookies=cookies,
                reuse_browser=reuse_browser,
                recycle_every=recycle_every,
                poll_log=log,
                cancel=cancel,
            )
            break
        except Exception as e:  # noqa: BLE001
            error_text = str(e)
            error_lower = error_text.lower()
            retryable_denied = (
                "invalid_grant" in error_lower and "access denied" in error_lower
            )
            if not retryable_denied or auth_attempt >= max_auth_attempts:
                if retryable_denied:
                    error_text = (
                        "xAI 已完成网页授权，但拒绝为该账号发放 Grok Build 令牌。"
                        "通常是账号或邮箱域名未获准入，请更换 defaultDomains 后重新注册；"
                        f"原始错误: {error_text}"
                    )
                log(f"mint failed: {error_text}")
                return {"ok": False, "email": email, "error": error_text}
            wait_seconds = 3 * auth_attempt
            log(
                "设备授权码被服务端拒绝，将申请新设备码重试 "
                f"({auth_attempt + 1}/{max_auth_attempts})，等待 {wait_seconds}s"
            )
            time.sleep(wait_seconds)

    if tokens is None:
        error_text = "设备授权未返回令牌"
        log(f"mint failed: {error_text}")
        return {"ok": False, "email": email, "error": error_text}

    payload = build_cpa_xai_auth(
        email=email,
        access_token=tokens["access_token"],
        refresh_token=tokens["refresh_token"],
        id_token=tokens.get("id_token"),
        expires_in=tokens.get("expires_in"),
        base_url=base_url,
        headers=headers,
    )
    path = write_cpa_xai_auth(auth_dir, payload)
    log(f"wrote {path}")

    result: dict[str, Any] = {
        "ok": True,
        "email": email,
        "path": str(path),
        "user_code": tokens.get("user_code"),
        "base_url": base_url,
        "proxy": proxy_log_label(resolved),
    }

    if probe:
        pr = probe_models(tokens["access_token"], base_url=base_url, proxy=resolved or None)
        result["probe_models"] = pr
        log(f"probe models: ok={pr.get('ok')} has_grok_45={pr.get('has_grok_45')} ids={pr.get('model_ids')}")
        if not pr.get("has_grok_45"):
            result["ok"] = False
            result["error"] = "token ok but grok-4.5 not listed"
        if probe_chat and pr.get("has_grok_45"):
            ch = probe_mini_response(
                tokens["access_token"], base_url=base_url, proxy=resolved or None
            )
            result["probe_chat"] = ch
            log(f"probe chat: ok={ch.get('ok')} model={ch.get('model')} text={ch.get('text')!r}")
            if not ch.get("ok"):
                result["ok"] = False
                result["error"] = f"chat probe failed: {ch.get('error') or ch.get('status')}"
    return result
