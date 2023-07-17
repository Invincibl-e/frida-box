import child_process, {
    spawn,
    ChildProcess,
    ChildProcessByStdio,
    ChildProcessWithoutNullStreams,
    StdioNull,
    StdioPipe,
} from "child_process";
import { Readable, Writable } from "stream";
import * as util from "util";

const exec = util.promisify ( child_process.exec );


export type SpawnOptions = child_process.SpawnOptions & { spawn: true }
export type SpawnOptionsWithoutStdio = child_process.SpawnOptionsWithoutStdio & { spawn: true }
export type SpawnOptionsWithStdioTuple
<
    Stdin extends child_process.StdioNull | child_process.StdioPipe,
    Stdout extends child_process.StdioNull | child_process.StdioPipe,
    Stderr extends child_process.StdioNull | child_process.StdioPipe
> = child_process.SpawnOptionsWithStdioTuple<Stdin, Stdout, Stderr> & { spawn: true }
export type ExecOptionsWithString = child_process.ExecOptions & { spawn?: false, throwStdErr: false, encoding?: BufferEncoding }
export type ExecOptionsWithStringThrowStderr = child_process.ExecOptions & { spawn?: false, throwStdErr?: true, encoding?: BufferEncoding }
export type ExecOptionsWithBuffer = child_process.ExecOptions & { spawn?: false, encoding: "buffer" }

export type Options =
    SpawnOptionsWithoutStdio |
    SpawnOptionsWithStdioTuple<StdioNull | StdioPipe, StdioNull | StdioPipe, StdioNull | StdioPipe> |
    SpawnOptions |
    ExecOptionsWithString |
    ExecOptionsWithStringThrowStderr |
    ExecOptionsWithBuffer

export async function run( command: string, options: SpawnOptionsWithoutStdio): Promise<ChildProcessWithoutNullStreams>
export async function run( command: string, options: SpawnOptionsWithStdioTuple<StdioPipe, StdioPipe, StdioPipe>): Promise<ChildProcessByStdio<Writable, Readable, Readable>>
export async function run( command: string, options: SpawnOptionsWithStdioTuple<StdioPipe, StdioPipe, StdioNull>): Promise<ChildProcessByStdio<Writable, Readable, null>>
export async function run( command: string, options: SpawnOptionsWithStdioTuple<StdioPipe, StdioNull, StdioPipe>): Promise<ChildProcessByStdio<Writable, null, Readable>>
export async function run( command: string, options: SpawnOptionsWithStdioTuple<StdioNull, StdioPipe, StdioPipe>): Promise<ChildProcessByStdio<null, Readable, Readable>>
export async function run( command: string, options: SpawnOptionsWithStdioTuple<StdioPipe, StdioNull, StdioNull>): Promise<ChildProcessByStdio<Writable, null, null>>
export async function run( command: string, options: SpawnOptionsWithStdioTuple<StdioNull, StdioPipe, StdioNull>): Promise<ChildProcessByStdio<null, Readable, null>>
export async function run( command: string, options: SpawnOptionsWithStdioTuple<StdioNull, StdioNull, StdioPipe>): Promise<ChildProcessByStdio<null, null, Readable>>
export async function run( command: string, options: SpawnOptionsWithStdioTuple<StdioNull, StdioNull, StdioNull>): Promise<ChildProcessByStdio<null, null, null>>
export async function run( command: string, options: SpawnOptions): Promise<ChildProcess>
export async function run( command: string, options: ExecOptionsWithString): Promise<{ stdout: string; stderr: string; }>
export async function run( command: string, options?: ExecOptionsWithStringThrowStderr): Promise<string>
export async function run( command: string, options: ExecOptionsWithBuffer): Promise<{ stdout: Buffer; stderr: Buffer; }>
export async function run
(
    command: string,
    options?: Options
)
{
    if ( options && options.spawn )
    {
        const [ executable, ...args ] = command.split ( " " );
        return spawn ( executable, args, options );
    }
    else if ( options && options.encoding === "buffer" )
    {
        return await exec ( command, options );
    }
    else
    {
        if ( options && options.throwStdErr === false )
        {
            return await exec ( command, options );
        }
        else
        {
            options = options || {};

            const { stdout, stderr } = await exec ( command, options );
            if ( stderr )
            {
                throw new Error ( stderr );
            }
            const output = `${ stdout }\n${ stderr }`;
            return output.trimEnd ();

        }
    }
}

// async function test () {
//     let output = await run ( "ls -la" )
//     console.log ( output )
// }
//
// test()

