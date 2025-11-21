function debugOnEdit() {
    const fakeEvent: any = {
        source: SpreadsheetApp.getActiveSpreadsheet(),
        range: SpreadsheetApp.getActiveSpreadsheet().getSheetByName("PUNISHMENTS")?.getRange("F12"),
        oldValue: "old",
        value: "test value",
    };

    onEdit(fakeEvent);
}

function onEdit(e: GoogleAppsScript.Events.SheetsOnEdit): void {
    const username = getEnlistedRankLockedUsername(e);
    if (!username) return;

    highlightInEnlistedSheet(e.source, username);
}

function getEnlistedRankLockedUsername(e: GoogleAppsScript.Events.SheetsOnEdit): string | undefined {
    const range = e.range;
    const sheet = range.getSheet();

    // Only run on the 'PUNISHMENTS' sheet
    if (sheet.getName() !== "PUNISHMENTS") return;

    // Only single-cell edits
    if (range.getNumRows() !== 1 || range.getNumColumns() !== 1) return;

    const row = range.getRow();
    const column = range.getColumn();

    // Only care about edits in columns C-F
    if (column < 3 || column > 6) return;

    // Only tirgger if column E is set to 'Enlisted'
    const rank = sheet.getRange(`E${row}`).getValue() as string;
    if (rank !== "Enlisted") return;

    // And column F is set to 'RANK LOCK'
    const punishment = sheet.getRange(`F${row}`).getValue() as string;
    if (punishment !== "RANK LOCK") return;

    // Get the username
    const username = sheet.getRange(`C${row}`).getValue() as string;

    console.log(`${rank} ${username} has ${punishment}`);

    return username;
}

function highlightInEnlistedSheet(source: GoogleAppsScript.Spreadsheet.Spreadsheet, username: string): void {
    const enlistedSheet = source.getSheetByName("ENLISTED");
    if (!enlistedSheet) return console.error(`Failed to get 'ENLISTED' sheet`);

    const searchRange = enlistedSheet.getRange("C:C");
    const textFinder = searchRange.createTextFinder(username).matchCase(false).matchEntireCell(true);

    const usernameCell = textFinder.findNext();
    if (!usernameCell) return console.log(`Username '${username}' not found in 'ENLISTED' sheet`);

    const row = usernameCell.getRow();

    const highlightRow = enlistedSheet.getRange(`C${row}:E${row}`);
    highlightRow.setBackground("#fff2cc");

    console.log(`Highlighted row ${row} for username: ${usernameCell.getValue()}`);
}
