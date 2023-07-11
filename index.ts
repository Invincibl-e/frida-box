import args, { BuildArgs, RunArgs } from "./args.js"
import { build } from "./build.js"
import { ConsoleApplication } from "./console.js";
import { filterDevice } from "./device.js";


if ( args._.includes ( "build" ) )
{
	build ( args as unknown as BuildArgs )
}
else if ( args._.includes ( "run" ) )
{
    filterDevice ( args as unknown as RunArgs ).then ( devices =>
    {
        if ( devices.length === 0 )
        {
            console.error ( "No devices found." )
            return
        }
        else if ( devices.length > 1 )
        {
            console.error ( "Multiple devices found, please specify one." )
            return
        }

        let application = new ConsoleApplication ( devices[ 0 ] )
        application.runWithArgs ( args as unknown as RunArgs ).then( () =>
        {

        } )
    } )
}
