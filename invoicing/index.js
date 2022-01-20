const router = new Router({ ignorePrefix: "/invoicing" });
router.add("/{spreadsheetId}", SpreadsheetPage);
router.attach();
