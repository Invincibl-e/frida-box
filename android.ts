import fs from 'fs';
import { mkdir, mkdtemp, rm, rmdir } from 'fs/promises';
import os from 'os';
import * as path from 'path';
import {
    run,
    Options,
    SpawnOptionsWithoutStdio,
    SpawnOptionsWithStdioTuple,
    SpawnOptions,
    ExecOptionsWithString, ExecOptionsWithStringThrowStderr, ExecOptionsWithBuffer
} from "./child_process.js";
import { createRequire } from "module";

import { Device } from "frida";

import { downloadFile } from "./net.js";
import theme from "./style.js";
import { Readable, Writable } from "stream";
import {
    ChildProcess,
    ChildProcessByStdio,
    ChildProcessWithoutNullStreams,
    StdioNull,
    StdioPipe
} from "child_process";


const require = createRequire ( import.meta.url );

const PACKAGE_JSON_FILE_NAME = "package.json"
export function getModuleVersion ( moduleName: string ): string
{
    let modulePath = require.resolve ( moduleName )
    let packageJsonPath = path.join ( modulePath, PACKAGE_JSON_FILE_NAME )
    while ( !fs.existsSync ( packageJsonPath ) && modulePath !== "/" )
    {
        modulePath = path.dirname ( modulePath )
        packageJsonPath = path.join ( modulePath, PACKAGE_JSON_FILE_NAME )
    }

    return require ( packageJsonPath ).version
}


namespace AndroidDebugBridge
{
    export interface Device
    {
        id: string
        status: string
    }
}


export class AndroidDebugBridge
{
    private id: string | null = null
    private readonly commandPrefix: string = "adb"

    constructor ( id: string | null = null )
    {
        this.id = id
        if ( id )
        {
            this.commandPrefix = `adb -s ${ id }`
        }
    }

    async impl ( command: string, options?: Options )
    {
        // @ts-ignore
        return await run ( `${ this.commandPrefix } ${ command }`, options )
    }

    async shell ( command: string, options: SpawnOptionsWithoutStdio): Promise<ChildProcessWithoutNullStreams>
    async shell ( command: string, options: SpawnOptionsWithStdioTuple<StdioPipe, StdioPipe, StdioPipe>): Promise<ChildProcessByStdio<Writable, Readable, Readable>>
    async shell ( command: string, options: SpawnOptionsWithStdioTuple<StdioPipe, StdioPipe, StdioNull>): Promise<ChildProcessByStdio<Writable, Readable, null>>
    async shell ( command: string, options: SpawnOptionsWithStdioTuple<StdioPipe, StdioNull, StdioPipe>): Promise<ChildProcessByStdio<Writable, null, Readable>>
    async shell ( command: string, options: SpawnOptionsWithStdioTuple<StdioNull, StdioPipe, StdioPipe>): Promise<ChildProcessByStdio<null, Readable, Readable>>
    async shell ( command: string, options: SpawnOptionsWithStdioTuple<StdioPipe, StdioNull, StdioNull>): Promise<ChildProcessByStdio<Writable, null, null>>
    async shell ( command: string, options: SpawnOptionsWithStdioTuple<StdioNull, StdioPipe, StdioNull>): Promise<ChildProcessByStdio<null, Readable, null>>
    async shell ( command: string, options: SpawnOptionsWithStdioTuple<StdioNull, StdioNull, StdioPipe>): Promise<ChildProcessByStdio<null, null, Readable>>
    async shell ( command: string, options: SpawnOptionsWithStdioTuple<StdioNull, StdioNull, StdioNull>): Promise<ChildProcessByStdio<null, null, null>>
    async shell ( command: string, options: SpawnOptions): Promise<ChildProcess>
    async shell ( command: string, options: ExecOptionsWithString): Promise<{ stdout: string; stderr: string; }>
    async shell ( command: string, options?: ExecOptionsWithStringThrowStderr): Promise<string>
    async shell ( command: string, options: ExecOptionsWithBuffer): Promise<{ stdout: Buffer; stderr: Buffer; }>
    async shell ( command: string, options?: Options )
    {
        return await this.impl ( `shell ${ command }`, options )
    }

    async push ( source: string, destination: string, options: SpawnOptionsWithoutStdio): Promise<ChildProcessWithoutNullStreams>
    async push ( source: string, destination: string, options: SpawnOptionsWithStdioTuple<StdioPipe, StdioPipe, StdioPipe>): Promise<ChildProcessByStdio<Writable, Readable, Readable>>
    async push ( source: string, destination: string, options: SpawnOptionsWithStdioTuple<StdioPipe, StdioPipe, StdioNull>): Promise<ChildProcessByStdio<Writable, Readable, null>>
    async push ( source: string, destination: string, options: SpawnOptionsWithStdioTuple<StdioPipe, StdioNull, StdioPipe>): Promise<ChildProcessByStdio<Writable, null, Readable>>
    async push ( source: string, destination: string, options: SpawnOptionsWithStdioTuple<StdioNull, StdioPipe, StdioPipe>): Promise<ChildProcessByStdio<null, Readable, Readable>>
    async push ( source: string, destination: string, options: SpawnOptionsWithStdioTuple<StdioPipe, StdioNull, StdioNull>): Promise<ChildProcessByStdio<Writable, null, null>>
    async push ( source: string, destination: string, options: SpawnOptionsWithStdioTuple<StdioNull, StdioPipe, StdioNull>): Promise<ChildProcessByStdio<null, Readable, null>>
    async push ( source: string, destination: string, options: SpawnOptionsWithStdioTuple<StdioNull, StdioNull, StdioPipe>): Promise<ChildProcessByStdio<null, null, Readable>>
    async push ( source: string, destination: string, options: SpawnOptionsWithStdioTuple<StdioNull, StdioNull, StdioNull>): Promise<ChildProcessByStdio<null, null, null>>
    async push ( source: string, destination: string, options: SpawnOptions): Promise<ChildProcess>
    async push ( source: string, destination: string, options: ExecOptionsWithString): Promise<{ stdout: string; stderr: string; }>
    async push ( source: string, destination: string, options?: ExecOptionsWithStringThrowStderr): Promise<string>
    async push ( source: string, destination: string, options: ExecOptionsWithBuffer): Promise<{ stdout: Buffer; stderr: Buffer; }>
    async push ( source: string, destination: string, options?: Options )
    {
        return await this.impl ( `push ${ source } ${ destination }`, options )
    }

    // @ts-ignore
    async devices ( options: SpawnOptionsWithoutStdio): Promise<ChildProcessWithoutNullStreams>
    async devices ( options: SpawnOptionsWithStdioTuple<StdioPipe, StdioPipe, StdioPipe>): Promise<ChildProcessByStdio<Writable, Readable, Readable>>
    async devices ( options: SpawnOptionsWithStdioTuple<StdioPipe, StdioPipe, StdioNull>): Promise<ChildProcessByStdio<Writable, Readable, null>>
    async devices ( options: SpawnOptionsWithStdioTuple<StdioPipe, StdioNull, StdioPipe>): Promise<ChildProcessByStdio<Writable, null, Readable>>
    async devices ( options: SpawnOptionsWithStdioTuple<StdioNull, StdioPipe, StdioPipe>): Promise<ChildProcessByStdio<null, Readable, Readable>>
    async devices ( options: SpawnOptionsWithStdioTuple<StdioPipe, StdioNull, StdioNull>): Promise<ChildProcessByStdio<Writable, null, null>>
    async devices ( options: SpawnOptionsWithStdioTuple<StdioNull, StdioPipe, StdioNull>): Promise<ChildProcessByStdio<null, Readable, null>>
    async devices ( options: SpawnOptionsWithStdioTuple<StdioNull, StdioNull, StdioPipe>): Promise<ChildProcessByStdio<null, null, Readable>>
    async devices ( options: SpawnOptionsWithStdioTuple<StdioNull, StdioNull, StdioNull>): Promise<ChildProcessByStdio<null, null, null>>
    async devices ( options: SpawnOptions): Promise<ChildProcess>
    async devices ( options: ExecOptionsWithString): Promise<{ stdout: string; stderr: string; }>
    async devices ( options?: ExecOptionsWithStringThrowStderr): Promise<AndroidDebugBridge.Device[]>
    async devices ( options: ExecOptionsWithBuffer): Promise<{ stdout: Buffer; stderr: Buffer; }>
    async devices ( options?: Options )
    {
        let result = await this.impl ( "devices", options )
        if ( options?.spawn !== true && options?.encoding !== "buffer" && options?.throwStdErr !== false )
        {
            return ( result as string ).split ( "\n" ).slice ( 1 ).map ( line =>
            {
                let [ id, status ] = line.split ( "\t" )
                return { id, status }
            } )
        }
        return result
    }
}


const abis =
{
    "armeabi": "arm",
    "armeabi-v7a": "arm",
    "arm64-v8a": "arm64",
    "x86": "x86",
    "x86_64": "x86_64"
}

const AndroidTMP = "/data/local/tmp"

export async function downloadAndRunFridaServer ( device: Device )
{
    const adb = new AndroidDebugBridge ( device.id )

    if ( await adb.shell ( "su 0 whoami" ) !== "root" )
    {
        throw new Error ( "Please root your device first." )
    }

    let version = getModuleVersion ( "frida" )
    if ( !version )
    {
        throw new Error ( "Can not find frida package, maybe install frida first." )
    }

    let arch = await adb.shell (`getprop ro.product.cpu.abi` )
    if ( !arch )
    {
        throw new Error ( "Can not find device arch, check \"getprop ro.product.cpu.abi\"." )
    }
    if ( !( arch in abis ) )
    {
        throw new Error ( `Unsupported arch: ${ arch }` )
    }
    // @ts-ignore
    let abi = abis[ arch ]

    let serverName = `frida-server-${ version }-android-${ abi }`
    let compressServerName = `${ serverName }.xz`

    let deviceServerPath = path.join ( AndroidTMP, serverName )

    try
    {
        await adb.shell ( `ls ${ deviceServerPath }` )
    }
    catch ( e )
    {
        if ( e instanceof Error && e.message.includes ( "No such file or directory" ) )
        {
            console.log ( theme.warning ( "Frida server executable not found, downloading..." ) )
            let outputDirectory = await mkdtemp ( path.join ( os.tmpdir (), "frida-server-" ) )
            // await mkdir ( "tmp", { recursive: true } )
            // let outputDirectory = await mkdtemp ( path.join ( "tmp", "frida-server-" ) )
            let serverPath = path.join ( outputDirectory, serverName )
            let downloadPath = path.join ( outputDirectory, compressServerName )

            await downloadFile
            (
                `https://github.com/frida/frida/releases/download/${ version }/${ compressServerName }`,
                downloadPath
            )

            await run ( `xz -d ${ downloadPath }` )

            await adb.push ( serverPath, deviceServerPath )

            await rm ( outputDirectory, { recursive: true } )

            await adb.shell ( `chmod +x ${ deviceServerPath }` )
        }
        else throw e
    }

    console.log ( theme.info ( `Run frida server from ${ deviceServerPath }` ) )
    await adb.shell ( `su 0 ${ deviceServerPath } &`, { spawn: true } )
}