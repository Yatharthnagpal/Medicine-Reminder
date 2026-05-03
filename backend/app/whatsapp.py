"""Send WhatsApp messages via Meta WhatsApp Cloud API."""
import logging
import os
from typing import Optional, Tuple

import httpx

logger = logging.getLogger(__name__)


def _digits_only(value: str) -> str:
    return "".join(c for c in (value or "") if c.isdigit())


def get_admin_whatsapp_to() -> str:
    """Recipient for reminder alerts (E.164 digits, no +). Default: India 91 + admin number."""
    raw = os.getenv("ADMIN_WHATSAPP_NUMBER", "919352740939")
    return _digits_only(raw) or "919352740939"


def send_admin_reminder_alert(
    name: str,
    phone: str,
    message: str,
    when_iso: str,
    repeat_type: str,
    medicine: Optional[str] = None,
) -> Tuple[bool, Optional[str]]:
    """
    Notify admin that a reminder is due. Does not message the contact's phone.
    Returns (success, error_detail).
    """
    to = get_admin_whatsapp_to()
    token = (os.getenv("WHATSAPP_TOKEN") or "").strip()
    phone_number_id = (os.getenv("WHATSAPP_PHONE_NUMBER_ID") or "").strip()

    if not token or not phone_number_id:
        return False, "Missing WHATSAPP_TOKEN or WHATSAPP_PHONE_NUMBER_ID"

    lines = [
        "🔔 Reminder due",
        "",
        f"👤 {name}",
        f"📞 {phone}",
        f"💬 {message}",
    ]
    if medicine:
        lines.append(f"💊 {medicine}")
    lines.extend(["", f"🕐 {when_iso}", f"🔁 {repeat_type}"])

    body = "\n".join(lines)
    version = os.getenv("WHATSAPP_API_VERSION", "v21.0")
    url = f"https://graph.facebook.com/{version}/{phone_number_id}/messages"
    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": to,
        "type": "text",
        "text": {"preview_url": False, "body": body},
    }

    try:
        with httpx.Client(timeout=30.0) as client:
            response = client.post(
                url,
                json=payload,
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json",
                },
            )
        if response.status_code >= 400:
            detail = response.text
            logger.error("WhatsApp API error %s: %s", response.status_code, detail)
            return False, detail
        return True, None
    except Exception as exc:
        logger.exception("WhatsApp request failed")
        return False, str(exc)
