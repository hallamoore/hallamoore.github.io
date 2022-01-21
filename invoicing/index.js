const router = new Router({ ignorePrefix: "/invoicing" });
router.add("/", OpenProject);
router.add("/{spreadsheetId}", SpreadsheetPage);
router.attach();
