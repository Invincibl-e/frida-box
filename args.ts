import fs from "fs";
import path from "path";

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
			.middleware ( ( argv ) =>
			{
				argv.output = argv.output ?? argv.file?.replace ( /\.ts$/, ".js" ) ?? undefined
			} )
			.check ( ( args ) =>
			{
				if ( !fs.existsSync ( args.file!! ) )
				{
					throw new Error ( `Script file ${ args.file } does not exist` )
				}
				return true
			} )
	} )
	.command ( "run [options] <files...>", "run frida script", ( yargs ) =>
	{
		return yargs
			.option ( "device", {
				alias: "d",
				type: "string",
				description: "connect to device <ID>"
			} )
			.option ( "usb", {
				alias: "u",
				type: "boolean",
				description: "connect to USB device"
			} )
			.option ( "remote", {
				alias: "r",
				type: "string",
				description: "connect to remote device <IP:PORT(default 27042)>",
                coerce: ( arg ) => arg.split ( ":" ).length === 1 ? `${ arg }:27042` : arg
			} )
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
			.positional ( "files", {
				type: "string",
				normalize: true,
				array: true,
				description: "script file"
			} )
			.check ( ( args ) =>
			{
                if ( args.remote && args.usb ) {
                    throw new Error ( "Either --remote or --usb must be specified" )
                }

				if ( !args.pid && !args.name )
				{
					throw new Error ( "Either --pid or --name must be specified" )
				}

				args.files!!.forEach ( ( file ) =>
				{
					if ( !fs.existsSync ( file ) )
					{
						throw new Error ( `Script file ${ args.file } does not exist` )
					}
				} )

				return true
			} )
	} )


export default argsParser.parseSync ()

export interface RunArgs
{
	device?: string;
	remote?: string;
	usb?: boolean;
	pid?: number;
	name?: string;
	spawn?: boolean;
	pause?: boolean;
	files: string[];
}

export interface BuildArgs
{
	file: string
	output: string
	sourceMaps: boolean
	compress: boolean
}
