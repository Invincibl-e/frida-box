import yargs from "yargs/yargs";
import {hideBin} from "yargs/helpers";


const program = yargs(hideBin(process.argv)).usage("Usage: $0 <command> [options]")
    .command("build [options] <file>", "build frida script", (yargs) => {
        return yargs.option("output", {
            alias: "o",
            type: "string",
            description: "write output to <file>"
        }).option("source-maps", {
            alias: "s",
            type: "boolean",
            description: "emit source-maps"
        }).option("compress", {
            alias: "c",
            type: "boolean",
            description: "compress using terser"
        }).positional("file", {
            type: "string",
            normalize: true,
            description: "script file"
        })
    })
    .command("run [options] <file>", "run frida script", (yargs) => {
        return yargs.option("pid", {
            alias: "p",
            type: "number",
            conflicts: ["spawn", "name"],
            description: "attach process with PID"
        }).option("name", {
            alias: "n",
            type: "string",
            normalize: true,
            conflicts: ["pid"],
            description: "attach process with process name or path"
        }).option("spawn", {
            alias: "s",
            type: "boolean",
            conflicts: ["pid"],
            description: "start process if not running"
        }).option("pause", {
            type: "boolean",
            description: "pause process after attaching"
        }).positional("file", {
            type: "string",
            normalize: true,
            description: "script file"
        }).check((argv) => {
            if(argv.pid && ( argv.spawn || argv.name ) ) {
                throw new Error("--pid cannot be used with --spawn or --name")
            }
            if(argv.spawn && !argv.name) {
                throw new Error("--spawn requires --name")
            }
            if(!argv.pid && !argv.name) {
                throw new Error("Either --pid or --name must be specified")
            }
            return true
        })
    }).demandCommand().recommendCommands().strict().showHelpOnFail(true).version(false)

export default program.argv