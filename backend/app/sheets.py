import gspread
import logging
import os
from google.oauth2.service_account import Credentials

logger = logging.getLogger(__name__)

# The spreadsheet ID from the URL
SPREADSHEET_ID = "1diTqyMPC9rXF6V2T4D8PVsxMC_szy1DhJSDY0Qrvs7A"

# Scopes needed for Google Sheets
SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive"
]

def append_to_sheet(name: str, phone: str, medicine: str):
    """
    Appends a new row to the Google Spreadsheet with Name, Phone, and Medicine.
    Fails gracefully if credentials are not found.
    """
    creds_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "credentials.json")
    
    if not os.path.exists(creds_path):
        logger.warning("Google Sheets credentials.json not found. Skipping spreadsheet sync.")
        return False
        
    try:
        credentials = Credentials.from_service_account_file(creds_path, scopes=SCOPES)
        client = gspread.authorize(credentials)
        
        # Open the specific spreadsheet and the first sheet
        sheet = client.open_by_key(SPREADSHEET_ID).sheet1
        
        # Ensure headers exist (optional, but good practice if empty)
        # We assume headers: Name, Phone, Medicine
        
        row_data = [name, phone, medicine]
        sheet.append_row(row_data)
        logger.info(f"Successfully appended {name} to Google Sheet.")
        return True
        
    except Exception as e:
        logger.error(f"Failed to append to Google Sheet: {str(e)}")
        return False
