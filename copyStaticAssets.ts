import * as shell from "shelljs";

// Assets that aren't bundled by webpack by default can be added here
// shell.cp("-R", "src/api/views/", "dist/api/views/");
shell.cp("-R", "src/public", "dist/public");
