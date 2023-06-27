import yargs from "yargs";
import { hideBin } from "yargs/helpers";


const argsParser = yargs ( hideBin ( process.argv ) )
	.usage ( "Usage: $0 <command> [options]" )
	.strict ()
	.demandCommand ()
	.recommendCommands ()
	.command ( "build [options] <file>", "build frida script", ( yargs ) =>
	{
		return yargs
			.option ( "output", {
				alias: "o",
				type: "string",
				description: "write output to <file>.js"
			} )
			.option ( "source-maps", {
				alias: "s",
				type: "boolean",
				description: "emit source-maps"
			} )
			.option ( "compress", {
				alias: "c",
				type: "boolean",
				description: "compress using terser"
			} )
			.positional ( "file", {
				type: "string",
				normalize: true,
				description: "script file"
			} )
			.middleware ( ( argv ) => {
				argv.output = argv.output ?? argv.file?.replace ( /\.ts$/, ".js" ) ?? undefined
			} )
	} )
	.command ( "run [options] <file>", "run frida script", ( yargs ) =>
	{
		return yargs
			.option ( "pid", {
				alias: "p",
				type: "number",
				conflicts: [ "spawn", "name" ],
				description: "attach process with PID"
			} )
			.option ( "name", {
				alias: "n",
				type: "string",
				normalize: true,
				conflicts: [ "pid" ],
				description: "attach process with process name or path"
			} )
			.option ( "spawn", {
				alias: "s",
				type: "boolean",
				conflicts: [ "pid" ],
				implies: "name",
				description: "start process if not running"
			} )
			.option ( "pause", {
				type: "boolean",
				description: "pause process after attaching"
			} )
			.positional ( "file", {
				type: "string",
				normalize: true,
				description: "script file"
			} )
			.check ( ( args ) =>
			{
				if ( !args.pid && !args.name )
				{
					throw new Error ( "Either --pid or --name must be specified" )
				}
				return true
			} )
	} )


export default argsParser.parseSync ()
