import * as fs from "fs/promises";
import * as readline from 'readline';

import { Device } from 'frida';
import { Session } from 'frida';
import { Script, ScriptMessageHandler } from "frida";
import { MessageType, Message, ErrorMessage, SendMessage } from "frida";
import { Crash } from "frida/dist/crash";
import { SessionDetachReason } from "frida/dist/session";

import { RunArgs } from "./args.js";


export class ConsoleApplication
{
	private static print ( message: SendMessage )
	{
		console.log ( message.payload );
	}

	private static printError ( message: ErrorMessage )
	{
		console.error ( message.description );
		console.error ( message.stack );
		console.error ( `on ${ message.fileName }:${ message.lineNumber }:${ message.columnNumber }` );
	}

	private device: Device;

	private session: Session | null = null;

	private scripts: Script[] = [];

	constructor ( device: Device )
	{
		this.device = device;
	}

	private onMessage ( message: Message, data: Buffer | null )
	{
		if ( message.type === MessageType.Send )
		{
			ConsoleApplication.print ( message )
		}
		else if ( message.type === MessageType.Error )
		{
			ConsoleApplication.printError ( message )
		}
	}

	private onDetached ( reason: SessionDetachReason, crash: Crash | null )
	{
		console.log ( `Session detached: ${ reason }` );
		if ( crash !== null )
		{
			console.log ( crash.report );
		}
	}

	public async loadScript ( scriptPath: string )
	{
		const scriptCode = await fs.readFile ( scriptPath, 'utf-8' );
		const script = await this.session!!.createScript ( scriptCode );
		script.message.connect ( this.onMessage.bind ( this ) );
		this.scripts.push ( script );
	}

	public async run ( pid: number, scriptPaths: string[] )
	{
		this.session = await this.device.attach ( pid )
		for ( const scriptPath of scriptPaths )
		{
			await this.loadScript ( scriptPath )
		}

		readline.emitKeypressEvents ( process.stdin );

		this.session.detached.connect ( this.onDetached.bind ( this ) );

		await this.device.resume ( pid );
	}

	public async runWithArgs ( args: RunArgs )
	{
		if ( args.spawn )
		{
			const pid = await this.device.spawn ( args.name!! )
			await this.run ( pid, args.files )
		}
		else
		{
			let pid = args.pid
			if ( args.name )
			{
				let processes = await this.device.enumerateProcesses ()
				let process = processes.find ( ( process ) => process.name === args.name )
				if ( process === undefined )
				{
					throw new Error ( `Process "${ args.name }" not found` )
				}
				pid = process.pid
			}

			await this.run ( pid!!, args.files )
		}
	}
}

// const app = new ConsoleApplication();
// app.run();
