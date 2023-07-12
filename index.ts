import chalk from "chalk"

import args, { BuildArgs, RunArgs } from "./args.js"
import { build } from "./build.js"
import { ConsoleApplication } from "./console.js";
import { filterDevice } from "./device.js";

import theme from "./style.js";
import { AndroidDebugBridge, downloadAndRunFridaServer } from "./android.js";
import { ifError } from "assert";


if ( args._.includes ( "build" ) )
{
    build ( args as unknown as BuildArgs ).catch ( e =>
    {
        console.error ( theme.error ( e ) )
    } )
}
else if ( args._.includes ( "run" ) )
{
    ( async () =>
    {
        let devices = await filterDevice ( args as unknown as RunArgs )
        if ( devices.length === 0 )
        {
            throw new Error ( "No devices found." )
        }
        else if ( devices.length > 1 )
        {
            throw new Error ( "Multiple devices found, please specify one." )
        }

        let application = new ConsoleApplication ( devices[ 0 ] )
        async function run ()
        {
            await application.runWithArgs ( args as unknown as RunArgs )
        }

        try
        {
            await run ()
        }
        catch ( e )
        {
            if ( e instanceof Error )
            {
                if ( !e.message.includes ( "Need Gadget to attach on jailed Android" ) ) throw e
            }
            else throw e

            let adb = new AndroidDebugBridge ()
            let androidDevices = await adb.devices ()

            androidDevices = androidDevices.filter ( device =>
            {
                return device.status === "device" && device.id === devices [ 0 ].id
            } )

            if ( androidDevices.length < 1 ) throw new Error ( `No Android devices ${ devices [ 0 ].id } found.` )
            else if ( androidDevices.length > 1 ) throw new Error ( `Multiple Android devices ${ devices [ 0 ].id } found.` )

            await downloadAndRunFridaServer ( devices[ 0 ] )
        }
    }
    ) ().catch ( e =>
    {
        console.error ( theme.error ( e ) )
    } )
}