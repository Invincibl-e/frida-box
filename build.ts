import fs from "fs/promises"
import path from "path"

import { getNodeSystem } from "frida-compile/dist/system/node.js"
import * as compiler from "frida-compile"
import ts from "frida-compile/ext/typescript.js"

import { BuildArgs } from "./args.js"


export async function build ( args: BuildArgs )
{
	const projectRoot: string = process.cwd ()
	const entrypoint: string = args.file as string
	const outputPath: string = args.output as string

	const fullOutputPath = path.isAbsolute ( outputPath ) ? outputPath : path.join ( projectRoot, outputPath )
	const outputDir = path.dirname ( fullOutputPath )

	const system = getNodeSystem ()
	const assets = compiler.queryDefaultAssets ( projectRoot, system )

	const compilerOpts: compiler.Options = {
		projectRoot,
		entrypoint,
		sourceMaps: args.sourceMaps ? "included" : "omitted",
		compression: args.compress ? "terser" : "none",
		assets,
		system
	}

	const bundle = compiler.build ( {
		...compilerOpts,
		onDiagnostic (
		{
			file,
			start,
			messageText
		} )
		{
			if ( file !== undefined )
			{
				const { line, character } = ts.getLineAndCharacterOfPosition ( file, start! )
				const message = ts.flattenDiagnosticMessageText ( messageText, "\n" )
				console.log ( `${ file.fileName } (${ line + 1 },${ character + 1 }): ${ message }` )
			}
			else
			{
				console.log ( ts.flattenDiagnosticMessageText ( messageText, "\n" ) )
			}
		}
	} )

	await fs.mkdir ( outputDir, { recursive: true } )
	return fs.writeFile ( fullOutputPath, bundle! )
}
