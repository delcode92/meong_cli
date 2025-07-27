"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeCommand = executeCommand;
const child_process_1 = require("child_process");
function executeCommand(command) {
    return new Promise((resolve) => {
        (0, child_process_1.exec)(command, (error, stdout, stderr) => {
            resolve({ error, stdout, stderr });
        });
    });
}
//# sourceMappingURL=executor.js.map