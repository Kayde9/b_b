# Excel Upload Guide for Admin Scoring

## Quick Import Players Feature

Instead of manually adding each player one by one, you can now upload an Excel file with all players at once!

## How to Use:

### Step 1: Download the Template
1. Go to the Admin Scoring page: `http://localhost:3000/admin-scoring`
2. Login with password: `nmims2025`
3. Click "Download Sample Template" link
4. This will download a CSV file with the correct format

### Step 2: Prepare Your Excel File

Your Excel file should have these columns:
- **Name**: Player's full name
- **Jersey**: Jersey number (e.g., 10, 12, 15)
- **Team**: Either "A" or "B"

#### Example Format:

| Name          | Jersey | Team |
|---------------|--------|------|
| Rajesh Kumar  | 10     | A    |
| Amit Sharma   | 12     | A    |
| Mohammed Ali  | 10     | B    |
| Ravi Krishnan | 12     | B    |

### Step 3: Upload the File
1. Click the "Upload Excel File" button
2. Select your Excel file (.xlsx, .xls, or .csv)
3. All players will be imported automatically!
4. You'll see a notification showing how many players were added

## Supported File Formats:
- ✅ Excel (.xlsx)
- ✅ Excel 97-2003 (.xls)
- ✅ CSV (.csv)

## Column Name Variations:
The system is flexible and accepts these column names:
- **Name**: Name, name, PlayerName, Player Name
- **Jersey**: Jersey, jersey, Number, number
- **Team**: Team, team

## Tips:
- Make sure Team column only contains "A" or "B"
- Jersey numbers should be unique within each team
- Empty rows will be skipped automatically
- You can upload multiple times to add more players

## Sample Data Included:
The template includes 10 players for Team A and 10 players for Team B as examples.

## Troubleshooting:
- **"No valid players found"**: Check that your columns are named correctly
- **"Failed to import"**: Make sure the file is a valid Excel/CSV file
- **Players not showing**: Refresh the page and try again

---

**This feature saves you from manually entering 20+ players! 🎉**
