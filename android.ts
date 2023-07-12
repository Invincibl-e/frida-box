import fs from 'fs';
import { mkdir, mkdtemp, rm, rmdir } from 'fs/promises';
import os from 'os';
import * as path from 'path';
import { promisify } from "util";
import child_process from "child_process";
import { createRequire } from "module";

import { Device } from "frida";

import { downloadFile } from "./net.js";
import theme from "./style.js";


const exec = promisify ( child_process.exec );
const spawn = child_process.spawn;

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

    export type Options = child_process.ExecOptions & child_process.SpawnOptions &
    {
        spawn?: boolean
        throwStdErr?: boolean
    }
}

export class AndroidDebugBridge
{
    private id: string | null = null
    private readonly commandPrefix: string = "adb"

    static DEFAULT_OPTIONS: AndroidDebugBridge.Options = {
        spawn: false,
        throwStdErr: true
    }

    constructor ( id: string | null = null )
    {
        this.id = id
        if ( id )
        {
            this.commandPrefix = `adb -s ${ id }`
        }
    }

    private runCommand ( command: string, options?: AndroidDebugBridge.Options )
    {
        options = { ...AndroidDebugBridge.DEFAULT_OPTIONS, ...options }

        if ( options.spawn )
        {
            let [ executable, ...args ] = `${ this.commandPrefix } ${ command }`.split(" ")
            spawn( executable, args, { ...options, env: process.env } )
        }
        else
        {
            return exec ( `${ this.commandPrefix } ${ command }`, { encoding: "utf-8" } )
            .then ( ( { stdout, stderr } ) =>
            {
                let output = `${ stdout }\n${ stderr }`
                if ( options?.throwStdErr && stderr )
                {
                    throw new Error ( stderr )
                }
                return output.trimEnd ()
            } )
        }
    }

    shell ( command: string, options?: AndroidDebugBridge.Options )
    {
        return this.runCommand ( `shell ${ command }`, options )
    }

    push ( source: string, destination: string, options?: AndroidDebugBridge.Options )
    {
        return this.runCommand ( `push ${ source } ${ destination }`, options )
    }

    devices ( options?: AndroidDebugBridge.Options ): Promise<AndroidDebugBridge.Device[]>
    {
        return this.runCommand ( "devices", options )!!.then ( stdout =>
        {
            return stdout.split ( "\n" ).slice ( 1 ).map ( line =>
            {
                let [ id, status ] = line.split ( "\t" )
                return { id, status }
            } )
        } )
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
        await adb.shell ( `ls ${ deviceServerPath }`, { throwStdErr: false } )
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

            await exec ( `xz -d ${ downloadPath }` )

            await adb.push ( serverPath, deviceServerPath )

            await rm ( outputDirectory, { recursive: true } )

            await adb.shell ( `chmod +x ${ deviceServerPath }` )
        }
        else throw e
    }

    console.log ( theme.info ( `Run frida server from ${ deviceServerPath }` ) )
    await adb.shell ( `su 0 ${ deviceServerPath } &`, { spawn: true, stdio: "pipe" } )
}