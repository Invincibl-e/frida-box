import * as compiler from "frida-compile"
import {getNodeSystem} from "frida-compile/dist/system/node";
import ts from "frida-compile/ext/typescript";
import fs from "fs";
import fsPath from "path";

import args from "./args";

function index() {

    // const opts = program.opts();
    // const projectRoot: string = process.cwd();
    // const entrypoint: string = program.args[0];
    // const outputPath: string = opts.output;
    //
    // const fullOutputPath = fsPath.isAbsolute(outputPath) ? outputPath : fsPath.join(projectRoot, outputPath);
    // const outputDir = fsPath.dirname(fullOutputPath);
    //
    // const system = getNodeSystem();
    // const assets = compiler.queryDefaultAssets(projectRoot, system);
    //
    // const compilerOpts: compiler.Options = {
    //     projectRoot,
    //     entrypoint,
    //     sourceMaps: opts.sourceMaps ? "included" : "omitted",
    //     compression: opts.compress ? "terser" : "none",
    //     assets,
    //     system
    // };
    //
    // const bundle = compiler.build({
    //     ...compilerOpts, onDiagnostic({
    //                                       file,
    //                                       start,
    //                                       messageText
    //                                   }) {
    //         if (file !== undefined) {
    //             const {line, character} = ts.getLineAndCharacterOfPosition(file, start!);
    //             const message = ts.flattenDiagnosticMessageText(messageText, "\n");
    //             console.log(`${file.fileName} (${line + 1},${character + 1}): ${message}`);
    //         } else {
    //             console.log(ts.flattenDiagnosticMessageText(messageText, "\n"));
    //         }
    //     }
    // });
    // writeBundle(bundle);
    //
    // function writeBundle(bundle: string): void {
    //     fs.mkdirSync(outputDir, {recursive: true});
    //     fs.writeFileSync(fullOutputPath, bundle!);
    // }
}

console.log(args)
